import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Calendar, 
  ShieldCheck, 
  ArrowLeftRight, 
  Edit3, 
  Lock, 
  LogOut, 
  Check, 
  X,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, activeRole, logout, switchRole, updateProfile } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [phoneContactOptIn, setPhoneContactOptIn] = useState(user?.phone_contact_opt_in ?? true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(user?.whatsapp_enabled ?? true);
  const [organizationName, setOrganizationName] = useState(user?.organization_name || '');
  const [address, setAddress] = useState(user?.address || '');

  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Please sign in to view your profile.
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        phone_contact_opt_in: phoneContactOptIn,
        whatsapp_enabled: whatsappEnabled,
        organization_name: organizationName.trim() || null,
        address: address.trim() || null
      });
      setIsEditing(false);
      addToast('success', 'Profile Updated', 'Your profile and contact settings have been saved.');
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleSwitch = async (targetRole: 'donor' | 'receiver') => {
    try {
      await switchRole(targetRole);
      addToast('success', 'Dashboard Switched', `Active view is now set to ${targetRole}.`);
      navigate(targetRole === 'donor' ? '/donor' : '/receiver');
    } catch (err: any) {
      addToast('error', 'Switch Error', err.message);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      addToast('error', 'Password Too Short', 'New password must be at least 6 characters.');
      return;
    }
    setChangePasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    addToast('success', 'Password Updated', 'Your password was changed successfully.');
  };

  const cleanPhone = (user.phone || '').replace(/[^0-9]/g, '');

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-white relative z-10">
      {/* Profile Overview Card */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800/90 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 pb-8 border-b border-slate-800">
          <img
            src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.full_name)}`}
            alt={user.full_name}
            className="w-24 h-24 rounded-3xl object-cover bg-emerald-950 border-2 border-emerald-500/50 shadow-md"
          />

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">{user.full_name}</h1>
                <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
              </div>

              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {user.active_role} Account
                </span>
              </div>
            </div>

            {user.organization_name && (
              <p className="text-xs font-bold text-emerald-400 flex items-center justify-center sm:justify-start mt-2">
                <Building2 className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
                <span>{user.organization_name}</span>
              </p>
            )}

            <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start mt-2">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              Member since {new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Edit or Details View */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Personal & Organization Details</h3>
              <p className="text-xs text-slate-400">Contact number and communication preferences for food coordination</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-400 hover:text-white bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800 px-3.5 py-2 rounded-xl transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Phone Number (Contact / WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Organization Name</label>
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Pickup / Drop Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
              </div>

              {/* Phone Contact & Communication Options */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center">
                  <Phone className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  <span>Phone Number & Contact Opt-In Settings</span>
                </h4>
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={phoneContactOptIn}
                    onChange={(e) => setPhoneContactOptIn(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-700 bg-slate-950"
                  />
                  <span className="text-xs text-slate-300 leading-relaxed font-medium">
                    <strong className="text-white">Enable Direct Phone Contact:</strong> Share my phone number with verified food partners upon confirmed bookings so we can coordinate arrival, loading bay directions, and gate access.
                  </span>
                </label>
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappEnabled}
                    onChange={(e) => setWhatsappEnabled(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-700 bg-slate-950"
                  />
                  <span className="text-xs text-slate-300 leading-relaxed font-medium">
                    <strong className="text-white">Enable WhatsApp Quick-Messaging:</strong> Allow verified shelter drivers or kitchen coordinators to message me on WhatsApp regarding active pickups.
                  </span>
                </label>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-300 bg-slate-800 rounded-xl hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-md transition"
                >
                  {isSaving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Email Address</p>
                  <p className="font-bold text-white">{user.email}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Organization</p>
                  <p className="font-bold text-white">{user.organization_name || 'Individual'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1 sm:col-span-2">
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Address</p>
                  <p className="font-bold text-white">{user.address || 'Bengaluru, Karnataka'}</p>
                </div>
              </div>

              {/* Prominent Phone Number & Quick Contact Display */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Primary Contact Number
                    </span>
                    {user.phone ? (
                      user.phone_contact_opt_in !== false ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          Direct Coordination Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                          Phone Kept Private (Opted Out)
                        </span>
                      )
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                        Not Configured
                      </span>
                    )}
                  </div>

                  <h4 className="text-lg font-black text-white mt-1 flex items-center">
                    <Phone className="w-4 h-4 text-emerald-400 mr-2" />
                    <span>{user.phone || 'No phone number added'}</span>
                  </h4>

                  <p className="text-xs text-slate-400 mt-0.5">
                    {user.phone ? (
                      user.phone_contact_opt_in !== false
                        ? 'Shared with verified donors and receivers on confirmed reservations for pickup coordination.'
                        : 'Private — other users will coordinate via Food Bridge notifications only.'
                    ) : (
                      'Add your contact number so pickup coordinators and donors can reach you during delivery.'
                    )}
                  </p>
                </div>

                {user.phone ? (
                  <div className="flex items-center space-x-2">
                    <a
                      href={`tel:${cleanPhone}`}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm flex items-center space-x-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Test Call</span>
                    </a>
                    {user.whatsapp_enabled !== false && cleanPhone.length >= 10 && (
                      <a
                        href={`https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-sm flex items-center space-x-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm"
                  >
                    Add Phone Number
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Switch Account Role Card */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800/90 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800 mb-2">
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Multi-Role Access Control</span>
            </div>
            <h3 className="text-lg font-black text-white">Switch Account Role</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
              Food Bridge supports authorized role switching between Food Donor (listing surplus items) and Receiver (booking food for shelters), preserving all your data under one account.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`p-4 rounded-2xl border-2 transition ${
            activeRole === 'donor'
              ? 'border-emerald-500 bg-emerald-950/40 text-white'
              : 'border-slate-800 bg-slate-950/60 text-white'
          }`}>
            <h4 className="font-bold text-sm text-white">Donor Mode</h4>
            <p className="text-xs text-slate-400 mt-0.5">Post and manage food donations.</p>
            {activeRole === 'donor' ? (
              <span className="inline-flex items-center mt-3 text-xs font-bold text-emerald-400">
                <Check className="w-4 h-4 mr-1" /> Active Dashboard
              </span>
            ) : (
              <button
                onClick={() => handleRoleSwitch('donor')}
                className="mt-3 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition"
              >
                Switch to Donor
              </button>
            )}
          </div>

          <div className={`p-4 rounded-2xl border-2 transition ${
            activeRole === 'receiver'
              ? 'border-amber-500 bg-amber-950/40 text-white'
              : 'border-slate-800 bg-slate-950/60 text-white'
          }`}>
            <h4 className="font-bold text-sm text-white">Receiver Mode</h4>
            <p className="text-xs text-slate-400 mt-0.5">Discover and reserve available meals.</p>
            {activeRole === 'receiver' ? (
              <span className="inline-flex items-center mt-3 text-xs font-bold text-amber-400">
                <Check className="w-4 h-4 mr-1" /> Active Dashboard
              </span>
            ) : (
              <button
                onClick={() => handleRoleSwitch('receiver')}
                className="mt-3 px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition"
              >
                Switch to Receiver
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Security & Password */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800/90 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Account Security</h3>
          <p className="text-xs text-slate-400 mt-0.5">Change your password or sign out of active browser sessions.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setChangePasswordModal(true)}
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-white/10 text-xs font-bold text-slate-200 transition flex items-center space-x-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800 text-xs font-bold text-rose-300 transition flex items-center space-x-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Change Password Dialog */}
      {changePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-800 relative text-white">
            <h3 className="text-base font-bold text-white mb-1">Change Account Password</h3>
            <p className="text-xs text-slate-400 mb-4">Enter your current password and your new password.</p>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setChangePasswordModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
