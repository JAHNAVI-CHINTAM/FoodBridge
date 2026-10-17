import { dbService, sweepExpiredDonations } from '../src/db.js';
import { Donation } from '../src/types.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('===============================================================');
  console.log(' FOOD BRIDGE AUTOMATED TEST SUITE: END-TO-END & CRITICAL LOGIC');
  console.log('===============================================================');

  // --- SCENARIO A: DONOR JOURNEY ---
  console.log('\n[Scenario A: Donor Journey]');
  const donorEmail = `donor_${Date.now()}@test.com`;
  const donorProfile = dbService.createProfile({
    id: `donor-${Date.now()}`,
    full_name: 'Test Executive Chef',
    email: donorEmail,
    phone: '+91 99999 11111',
    avatar_url: null,
    address: 'Residency Road, Bengaluru',
    organization_name: 'The Orchid Banquets',
    active_role: 'donor',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }, 'donor');

  assert(Boolean(donorProfile && donorProfile.id), 'Donor account created in database');
  assert(donorProfile.active_role === 'donor', 'Assigned donor role correctly');

  // Create a food donation
  const now = new Date();
  const testDonation = dbService.createDonation({
    donor_id: donorProfile.id,
    food_name: 'Fragrant Vegetable Pulao & Raita',
    category: 'Cooked Meals',
    description: 'Freshly prepared vegetarian pulao made with basmati rice and garden veggies.',
    image_urls: ['https://example.com/pulao.jpg'],
    total_quantity: 25,
    quantity_unit: 'Packets',
    preparation_time: now.toISOString(),
    expiry_time: new Date(now.getTime() + 10 * 3600 * 1000).toISOString(),
    pickup_address: 'The Orchid Banquets, Gate 2, Bengaluru',
    latitude: 12.9716,
    longitude: 77.5946,
    pickup_instructions: 'Kitchen dispatch counter',
    food_safety_confirmed: true
  });

  assert(testDonation.status === 'available', 'Initial donation status is "available"');
  assert(testDonation.available_quantity === 25, 'Available quantity matches total quantity (25 packets)');

  const donorListings = dbService.getDonations({ donor_id: donorProfile.id });
  assert(donorListings.some(d => d.id === testDonation.id), 'Listing appears under donor profile');

  // --- SCENARIO B: RECEIVER JOURNEY ---
  console.log('\n[Scenario B: Receiver Journey]');
  const receiverEmail = `receiver_${Date.now()}@test.com`;
  const receiverProfile = dbService.createProfile({
    id: `receiver-${Date.now()}`,
    full_name: 'Test Shelter Lead',
    email: receiverEmail,
    phone: '+91 88888 22222',
    avatar_url: null,
    address: 'Care Foundation, Koramangala, Bengaluru',
    organization_name: 'Grace Community Shelter',
    active_role: 'receiver',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }, 'receiver');

  assert(Boolean(receiverProfile && receiverProfile.id), 'Receiver account created in database');

  // Browse available feed
  const availableFeed = dbService.getDonations({ status: ['available', 'partially_booked'] });
  assert(availableFeed.some(d => d.id === testDonation.id), 'Receiver can discover the newly listed donation');

  // Filter by category
  const categoryFilter = dbService.getDonations({ category: 'Cooked Meals' });
  assert(categoryFilter.every(d => d.category === 'Cooked Meals'), 'Category filter returns only Cooked Meals');

  // --- SCENARIO C: BOOKING CONSISTENCY & CONCURRENCY ---
  console.log('\n[Scenario C: Booking Consistency & Race Conditions]');

  // Step 1: Create a single donation with exactly 10 packets
  const strictDonation = dbService.createDonation({
    donor_id: donorProfile.id,
    food_name: 'Ten Packets Test Curry',
    category: 'Cooked Meals',
    description: 'Exactly 10 packets',
    image_urls: ['https://example.com/test.jpg'],
    total_quantity: 10,
    quantity_unit: 'Packets',
    expiry_time: new Date(now.getTime() + 6 * 3600 * 1000).toISOString(),
    pickup_address: 'Bangalore Center',
    latitude: 12.9716,
    longitude: 77.5946,
    pickup_instructions: 'Pickup fast',
    food_safety_confirmed: true
  });

  // Step 2: Receiver A books all 10 packets
  const bookingFull = dbService.bookFoodAtomic({
    donation_id: strictDonation.id,
    receiver_id: receiverProfile.id,
    quantity: 10,
    receiver_notes: 'Claiming all 10'
  });

  assert(bookingFull.success === true, 'Receiver A successfully booked all 10 packets');
  assert(bookingFull.remaining_available === 0, 'Remaining available quantity dropped to 0');
  assert(bookingFull.donation_status === 'booked', 'Donation status atomically changed to "booked"');
  assert(bookingFull.booking.booking_reference.startsWith('FB-'), 'Generated human-readable unique reference ID');

  // Step 3: Verify Receiver B can no longer see it in available feed
  const activeFeedAfter = dbService.getDonations({ status: ['available', 'partially_booked'] });
  assert(!activeFeedAfter.some(d => d.id === strictDonation.id), 'Fully booked listing automatically removed from available feed');

  // Step 4: Another receiver attempts to book the same donation -> must fail
  let receiverBFailureCaught = false;
  try {
    dbService.bookFoodAtomic({
      donation_id: strictDonation.id,
      receiver_id: '33333333-3333-3333-3333-333333333333',
      quantity: 1
    });
  } catch (err: any) {
    receiverBFailureCaught = true;
    assert(true, 'Attempt by Receiver B to book fully reserved food was rejected cleanly', err.message);
  }
  assert(receiverBFailureCaught, 'Double-booking prevention verified');

  // Step 5: Partial reservation testing
  const partialDonation = dbService.createDonation({
    donor_id: donorProfile.id,
    food_name: 'Bakery Rolls (20 items)',
    category: 'Bakery',
    description: 'Fresh rolls',
    image_urls: ['https://example.com/rolls.jpg'],
    total_quantity: 20,
    quantity_unit: 'Items',
    expiry_time: new Date(now.getTime() + 12 * 3600 * 1000).toISOString(),
    pickup_address: 'Indiranagar Hub',
    latitude: 12.9784,
    longitude: 77.6408,
    pickup_instructions: 'Front desk',
    food_safety_confirmed: true
  });

  const partBooking1 = dbService.bookFoodAtomic({
    donation_id: partialDonation.id,
    receiver_id: receiverProfile.id,
    quantity: 6
  });

  assert(partBooking1.remaining_available === 14, 'Partial reservation: 20 - 6 = 14 items remaining');
  assert(partBooking1.donation_status === 'partially_booked', 'Status updated to "partially_booked"');

  // Overselling protection: Request 15 when only 14 remain
  let oversellPrevented = false;
  try {
    dbService.bookFoodAtomic({
      donation_id: partialDonation.id,
      receiver_id: receiverProfile.id,
      quantity: 15
    });
  } catch (err: any) {
    oversellPrevented = true;
    assert(true, 'Oversell attempt (> available quantity) was rejected with error');
  }
  assert(oversellPrevented, 'Oversell prevention constraint verified');

  // Reservation cancellation & inventory restoration
  const cancelResult = dbService.cancelBookingAtomic(
    partBooking1.booking.id,
    receiverProfile.id,
    'Transport delay'
  );
  assert(cancelResult.success === true, 'Booking cancelled successfully');
  const restoredDonation = dbService.getDonationById(partialDonation.id);
  assert(restoredDonation?.available_quantity === 20, 'Reserved quantity safely restored to donation available inventory (20 items)');
  assert(restoredDonation?.status === 'available', 'Donation status restored back to "available"');

  // --- SCENARIO D: EXPIRY AUTOMATION & ROLE SECURITY ---
  console.log('\n[Scenario D: Expiry Automation & Security]');

  // Create an expired donation
  const expiredDonation = dbService.createDonation({
    donor_id: donorProfile.id,
    food_name: 'Already Overdue Meal Test',
    category: 'Cooked Meals',
    description: 'Should not be bookable',
    image_urls: ['https://example.com/exp.jpg'],
    total_quantity: 10,
    quantity_unit: 'Packets',
    expiry_time: new Date(now.getTime() + 1000).toISOString(), // expires immediately
    pickup_address: 'City Center',
    latitude: 12.9716,
    longitude: 77.5946,
    pickup_instructions: 'Test',
    food_safety_confirmed: true
  });

  // Update persisted expiry to the past
  dbService.updateDonation(expiredDonation.id, donorProfile.id, {
    expiry_time: new Date(now.getTime() - 3600 * 1000).toISOString()
  });
  // Sweep to archive it
  sweepExpiredDonations();

  let expiredBookingBlocked = false;
  try {
    dbService.bookFoodAtomic({
      donation_id: expiredDonation.id,
      receiver_id: receiverProfile.id,
      quantity: 2
    });
  } catch (err: any) {
    expiredBookingBlocked = true;
    assert(true, 'Attempt to book expired food donation was blocked: ' + err.message);
  }
  assert(expiredBookingBlocked, 'Expiry enforcement verified');

  // Donor cannot edit another donor's listing
  let unauthorizedEditBlocked = false;
  try {
    dbService.updateDonation(testDonation.id, 'unauthorized-other-donor-id', {
      total_quantity: 99
    });
  } catch (err) {
    unauthorizedEditBlocked = true;
    assert(true, 'Unauthorized donor edit blocked');
  }
  assert(unauthorizedEditBlocked, 'Multi-tenant authorization isolation verified');

  // Role switching
  const switched = dbService.switchRole(donorProfile.id, 'receiver');
  assert(switched.activeRole === 'receiver', 'Switched user active role to "receiver" safely');
  const switchedBack = dbService.switchRole(donorProfile.id, 'donor');
  assert(switchedBack.activeRole === 'donor', 'Switched user back to "donor"');

  // Verify in-app notifications created
  const donorNotifs = dbService.getNotifications(donorProfile.id);
  assert(donorNotifs.length > 0, `Donor received in-app notifications (count: ${donorNotifs.length})`);

  // Clean up test entities so they do not pollute live database or create duplicate items
  dbService.cleanupTestData(
    [donorProfile.id, receiverProfile.id],
    [testDonation.id, strictDonation.id, partialDonation.id, expiredDonation.id]
  );

  console.log('\n===============================================================');
  console.log(` TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test suite failed with unexpected error:', err);
  process.exit(1);
});
