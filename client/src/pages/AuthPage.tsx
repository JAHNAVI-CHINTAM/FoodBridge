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
    <div className="min-h-screen bg-[#fafaf9] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-xl w-full mx-auto">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 group mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-brand-600/20 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              Food<span className="text-warm-500">Bridge</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900">
            {authMode === 'login' ? 'Sign in to your account' : 'Join the Food Bridge community'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
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
            className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 relative ${
              selectedRole === 'donor'
                ? 'border-brand-600 bg-brand-50/60 shadow-elevated ring-2 ring-brand-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
            }`}
          >
            {selectedRole === 'donor' && (
              <div className="absolute top-3 right-3 text-brand-600">
                <CheckCircle2 className="w-5 h-5 fill-brand-600 text-white" />
              </div>
            )}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
              selectedRole === 'donor' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Donor Account</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
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
            className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 relative ${
              selectedRole === 'receiver'
                ? 'border-warm-500 bg-warm-50/60 shadow-elevated ring-2 ring-warm-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
            }`}
          >
            {selectedRole === 'receiver' && (
              <div className="absolute top-3 right-3 text-warm-600">
                <CheckCircle2 className="w-5 h-5 fill-warm-600 text-white" />
              </div>
            )}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
              selectedRole === 'receiver' ? 'bg-warm-500 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Receiver Account</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              NGOs, Shelters, Orphanages & Community Kitchens
            </p>
          </button>
        </div>

        {/* 2. MAIN AUTH CARD CONTAINER */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8">
          {/* Mode Switch Tabs (Login / Sign Up) */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition ${
                authMode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
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
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="flex-1 font-medium">{errorMsg}</span>
            </div>
          )}

          {/* 3. LOGIN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={selectedRole === 'donor' ? 'rajesh@grandpalace.com' : 'anand@hopefoundation.org'}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-xs text-brand-700 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
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
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                  />
                  <span className="text-xs text-slate-600 font-medium">Remember my session</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  Signing in as: <strong className="capitalize text-slate-700">{selectedRole}</strong>
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-md transition flex items-center justify-center space-x-2 ${
                  selectedRole === 'donor'
                    ? 'bg-brand-600 hover:bg-brand-700 shadow-brand-600/20'
                    : 'bg-warm-500 hover:bg-warm-600 shadow-warm-500/20'
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Executive Chef or Shelter Coordinator"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@organization.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Organization / Entity Name {selectedRole === 'donor' ? '(Hotel / Bakery)' : '(Shelter / NGO)'}
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder={selectedRole === 'donor' ? 'Grand Palace Banquets' : 'Hope Children Care Home'}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Address / City Landmark
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="12th Main Road, Indiranagar, Bengaluru"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 chars"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500"
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
                    className="w-4 h-4 mt-0.5 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I agree to the Food Bridge <strong>Terms of Service</strong>, <strong>Privacy Policy</strong>, and commit to following strict <strong>Food Safety & Hygiene Standards</strong>.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-md transition flex items-center justify-center space-x-2 ${
                  selectedRole === 'donor'
                    ? 'bg-brand-600 hover:bg-brand-700 shadow-brand-600/20'
                    : 'bg-warm-500 hover:bg-warm-600 shadow-warm-500/20'
                } disabled:opacity-60`}
              >
                <span>{isSubmitting ? 'Creating Account...' : `Create ${selectedRole === 'donor' ? 'Donor' : 'Receiver'} Account`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Evaluator Demo Logins */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Instant Evaluator Demo Access</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickDemo('donor')}
                className="py-2.5 px-3 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-800 text-xs font-bold border border-brand-200 transition"
              >
                Test as Donor (Chef Rajesh)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('receiver')}
                className="py-2.5 px-3 rounded-xl bg-warm-50 hover:bg-warm-100 text-warm-800 text-xs font-bold border border-warm-200 transition"
              >
                Test as Receiver (Anand - NGO)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-slate-900 mb-2">Reset Password</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your registered email address and we'll send you instructions to reset your password securely.
            </p>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs mb-4 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setForgotPasswordOpen(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setForgotPasswordOpen(false);
                  addToast('info', 'Password Reset Requested', 'If an account exists with this email, a reset link has been dispatched.');
                }}
                className="flex-1 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition"
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
