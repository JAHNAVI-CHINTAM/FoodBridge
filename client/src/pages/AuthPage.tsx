import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { UserRole } from '../types';
import { 
  Building2, 
  Users, 
  HeartHandshake, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register, isAuthenticated, activeRole, quickLoginAs } = useAuth();
  const { addToast } = useNotifications();

  // If already authenticated, redirect to appropriate dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate(activeRole === 'donor' ? '/donor' : '/receiver');
    }
  }, [isAuthenticated, activeRole, navigate]);

  // Account Type Selection: 'donor' or 'receiver'
  const initialRole = (searchParams.get('role') as UserRole) || 'donor';
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

  // Tab: 'login' or 'signup'
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [address, setAddress] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await login(email, password, selectedRole);
      addToast('success', 'Welcome Back!', `Logged in successfully as ${selectedRole}.`);
      navigate(selectedRole === 'donor' ? '/donor' : '/receiver');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
      addToast('error', 'Login Error', err.message || 'Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (!acceptTerms) {
      setErrorMsg('You must agree to the Terms of Service and Food Safety Policy.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        full_name: fullName,
        email,
        password,
        phone,
        role: selectedRole,
        organization_name: organizationName,
        address
      });
      addToast('success', 'Account Created!', `Welcome to Food Bridge as a registered ${selectedRole}.`);
      navigate(selectedRole === 'donor' ? '/donor' : '/receiver');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
      addToast('error', 'Registration Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (role: UserRole) => {
    setIsSubmitting(true);
    try {
      await quickLoginAs(role);
      addToast('success', 'Demo Login Active', `Signed in as verified ${role} account.`);
      navigate(role === 'donor' ? '/donor' : '/receiver');
    } catch (err: any) {
      addToast('error', 'Demo Login Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center relative z-10">
      <div className="max-w-xl w-full mx-auto">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 group mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-xl shadow-emerald-950/40 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Food<span className="text-amber-400">Bridge</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-white">
            {authMode === 'login' ? 'Sign in to your account' : 'Join the Food Bridge community'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose your account type below to access your dedicated dashboard
          </p>
        </div>

        {/* 1. SELECTABLE ACCOUNT TYPE CARDS (Donor vs Receiver) */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Donor Card */}
          <button
            type="button"
            onClick={() => {
              setSelectedRole('donor');
              setErrorMsg(null);
            }}
            className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 relative backdrop-blur-md ${
              selectedRole === 'donor'
                ? 'border-emerald-500 bg-emerald-950/50 shadow-xl ring-2 ring-emerald-500/20 text-white'
                : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 text-white shadow-lg'
            }`}
          >
            {selectedRole === 'donor' && (
              <div className="absolute top-3 right-3 text-emerald-400">
                <CheckCircle2 className="w-5 h-5 fill-emerald-500 text-slate-950" />
              </div>
            )}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
              selectedRole === 'donor' ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-800 text-slate-400'
            }`}>
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-white">Donor Account</h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Restaurants, Hotels, Bakeries, Caterers & Supermarkets
            </p>
          </button>

          {/* Receiver Card */}
          <button
            type="button"
            onClick={() => {
              setSelectedRole('receiver');
              setErrorMsg(null);
            }}
            className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 relative backdrop-blur-md ${
              selectedRole === 'receiver'
                ? 'border-amber-500 bg-amber-950/50 shadow-xl ring-2 ring-amber-500/20 text-white'
                : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 text-white shadow-lg'
            }`}
          >
            {selectedRole === 'receiver' && (
              <div className="absolute top-3 right-3 text-amber-400">
                <CheckCircle2 className="w-5 h-5 fill-amber-500 text-slate-950" />
              </div>
            )}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
              selectedRole === 'receiver' ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-800 text-slate-400'
            }`}>
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-white">Receiver Account</h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              NGOs, Shelters, Orphanages & Community Kitchens
            </p>
          </button>
        </div>

        {/* 2. MAIN AUTH CARD CONTAINER */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800/90 shadow-2xl p-6 sm:p-8">
          {/* Mode Switch Tabs (Login / Sign Up) */}
          <div className="flex rounded-xl bg-slate-950/80 border border-slate-800 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition ${
                authMode === 'login'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition ${
                authMode === 'signup'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span className="flex-1 font-medium">{errorMsg}</span>
            </div>
          )}

          {/* 3. LOGIN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={selectedRole === 'donor' ? 'rajesh@grandpalace.com' : 'anand@hopefoundation.org'}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-700 bg-slate-950"
                  />
                  <span className="text-xs text-slate-300 font-medium">Remember my session</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  Signing in as: <strong className="capitalize text-emerald-400">{selectedRole}</strong>
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-xl transition flex items-center justify-center space-x-2 ${
                  selectedRole === 'donor'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-950/40'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-950/40'
                } disabled:opacity-60`}
              >
                <span>{isSubmitting ? 'Signing in...' : `Sign In to ${selectedRole === 'donor' ? 'Donor' : 'Receiver'} Portal`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 4. SIGN UP FORM */}
          {authMode === 'signup' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Executive Chef or Shelter Coordinator"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@organization.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Organization / Entity Name {selectedRole === 'donor' ? '(Hotel / Bakery)' : '(Shelter / NGO)'}
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder={selectedRole === 'donor' ? 'Grand Palace Banquets' : 'Hope Children Care Home'}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Address / City Landmark
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="12th Main Road, Indiranagar, Bengaluru"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 chars"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-700 bg-slate-950"
                  />
                  <span className="text-xs text-slate-300 leading-relaxed">
                    I agree to the Food Bridge <strong className="text-white">Terms of Service</strong>, <strong className="text-white">Privacy Policy</strong>, and commit to following strict <strong className="text-white">Food Safety & Hygiene Standards</strong>.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-xl transition flex items-center justify-center space-x-2 ${
                  selectedRole === 'donor'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-950/40'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-950/40'
                } disabled:opacity-60`}
              >
                <span>{isSubmitting ? 'Creating Account...' : `Create ${selectedRole === 'donor' ? 'Donor' : 'Receiver'} Account`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Evaluator Demo Logins */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant Evaluator Demo Access</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickDemo('donor')}
                className="py-2.5 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 text-xs font-bold border border-emerald-800/80 transition"
              >
                Test as Donor (Chef Rajesh)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('receiver')}
                className="py-2.5 px-3 rounded-xl bg-amber-950/60 hover:bg-amber-900/70 text-amber-300 text-xs font-bold border border-amber-800/80 transition"
              >
                Test as Receiver (Anand - NGO)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-800 relative">
            <h3 className="text-base font-bold text-white mb-2">Reset Password</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your registered email address and we'll send you instructions to reset your password securely.
            </p>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white rounded-xl text-xs mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setForgotPasswordOpen(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setForgotPasswordOpen(false);
                  addToast('info', 'Password Reset Requested', 'If an account exists with this email, a reset link has been dispatched.');
                }}
                className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition"
              >
                Send Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
