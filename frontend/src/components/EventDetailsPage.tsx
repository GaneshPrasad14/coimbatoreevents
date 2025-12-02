import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService, Event, getPublicUrl } from '../lib/api';
import { Calendar, MapPin, ArrowLeft, Share2, Heart, Clock, Car, Ticket, Info, Map as MapIcon } from 'lucide-react';

export function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [similarEvents, setSimilarEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Fetch current event
        const response = await apiService.getEventById(id);
        if (response.success) {
          setEvent(response.data);

          // Fetch similar events based on category
          if (response.data.category) {
            const similarResponse = await apiService.getAllEvents({
              category: response.data.category,
              limit: 4
            });
            if (similarResponse.success) {
              // Filter out the current event
              setSimilarEvents(similarResponse.data.filter(e => e.id !== id && e._id !== id));
            }
          }
        } else {
          setError('Event not found');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title || 'Event',
          text: `Check out this event: ${event?.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleBook = () => {
    if (event?.booking_url) {
      window.open(event.booking_url, '_blank');
    } else {
      alert('Booking feature coming soon! Please contact support for tickets.');
    }
  };

  const getImageSrc = (event: Event) => {
    if (!event.image) return 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30';
    return getPublicUrl(event.image);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold mb-4 text-red-500">{error || 'Event not found'}</h2>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-yellow-400 text-black rounded-full font-bold hover:bg-yellow-300 transition-colors"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20 pt-24">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-4 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-300 hover:text-yellow-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Events</span>
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Banner Image */}
        <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-[30px] overflow-hidden mb-8 border border-white/10 shadow-2xl animate-fade-in">
          <img
            src={getImageSrc(event)}
            alt={event.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Header Card */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-[24px] p-6 md:p-8 border border-white/10 shadow-lg animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex justify-between items-start mb-6">
                <span className="px-4 py-1.5 bg-yellow-400 text-black font-bold text-sm rounded-full shadow-[0_0_15px_rgba(247,198,0,0.4)]">
                  {event.category}
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-2.5 rounded-full border transition-all duration-300 ${isLiked ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/30'}`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2.5 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-white hover:border-white/30 transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold font-playfair text-white mb-6 leading-tight">
                {event.title}
              </h1>

              <div className="flex flex-col sm:flex-row gap-6 text-gray-300">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-yellow-400/10 rounded-xl">
                    <Calendar className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Date & Time</p>
                    <p className="font-medium">
                      {new Date(event.event_date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-yellow-400/10 rounded-xl">
                    <MapPin className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="font-medium">{event.venue}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-[24px] p-6 md:p-8 border border-white/10 shadow-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-2xl font-bold text-white mb-6 font-playfair">Event Information</h2>
              <div className="prose prose-invert max-w-none mb-8">
                <p className="text-gray-300 leading-relaxed text-lg font-light whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>

              {/* Event Timeline */}
              <div className="border-t border-white/10 pt-8">
                <h3 className="text-xl font-bold text-white mb-6 font-playfair">Event Timeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/5 rounded-full border border-white/10">
                      <Clock className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Start Time</p>
                      <p className="font-medium text-white">
                        {new Date(event.event_date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/5 rounded-full border border-white/10">
                      <Clock className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">End Time (Approx)</p>
                      <p className="font-medium text-white">
                        {new Date(new Date(event.event_date).getTime() + 3 * 60 * 60 * 1000).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/5 rounded-full border border-white/10">
                      <Car className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Parking</p>
                      <p className="font-medium text-white">Available On-site</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/5 rounded-full border border-white/10">
                      <Ticket className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Entry Rules</p>
                      <p className="font-medium text-white">Ticket Required</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Venue Map */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-[24px] p-6 md:p-8 border border-white/10 shadow-lg animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-3 mb-6">
                <MapIcon className="w-6 h-6 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white font-playfair">Venue Location</h2>
              </div>
              <div className="w-full h-[300px] rounded-[20px] overflow-hidden border border-white/10">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0, filter: 'grayscale(100%) invert(92%) contrast(83%)' }}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(event.venue)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                  allowFullScreen
                ></iframe>
              </div>
            </div>

          </div>

          {/* Right Column: Sidebar */}
          <div className="lg:col-span-1 space-y-6">

            {/* Booking Card */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-[24px] p-6 border border-white/10 shadow-lg sticky top-24 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <button
                onClick={handleBook}
                className="w-full bg-yellow-400 text-black font-bold py-4 px-6 rounded-xl hover:bg-yellow-300 transition-all hover:shadow-[0_0_20px_rgba(247,198,0,0.4)] hover:scale-[1.02] active:scale-[0.98] mb-4 text-lg"
              >
                Book Tickets Now
              </button>
              <p className="text-center text-gray-400 text-sm">
                Secure your spot today!
              </p>
            </div>

            {/* Tags/Info Card */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-[24px] p-6 border border-white/10 shadow-lg animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <h3 className="text-lg font-bold text-white mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:border-yellow-400/50 transition-colors cursor-default">
                  {event.category}
                </span>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:border-yellow-400/50 transition-colors cursor-default">
                  Coimbatore
                </span>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:border-yellow-400/50 transition-colors cursor-default">
                  Events
                </span>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-[24px] p-6 border border-white/10 shadow-lg animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-yellow-400" />
                Need Help?
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Contact our support team for any queries regarding tickets or venue details.
              </p>
              <button
                onClick={() => window.open('https://wa.me/918903627844', '_blank')}
                className="mt-4 text-yellow-400 text-sm font-medium hover:underline"
              >
                Contact Support &rarr;
              </button>
            </div>

          </div>

        </div>

        {/* Similar Events Section */}
        {similarEvents.length > 0 && (
          <div className="mt-20 mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-8 font-playfair border-l-4 border-yellow-400 pl-4">
              Similar Events
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarEvents.map((similarEvent) => (
                <div
                  key={similarEvent.id || similarEvent._id}
                  onClick={() => navigate(`/event/${similarEvent.id || similarEvent._id}`)}
                  className="group bg-gray-900/50 rounded-[20px] overflow-hidden border border-white/10 hover:border-yellow-400/50 transition-all cursor-pointer hover:shadow-[0_0_20px_rgba(247,198,0,0.2)]"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={getImageSrc(similarEvent)}
                      alt={similarEvent.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-xs font-bold text-yellow-400 border border-white/10">
                      {similarEvent.category}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-yellow-400 transition-colors">
                      {similarEvent.title}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(similarEvent.event_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{similarEvent.venue}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
