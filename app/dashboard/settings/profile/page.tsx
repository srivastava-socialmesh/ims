'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({ full_name: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      // Fetch profile
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      if (data) {
        setProfile({ full_name: data.full_name || '' });
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: profile.full_name })
      .eq('id', user.id);
    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Profile updated successfully! ✅');
    }
    setSaving(false);
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Profile</h1>
      <form onSubmit={handleUpdate} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="mt-1 w-full p-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            value={profile.full_name}
            onChange={(e) => setProfile({ full_name: e.target.value })}
            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        {message && (
          <div className={`text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </div>
        )}
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
}
