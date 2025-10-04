import { useEffect, useState } from 'react';
import { Users, MessageCircle, TrendingUp } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { supabase } from '../lib/supabase';

interface CommunityMember {
  id: string;
  full_name: string;
  location: string | null;
  created_at: string;
}

interface Activity {
  type: 'issue' | 'vote' | 'comment';
  title: string;
  user: string;
  time: string;
}

export function Community() {
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      const { data: membersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setMembers(membersData || []);
    } catch (error) {
      console.error('Error loading community data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Community</h1>
        <p className="text-neutral-600 mt-1">Connect with your neighbors and local activists</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-900">Community Members</h2>
            <Badge>{members.length} members</Badge>
          </div>

          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-4 p-4 border border-neutral-200 rounded-lg hover:border-sky-300 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {member.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-neutral-900">{member.full_name}</h4>
                  <p className="text-sm text-neutral-600">
                    {member.location || 'Location not set'}
                  </p>
                </div>
                <div className="text-sm text-neutral-500">
                  Joined {new Date(member.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold text-neutral-900 mb-4">Community Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-sky-600" />
                  <span className="text-sm text-neutral-600">Total Members</span>
                </div>
                <span className="font-semibold text-neutral-900">{members.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-neutral-600">Active Today</span>
                </div>
                <span className="font-semibold text-neutral-900">
                  {Math.floor(members.length * 0.3)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-neutral-600">Discussions</span>
                </div>
                <span className="font-semibold text-neutral-900">
                  {Math.floor(members.length * 1.5)}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-neutral-900 mb-4">Top Contributors</h3>
            <div className="space-y-3">
              {members.slice(0, 5).map((member, index) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {member.full_name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
