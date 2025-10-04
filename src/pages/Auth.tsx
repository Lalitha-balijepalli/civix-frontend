import { useState } from 'react';
import { Vote, Flag, Users } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { ForgotPassword } from './ForgotPassword';

export function Auth() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    location: '', // Added Location field
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!formData.fullName) {
          throw new Error('Full name is required');
        }
        if (!formData.location) {
          throw new Error('Location is required');
        }
        await signUp(formData.email, formData.password, formData.fullName, formData.location);
      } else {
        await signIn(formData.email, formData.password);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Show Forgot Password page if requested
  if (showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-sky-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">C</span>
              </div>
              <h1 className="text-4xl font-bold text-neutral-900">Civix</h1>
            </div>
            <p className="text-xl text-neutral-600">
              Your voice matters. Join thousands of citizens making a difference in their communities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200">
              <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center mb-3">
                <Flag className="w-5 h-5 text-sky-600" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-1">Report Issues</h3>
              <p className="text-sm text-neutral-600">Share local concerns and track their resolution</p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <Vote className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-1">Vote & Decide</h3>
              <p className="text-sm text-neutral-600">Participate in community decisions</p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-neutral-900 mb-1">Build Community</h3>
              <p className="text-sm text-neutral-600">Connect with engaged neighbors</p>
            </div>
          </div>
        </div>

        <Card>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-neutral-600">
              {isSignUp ? 'Join the civic movement today' : 'Sign in to continue'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Added sign-up specific fields */}
            {isSignUp && (
              <>
                <Input
                  label="Full Name"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="John Doe"
                  required
                />
                {/* Added Location field */}
                <Input
                  label="Location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, State"
                  helperText="Enter your city and state"
                  required
                />
              </>
            )}

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
            />

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          {/* Added Forgot Password link */}
          {!isSignUp && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-sky-600 hover:text-sky-700 font-medium hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-sky-600 hover:text-sky-700 font-medium"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
