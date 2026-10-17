import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationDropdown } from './NotificationDropdown';
import { 
  HeartHandshake, 
  Bell, 
  User, 
  LogOut, 
  ArrowLeftRight, 
  PlusCircle, 
  Search, 
  Menu, 
  X,
  ShieldCheck,
  ChevronDown,
  Building
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, activeRole, isAuthenticated, logout, switchRole } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSwitch = async () => {
    const nextRole = activeRole === 'donor' ? 'receiver' : 'donor';
    await switchRole(nextRole);
    navigate(nextRole === 'donor' ? '/donor' : '/receiver');
  };

  const isCurrentActive = (path: string) => location.pathname === path;

  const isLanding = location.pathname === '/';

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-200 bg-slate-950/65 border-b border-slate-800/80 text-white backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-emerald-400 transition">
                Food<span className="text-amber-400">Bridge</span>
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                Direct
              </span>
            </div>
            <p className="text-[11px] font-medium hidden sm:block text-slate-400">Share Food • Spread Hope</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          <Link
            to="/"
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
              isCurrentActive('/') 
                ? 'text-emerald-400 bg-white/10' 
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Home
          </Link>
          <a
            href="/#how-it-works"
            className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            How It Works
          </a>
          <a
            href="/#available-food"
            className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            Available Food
          </a>
          <a
            href="/#impact"
            className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            Our Impact
          </a>
          <a
            href="/#about"
            className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            About Us
          </a>
          <a
            href="/#contact"
            className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            Contact
          </a>
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {isAuthenticated && user ? (
            <>
              {/* Role Switcher Pill */}
              <button
                onClick={handleRoleSwitch}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition"
                title={`Switch active dashboard to ${activeRole === 'donor' ? 'Receiver' : 'Donor'}`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
                <span className="capitalize text-slate-200 font-bold">{activeRole} View</span>
                <span className="text-slate-500">|</span>
                <span className="text-emerald-400 hover:underline">Switch to {activeRole === 'donor' ? 'Receiver' : 'Donor'}</span>
              </button>

              {/* In-App Notifications Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition border border-white/10"
                  aria-label="View notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center ring-2 ring-slate-950 animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
              </div>

              {/* User Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-1.5 pl-2.5 rounded-2xl bg-white/10 border border-white/20 shadow-subtle hover:bg-white/20 transition text-white"
                >
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.full_name)}`}
                    alt={user.full_name}
                    className="w-8 h-8 rounded-full object-cover bg-emerald-950 border border-emerald-700"
                  />
                  <span className="text-xs font-bold text-white hidden md:inline truncate max-w-[100px]">
                    {user.full_name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 text-white">
                    {/* User info snippet */}
                    <div className="px-4 py-2.5 border-b border-slate-800">
                      <p className="text-xs font-bold text-white truncate">{user.full_name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      {user.organization_name && (
                        <p className="text-[10px] text-emerald-400 font-semibold truncate flex items-center mt-1">
                          <Building className="w-3 h-3 mr-1" />
                          {user.organization_name}
                        </p>
                      )}
                      <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Active: {activeRole}
                      </div>
                    </div>

                    {/* Nav Actions */}
                    <div className="py-1">
                      <Link
                        to={activeRole === 'donor' ? '/donor' : '/receiver'}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition"
                      >
                        <ShieldCheck className="w-4 h-4 mr-2.5 text-emerald-400" />
                        Go to {activeRole === 'donor' ? 'Donor' : 'Receiver'} Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition"
                      >
                        <User className="w-4 h-4 mr-2.5 text-slate-400" />
                        My Profile & Settings
                      </Link>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleRoleSwitch();
                        }}
                        className="w-full flex items-center px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition text-left"
                      >
                        <ArrowLeftRight className="w-4 h-4 mr-2.5 text-amber-400" />
                        Switch to {activeRole === 'donor' ? 'Receiver' : 'Donor'} Mode
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="pt-1 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full flex items-center px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition"
                      >
                        <LogOut className="w-4 h-4 mr-2.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Unauthenticated Quick Links */}
              <Link
                to="/login"
                className="text-xs sm:text-sm font-bold px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition"
              >
                Sign In
              </Link>
              <Link
                to="/login?role=receiver"
                className="hidden sm:inline-flex items-center space-x-1 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-300 bg-white/10 hover:bg-white/20 border border-white/20 transition"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Find Food</span>
              </Link>
              <Link
                to="/login?role=donor"
                className="inline-flex items-center space-x-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-700 hover:from-emerald-600 hover:to-teal-800 shadow-md shadow-emerald-950/30 transition hover:scale-[1.02]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Donate Food</span>
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-200 hover:bg-white/10 transition"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-2xl border-b border-slate-800 px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2 text-white">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-white/10"
          >
            Home
          </Link>
          <a
            href="/#how-it-works"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-white/10"
          >
            How It Works
          </a>
          <a
            href="/#available-food"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-white/10"
          >
            Available Food
          </a>
          <a
            href="/#impact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-white/10"
          >
            Our Impact
          </a>
          <a
            href="/#about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-white/10"
          >
            About Us
          </a>
          <a
            href="/#contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-white/10"
          >
            Contact
          </a>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <Link
                to={activeRole === 'donor' ? '/donor' : '/receiver'}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800"
              >
                Go to {activeRole === 'donor' ? 'Donor' : 'Receiver'} Dashboard
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleRoleSwitch();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-white/10"
              >
                Switch to {activeRole === 'donor' ? 'Receiver' : 'Donor'} View
              </button>
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-white/10"
              >
                My Profile
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                  navigate('/');
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-rose-400 hover:bg-rose-950/30"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-800 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-bold text-white bg-slate-800 rounded-xl hover:bg-slate-700"
              >
                Sign In / Register
              </Link>
              <Link
                to="/login?role=donor"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-700 rounded-xl shadow-md"
              >
                Donate Food
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
