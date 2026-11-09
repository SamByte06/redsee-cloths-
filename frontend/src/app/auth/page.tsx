'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '@/store/authSlice';
import { RootState } from '@/store/store';
import api from '@/lib/axios';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { auth, googleProvider } from '@/firebase/config';
import { signInWithPopup } from 'firebase/auth';
import { useTheme } from 'next-themes';

type AuthView = 'login' | 'signup' | 'forgot' | 'verify_email' | 'google_onboarding';

export default function AuthPage() {
  const [view, setView] = useState<AuthView>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [googleData, setGoogleData] = useState<any>(null);
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');

  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const currentTheme = resolvedTheme || 'dark';

  useEffect(() => {
    setMounted(true);
    if (user) {
      if (user.role === 'admin' || user.role === 'coadmin') router.push('/admin');
      else router.push('/');
    }
  }, [user, router]);

  const handleSuccess = (data: any) => {
    dispatch(setCredentials(data));
    if (data.role === 'admin' || data.role === 'coadmin') router.push('/admin');
    else router.push('/');
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (view === 'login') {
        const { data } = await api.post('/api/auth/login', { email, password });
        handleSuccess(data);
      } else if (view === 'signup') {
        await api.post('/api/auth/send-email-otp', { name, email, password });
        setView('verify_email');
      } else if (view === 'forgot') {
        setError('Password reset link sent to your email.');
        setTimeout(() => setView('login'), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/api/auth/verify-email-otp', { email, otp });
      handleSuccess(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      const { data } = await api.post('/api/auth/google', { 
        idToken,
        email: result.user.email,
        name: result.user.displayName,
        avatar: result.user.photoURL
      });
      
      if (data.isNewUser) {
        setGoogleData({
          idToken,
          email: data.email,
          name: data.name,
          avatar: data.avatar
        });
        setName(data.name || '');
        setView('google_onboarding');
      } else {
        handleSuccess(data);
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      let errorMessage = 'Google Sign-In failed. Please try again.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/api/auth/google-signup', {
        ...googleData,
        name,
        phone,
        gender
      });
      handleSuccess(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-16 px-4 text-foreground">
      <div className="w-full max-w-md p-8 md:p-10 bg-surface border border-[#D5D0CA] dark:border-[#2A2A2A]">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            {mounted ? (
              <img src={currentTheme === 'dark' ? '/logo-dark.png' : '/logo-light.png'} alt="REDSEE" className="h-10 object-contain" />
            ) : (
              <div className="h-10 w-28 bg-transparent"></div>
            )}
          </div>
          <span className="text-[11px] uppercase font-[family-name:var(--font-heading)] font-medium tracking-[0.2em] text-[#C41E24] block mb-1">
            Account Access
          </span>
          <h2 className="text-2xl md:text-3xl font-[family-name:var(--font-heading)] font-bold tracking-tight mb-2">
            {view === 'login' ? 'Sign In' : view === 'signup' ? 'Create Account' : view === 'forgot' ? 'Reset Password' : view === 'verify_email' ? 'Verify Code' : 'Profile Setup'}
          </h2>
          <p className="text-[#8A8580] font-[family-name:var(--font-body)] text-xs">
            {view === 'login' ? 'Sign in to access orders and saved pieces.' : 
             view === 'signup' ? 'Join Redsee Store for order tracking and private drops.' : 
             view === 'verify_email' ? `Code sent to ${email}` : 
             view === 'google_onboarding' ? 'A few quick details to finish setup.' : 'Enter your email to receive recovery instructions.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-[#C41E24] p-3 text-xs mb-6 text-center font-[family-name:var(--font-body)]">
            {error}
          </div>
        )}

        {view === 'login' && (
          <div className="space-y-5">
            <button 
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 bg-background border border-[#D5D0CA] dark:border-[#2A2A2A] text-foreground hover:border-foreground py-3 text-xs font-[family-name:var(--font-heading)] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-[#D5D0CA] dark:border-[#2A2A2A]"></div>
              <span className="flex-shrink-0 mx-3 text-[#8A8580] text-[10px] font-[family-name:var(--font-heading)] uppercase tracking-widest">or email</span>
              <div className="flex-grow border-t border-[#D5D0CA] dark:border-[#2A2A2A]"></div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8580]" size={15} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full bg-background border border-[#D5D0CA] dark:border-[#2A2A2A] focus:border-[#C41E24] pl-10 pr-3 py-2.5 text-foreground text-xs font-[family-name:var(--font-body)] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8580]" size={15} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-background border border-[#D5D0CA] dark:border-[#2A2A2A] focus:border-[#C41E24] pl-10 pr-3 py-2.5 text-foreground text-xs font-[family-name:var(--font-body)] outline-none"
                    required
                  />
                </div>
                <div className="flex justify-end mt-1.5">
                  <button type="button" onClick={() => setView('forgot')} className="text-[11px] text-[#8A8580] hover:text-[#C41E24]">Forgot Password?</button>
                </div>
              </div>
              
              <button 
                disabled={loading} 
                type="submit" 
                className="w-full bg-[#C41E24] text-white py-3 font-[family-name:var(--font-heading)] font-semibold tracking-[0.15em] uppercase text-xs hover:bg-[#a01a1f] transition-colors flex justify-center items-center cursor-pointer"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : (
                  <span className="flex items-center gap-1.5">
                    <span>Sign In</span>
                    <ArrowRight size={13} />
                  </span>
                )}
              </button>
            </form>

            <p className="pt-2 text-center text-[#8A8580] text-xs font-[family-name:var(--font-body)]">
              No account? <button onClick={() => setView('signup')} className="text-foreground hover:text-[#C41E24] underline underline-offset-4 ml-1">Create one</button>
            </p>
          </div>
        )}

        {view === 'verify_email' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-[10px] font-[family-name:var(--font-heading)] tracking-wider text-[#8A8580] uppercase mb-1.5">Enter 6-Digit Code</label>
              <input 
                type="text" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="w-full bg-background border border-[#D5D0CA] dark:border-[#2A2A2A] focus:border-[#C41E24] py-2.5 text-foreground tracking-[0.5em] font-bold text-center text-sm outline-none"
                required
              />
            </div>
            
            <button 
              disabled={loading} 
              type="submit" 
              className="w-full bg-[#C41E24] text-white py-3 font-[family-name:var(--font-heading)] font-semibold tracking-[0.15em] uppercase text-xs hover:bg-[#a01a1f] transition-colors flex justify-center items-center cursor-pointer"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Verify Code'}
            </button>

            <button type="button" onClick={() => setView('signup')} className="w-full text-center text-xs text-[#8A8580] hover:text-foreground mt-2">
              Back to Sign Up
            </button>
          </form>
        )}

        {view === 'google_onboarding' && (
          <form onSubmit={handleGoogleSignup} className="space-y-4">
            <div>
              <label className="block text-[10px] font-[family-name:var(--font-heading)] tracking-wider text-[#8A8580] uppercase mb-1">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-background border border-[#D5D0CA] dark:border-[#2A2A2A] focus:border-[#C41E24] px-3 py-2 text-foreground text-xs font-[family-name:var(--font-body)] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-[family-name:var(--font-heading)] tracking-wider text-[#8A8580] uppercase mb-1">Mobile Number</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit number"
                className="w-full bg-background border border-[#D5D0CA] dark:border-[#2A2A2A] focus:border-[#C41E24] px-3 py-2 text-foreground text-xs font-[family-name:var(--font-body)] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-[family-name:var(--font-heading)] tracking-wider text-[#8A8580] uppercase mb-1">Style Preference</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-background border border-[#D5D0CA] dark:border-[#2A2A2A] focus:border-[#C41E24] px-3 py-2 text-foreground text-xs font-[family-name:var(--font-body)] outline-none"
                required
              >
                <option value="Male">Men's Drops</option>
                <option value="Female">Women's Drops</option>
                <option value="Other">Unisex / All</option>
              </select>
            </div>
            
            <button 
              disabled={loading} 
              type="submit" 
              className="w-full bg-[#C41E24] text-white py-3 font-[family-name:var(--font-heading)] font-semibold tracking-[0.15em] uppercase text-xs hover:bg-[#a01a1f] transition-colors flex justify-center items-center cursor-pointer"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Complete Setup'}
            </button>
          </form>
        )}

        {(view === 'signup' || view === 'forgot') && (
          <div className="space-y-5">
            {view === 'signup' && (
              <>
                <button 
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-3 bg-background border border-[#D5D0CA] dark:border-[#2A2A2A] text-foreground hover:border-foreground py-3 text-xs font-[family-name:var(--font-heading)] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-[#D5D0CA] dark:border-[#2A2A2A]"></div>
                  <span className="flex-shrink-0 mx-3 text-[#8A8580] text-[10px] font-[family-name:var(--font-heading)] uppercase tracking-widest">or email</span>
                  <div className="flex-grow border-t border-[#D5D0CA] dark:border-[#2A2A2A]"></div>
                </div>
              </>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {view === 'signup' && (
                <div>
                  <label className="block text-[10px] font-[family-name:var(--font-heading)] tracking-wider text-[#8A8580] uppercase mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-background border border-[#D5D0CA] dark:border-[#2A2A2A] focus:border-[#C41E24] px-3 py-2 text-foreground text-xs font-[family-name:var(--font-body)] outline-none"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-[family-name:var(--font-heading)] tracking-wider text-[#8A8580] uppercase mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-[#D5D0CA] dark:border-[#2A2A2A] focus:border-[#C41E24] px-3 py-2 text-foreground text-xs font-[family-name:var(--font-body)] outline-none"
                  required
                />
              </div>

              {view !== 'forgot' && (
                <div>
                  <label className="block text-[10px] font-[family-name:var(--font-heading)] tracking-wider text-[#8A8580] uppercase mb-1">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-background border border-[#D5D0CA] dark:border-[#2A2A2A] focus:border-[#C41E24] px-3 py-2 text-foreground text-xs font-[family-name:var(--font-body)] outline-none"
                    required
                  />
                </div>
              )}
              
              <button 
                disabled={loading} 
                type="submit" 
                className="w-full bg-[#C41E24] text-white py-3 font-[family-name:var(--font-heading)] font-semibold tracking-[0.15em] uppercase text-xs hover:bg-[#a01a1f] transition-colors flex justify-center items-center cursor-pointer"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : (
                  <span>{view === 'signup' ? 'Create Account' : 'Send Reset Link'}</span>
                )}
              </button>

              <p className="pt-2 text-center text-[#8A8580] text-xs font-[family-name:var(--font-body)]">
                Already registered? <button type="button" onClick={() => setView('login')} className="text-foreground hover:text-[#C41E24] underline underline-offset-4 ml-1">Sign In</button>
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
