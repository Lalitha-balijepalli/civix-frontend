import { useEffect, useState } from 'react';
import { Vote as VoteIcon, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Vote {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  start_date: string;
  end_date: string;
  total_votes: number;
  yes_votes: number;
  no_votes: number;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

export function Votes() {
  const { user } = useAuth();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVotes();
  }, []);

  const loadVotes = async () => {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select(`
          *,
          profiles:user_id (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVotes(data || []);
    } catch (error) {
      console.error('Error loading votes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteId: string, choice: 'yes' | 'no') => {
    if (!user) return;

    try {
      const { data: existingVote } = await supabase
        .from('user_votes')
        .select('id, choice')
        .eq('user_id', user.id)
        .eq('vote_id', voteId)
        .maybeSingle();

      if (existingVote) {
        if (existingVote.choice === choice) {
          return;
        }
        await supabase
          .from('user_votes')
          .update({ choice })
          .eq('id', existingVote.id);
      } else {
        await supabase.from('user_votes').insert({
          user_id: user.id,
          vote_id: voteId,
          choice,
        });
      }

      loadVotes();
    } catch (error) {
      console.error('Error handling vote:', error);
    }
  };

  const getPercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  const isActive = (endDate: string) => {
    return new Date(endDate) > new Date();
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
          <h1 className="text-3xl font-bold text-neutral-900">Community Votes</h1>
          <p className="text-neutral-600 mt-1">Have your say on local initiatives</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Poll
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {votes.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <VoteIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-500">No active votes</p>
            </div>
          </Card>
        ) : (
          votes.map((vote) => {
            const active = isActive(vote.end_date);
            const yesPercentage = getPercentage(vote.yes_votes, vote.total_votes);
            const noPercentage = getPercentage(vote.no_votes, vote.total_votes);

            return (
              <Card key={vote.id}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={active ? 'success' : 'default'}>
                          {active ? (
                            <>
                              <Clock className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            'Closed'
                          )}
                        </Badge>
                        <Badge size="sm">{vote.category}</Badge>
                      </div>
                      <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                        {vote.title}
                      </h3>
                      <p className="text-neutral-600 mb-4">{vote.description}</p>
                      <p className="text-sm text-neutral-500">
                        Ends: {new Date(vote.end_date).toLocaleDateString()} •
                        Started by {vote.profiles?.full_name || 'Anonymous'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-700">Yes</span>
                        <span className="text-sm font-medium text-green-700">
                          {vote.yes_votes} ({yesPercentage}%)
                        </span>
                      </div>
                      <div className="h-3 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all duration-300"
                          style={{ width: `${yesPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-red-700">No</span>
                        <span className="text-sm font-medium text-red-700">
                          {vote.no_votes} ({noPercentage}%)
                        </span>
                      </div>
                      <div className="h-3 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full transition-all duration-300"
                          style={{ width: `${noPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {active && (
                    <div className="flex gap-3 pt-4 border-t border-neutral-200">
                      <Button
                        variant="outline"
                        fullWidth
                        onClick={() => handleVote(vote.id, 'yes')}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Vote Yes
                      </Button>
                      <Button
                        variant="outline"
                        fullWidth
                        onClick={() => handleVote(vote.id, 'no')}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Vote No
                      </Button>
                    </div>
                  )}

                  <div className="text-sm text-neutral-500 text-center">
                    Total votes: {vote.total_votes}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
