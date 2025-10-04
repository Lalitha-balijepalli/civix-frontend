import { useState, useEffect } from 'react';
import { User, MapPin, Mail, Save } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    location: '',
    bio: '',
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFormData({
          full_name: data.full_name || '',
          location: data.location || '',
          bio: data.bio || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          location: formData.location,
          bio: formData.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Settings</h1>
        <p className="text-neutral-600 mt-1">Manage your account and preferences</p>
      </div>

      <Card>
        <CardHeader title="Profile Information" subtitle="Update your personal details" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="John Doe"
            required
          />

          <Input
            label="Email"
            value={user?.email || ''}
            disabled
            helperText="Email cannot be changed"
          />

          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="City, State"
          />

          <Textarea
            label="Bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell us about yourself..."
            rows={4}
          />

          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader
          title="Notification Preferences"
          subtitle="Control how you receive updates"
        />

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
            <div>
              <p className="font-medium text-neutral-900">Email Notifications</p>
              <p className="text-sm text-neutral-600">Receive updates via email</p>
            </div>
            <input type="checkbox" className="w-5 h-5" defaultChecked />
          </label>

          <label className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
            <div>
              <p className="font-medium text-neutral-900">Issue Updates</p>
              <p className="text-sm text-neutral-600">Get notified about issue status changes</p>
            </div>
            <input type="checkbox" className="w-5 h-5" defaultChecked />
          </label>

          <label className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
            <div>
              <p className="font-medium text-neutral-900">New Votes</p>
              <p className="text-sm text-neutral-600">Alert me when new votes are created</p>
            </div>
            <input type="checkbox" className="w-5 h-5" defaultChecked />
          </label>
        </div>
      </Card>
    </div>
  );
}
