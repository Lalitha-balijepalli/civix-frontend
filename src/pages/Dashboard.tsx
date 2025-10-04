import { useEffect, useState } from 'react';
import { TrendingUp, Flag, Vote, Users, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { supabase } from '../lib/supabase';

interface Stats {
  totalIssues: number;
  activeVotes: number;
  resolvedIssues: number;
  communityMembers: number;
}

interface RecentIssue {
  id: string;
  title: string;
  category: string;
  status: string;
  upvotes: number;
  created_at: string;
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalIssues: 0,
    activeVotes: 0,
    resolvedIssues: 0,
    communityMembers: 0,
  });
  const [recentIssues, setRecentIssues] = useState<RecentIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [issuesRes, votesRes, resolvedRes, profilesRes, recentRes] = await Promise.all([
        supabase.from('issues').select('id', { count: 'exact', head: true }),
        supabase.from('votes').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('issues').select('id', { count: 'exact', head: true }).eq('status', 'resolved'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase
          .from('issues')
          .select('id, title, category, status, upvotes, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      setStats({
        totalIssues: issuesRes.count || 0,
        activeVotes: votesRes.count || 0,
        resolvedIssues: resolvedRes.count || 0,
        communityMembers: profilesRes.count || 0,
      });

      setRecentIssues(recentRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Issues',
      value: stats.totalIssues,
      icon: Flag,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
    },
    {
      title: 'Active Votes',
      value: stats.activeVotes,
      icon: Vote,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Resolved Issues',
      value: stats.resolvedIssues,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Community Members',
      value: stats.communityMembers,
      icon: Users,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'success' | 'warning' | 'error' | 'info'; icon: any }> = {
      open: { variant: 'info', icon: AlertCircle },
      in_progress: { variant: 'warning', icon: Clock },
      resolved: { variant: 'success', icon: CheckCircle },
      closed: { variant: 'error', icon: AlertCircle },
    };

    const config = statusMap[status] || statusMap.open;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    );
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
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600 mt-1">Welcome back! Here's what's happening in your community.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} hover>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-neutral-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-neutral-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Recent Issues" subtitle="Latest community reports" />
          <div className="space-y-3">
            {recentIssues.length === 0 ? (
              <p className="text-neutral-500 text-center py-8">No issues reported yet</p>
            ) : (
              recentIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-4 border border-neutral-200 rounded-lg hover:border-sky-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-900">{issue.title}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge size="sm">{issue.category}</Badge>
                        {getStatusBadge(issue.status)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-neutral-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">{issue.upvotes}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Quick Actions" />
          <div className="space-y-2">
            <button className="w-full p-4 text-left border-2 border-dashed border-neutral-300 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-all">
              <Flag className="w-5 h-5 text-sky-600 mb-2" />
              <p className="font-medium text-neutral-900">Report an Issue</p>
              <p className="text-sm text-neutral-600">Submit a new community issue</p>
            </button>
            <button className="w-full p-4 text-left border-2 border-dashed border-neutral-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all">
              <Vote className="w-5 h-5 text-green-600 mb-2" />
              <p className="font-medium text-neutral-900">Create a Poll</p>
              <p className="text-sm text-neutral-600">Start a community vote</p>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
