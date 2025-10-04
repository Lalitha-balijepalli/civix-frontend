import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, MapPin, Users, Plus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  attendees_count: number;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

export function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles:user_id (
            full_name
          )
        `)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const isUpcoming = (eventDate: string) => {
    return new Date(eventDate) > new Date();
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
          <h1 className="text-3xl font-bold text-neutral-900">Community Events</h1>
          <p className="text-neutral-600 mt-1">Discover and join local gatherings</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.length === 0 ? (
          <Card className="md:col-span-2">
            <div className="text-center py-12">
              <CalendarIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-500">No events scheduled</p>
            </div>
          </Card>
        ) : (
          events.map((event) => {
            const upcoming = isUpcoming(event.event_date);
            const eventDate = new Date(event.event_date);

            return (
              <Card key={event.id} hover>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center justify-center w-16 h-16 bg-sky-50 rounded-lg">
                        <span className="text-2xl font-bold text-sky-600">
                          {eventDate.getDate()}
                        </span>
                        <span className="text-xs text-sky-600 uppercase">
                          {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                      </div>
                      <div className="flex-1">
                        <Badge variant={upcoming ? 'success' : 'default'} size="sm" className="mb-2">
                          {upcoming ? 'Upcoming' : 'Past'}
                        </Badge>
                        <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                          {event.title}
                        </h3>
                        <p className="text-sm text-neutral-600 line-clamp-2">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-neutral-600">
                      <CalendarIcon className="w-4 h-4" />
                      <span>
                        {eventDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        {' at '}
                        {eventDate.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Users className="w-4 h-4" />
                      <span>{event.attendees_count} attendees</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-200">
                    <p className="text-sm text-neutral-500">
                      Organized by {event.profiles?.full_name || 'Anonymous'}
                    </p>
                  </div>

                  {upcoming && (
                    <Button variant="outline" fullWidth>
                      Register for Event
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
