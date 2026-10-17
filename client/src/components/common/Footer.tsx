import React, { useState } from 'react';
import { HeartHandshake, Heart, ShieldAlert, HelpCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'faq' | 'terms' | 'privacy' | null>(null);

  return (
    <footer className="bg-slate-950/85 backdrop-blur-xl text-slate-300 pt-16 pb-12 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Food<span className="text-amber-400">Bridge</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-6">
              Bridging the gap between surplus food from hotels, restaurants, bakeries, and catered events with verified shelters, orphanages, and community kitchens in need.
            </p>
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-lg w-fit">
              <ShieldAlert className="w-4 h-4 mr-1 text-emerald-400" />
              <span>100% Free Food Sharing • Zero Waste Mission</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/login?role=donor" className="hover:text-white transition">
                  Donate Surplus Food
                </Link>
              </li>
              <li>
                <Link to="/login?role=receiver" className="hover:text-white transition">
                  Find & Book Food
                </Link>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-white transition">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/#available-food" className="hover:text-white transition">
                  Live Food Discovery
                </a>
              </li>
              <li>
                <a href="/#impact" className="hover:text-white transition">
                  Verified Impact Metrics
                </a>
              </li>
            </ul>
          </div>

          {/* Resources & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Resources</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => setActiveModal('faq')}
                  className="hover:text-white transition text-left flex items-center"
                >
                  <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('terms')}
                  className="hover:text-white transition text-left"
                >
                  Food Safety Guidelines
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('privacy')}
                  className="hover:text-white transition text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('terms')}
                  className="hover:text-white transition text-left"
                >
                  Terms & Conditions
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Food Bridge Platform. Open food donation initiative.</p>
          <p className="flex items-center mt-2 sm:mt-0">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 mx-1 fill-red-500" /> for community nutrition and zero food waste.
          </p>
        </div>
      </div>

      {/* Information Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {activeModal === 'faq' && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Frequently Asked Questions</h3>
                <div className="space-y-4 text-xs leading-relaxed">
                  <div>
                    <h4 className="font-bold text-emerald-400 text-sm">Who can donate food on Food Bridge?</h4>
                    <p className="text-slate-300 mt-1">Any commercial food business including restaurants, hotel banquet halls, catering teams, bakeries, corporate cafeterias, and certified individuals who have surplus hygienic food.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-400 text-sm">Who can receive or book donations?</h4>
                    <p className="text-slate-300 mt-1">Verified NGOs, children homes, homeless shelters, community kitchens, eldercare centers, and verified local volunteers supporting communities in need.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-400 text-sm">What happens when a donation expires?</h4>
                    <p className="text-slate-300 mt-1">Food Bridge automatically archives expired food listings on the server, removing them from receiver discovery immediately to guarantee food freshness and safety.</p>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'terms' && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Food Safety & Quality Guidelines</h3>
                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <p>1. <strong>Temperature Management:</strong> Cooked meals must be packaged hot (above 60°C) or chilled promptly below 4°C.</p>
                  <p>2. <strong>Packaging:</strong> All food items must be secured in clean, food-grade containers or bags suitable for safe transport.</p>
                  <p>3. <strong>Hygienic Handling:</strong> Donors must confirm that all food is untouched by guests and prepared in sanitized kitchens.</p>
                  <p>4. <strong>Timely Pickup:</strong> Receivers are requested to arrive within the specified pickup window with appropriate insulated carrying bags.</p>
                </div>
              </div>
            )}

            {activeModal === 'privacy' && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Privacy & Security</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Food Bridge respects your privacy. Receiver personal phone numbers and private home locations are never publicly disclosed without authorization. Coordinates are strictly used to compute route directions and distance estimations for food pickups.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
};
