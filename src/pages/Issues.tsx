import { useEffect, useState } from 'react';
import { Flag, TrendingUp, Filter, Plus, MapPin } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  location: string;
  upvotes: number;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
  };
}

export function Issues() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadIssues();
  }, [filter]);

  const loadIssues = async () => {
    try {
      let query = supabase
        .from('issues')
        .select(`
          *,
          profiles:user_id (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setIssues(data || []);
    } catch (error) {
      console.error('Error loading issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (issueId: string) => {
    if (!user) return;

    try {
      const { data: existingVote } = await supabase
        .from('issue_votes')
        .select('id')
        .eq('user_id', user.id)
        .eq('issue_id', issueId)
        .maybeSingle();

      if (existingVote) {
        await supabase.from('issue_votes').delete().eq('id', existingVote.id);
        await supabase.rpc('decrement_issue_upvotes', { issue_id: issueId });
      } else {
        await supabase.from('issue_votes').insert({
          user_id: user.id,
          issue_id: issueId,
        });
        await supabase.rpc('increment_issue_upvotes', { issue_id: issueId });
      }

      loadIssues();
    } catch (error) {
      console.error('Error handling upvote:', error);
    }
  };

  const filteredIssues = issues.filter((issue) =>
    issue.title.toLowerCase().includes(search.toLowerCase()) ||
    issue.description.toLowerCase().includes(search.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'error',
      medium: 'warning',
      low: 'info',
    };
    return colors[priority as keyof typeof colors] || 'default';
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Community Issues</h1>
          <p className="text-neutral-600 mt-1">Report and track local concerns</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Report Issue
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Issues' },
              { value: 'open', label: 'Open' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'closed', label: 'Closed' },
            ]}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {filteredIssues.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Flag className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-500">No issues found</p>
            </div>
          </Card>
        ) : (
          filteredIssues.map((issue) => (
            <Card key={issue.id} hover>
              <div className="flex gap-4">
                <button
                  onClick={() => handleUpvote(issue.id)}
                  className="flex flex-col items-center gap-1 min-w-[60px] p-3 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  <TrendingUp className="w-5 h-5 text-sky-600" />
                  <span className="text-lg font-bold text-neutral-900">{issue.upvotes}</span>
                  <span className="text-xs text-neutral-600">votes</span>
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-lg font-semibold text-neutral-900 hover:text-sky-600 cursor-pointer">
                      {issue.title}
                    </h3>
                    <Badge variant={getPriorityColor(issue.priority) as any}>
                      {issue.priority}
                    </Badge>
                  </div>

                  <p className="text-neutral-600 mb-3 line-clamp-2">{issue.description}</p>

                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge size="sm">{issue.category}</Badge>
                    <Badge size="sm" variant={issue.status === 'resolved' ? 'success' : 'info'}>
                      {issue.status.replace('_', ' ')}
                    </Badge>
                    <div className="flex items-center gap-1 text-neutral-600">
                      <MapPin className="w-3 h-3" />
                      <span>{issue.location}</span>
                    </div>
                    <span className="text-neutral-500">
                      by {issue.profiles?.full_name || 'Anonymous'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
