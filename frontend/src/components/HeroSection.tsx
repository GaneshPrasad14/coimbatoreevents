import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiService, Event, getPublicUrl } from '../lib/api';

interface HeroSectionProps {
  onEventSelect?: (event: Event) => void;
}

export function HeroSection({ onEventSelect }: HeroSectionProps) {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [imageLoading, setImageLoading] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFeaturedEvents();
  }, []);

  useEffect(() => {
    if (featuredEvents.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredEvents.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [featuredEvents.length]);

  const fetchFeaturedEvents = async () => {
    try {
      const response = await apiService.getFeaturedEvents();
      if (response.success) {
        setFeaturedEvents(response.data || []);
        // Clear image errors for fresh data
        setImageErrors(new Set());
      } else {
        console.warn('Featured events API returned error:', response);
        setFeaturedEvents([]);
      }
    } catch (error) {
      console.error('Error fetching featured events:', error);
      // Don't show alert, just log the error and show empty state
      setFeaturedEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredEvents.length);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleImageLoad = (eventId: string) => {
    setImageLoading(prev => {
      const newSet = new Set(prev);
      newSet.delete(eventId);
      return newSet;
    });
  };

  const handleImageError = (eventId: string) => {
    setImageErrors(prev => new Set(prev).add(eventId));
    setImageLoading(prev => {
      const newSet = new Set(prev);
      newSet.delete(eventId);
      return newSet;
    });
  };

  const getImageSrc = (event: Event) => {
    // If image failed to load before, use fallback
    if (imageErrors.has(event.id!)) {
      return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop&crop=entropy&auto=format';
    }
    // Return the actual image URL
    return getPublicUrl(event.image);
  };

  if (loading) {
    return (
      <div className="relative w-full h-[600px] bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-2xl text-white space-y-6">
            <div className="h-8 bg-white/20 rounded w-32 animate-pulse" />
            <div className="h-12 bg-white/20 rounded w-96 animate-pulse" />
            <div className="h-6 bg-white/20 rounded w-80 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (featuredEvents.length === 0) {
    return (
      <div className="relative w-full h-[600px] bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-4xl font-bold mb-4 font-playfair">No Featured Events</h2>
          <p className="text-lg opacity-90">Check back soon for exciting events!</p>
        </div>
      </div>
    );
  }

  const currentEvent = featuredEvents[currentIndex];

  return (
    <div className="relative w-full h-[600px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `url(${getImageSrc(currentEvent)})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      </div>

      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-2xl text-white space-y-6">
          <div className="inline-block">
            <span className="px-4 py-2 bg-yellow-400 text-black rounded-full text-sm font-semibold uppercase tracking-wider">
              Featured Event
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight font-playfair">
            {currentEvent.title}
          </h1>

          <p className="text-lg md:text-xl text-gray-200 line-clamp-3">
            {currentEvent.description}
          </p>

          <div className="flex flex-wrap gap-6 text-sm md:text-base">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-400" />
              <span>{formatDate(currentEvent.event_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-yellow-400" />
              <span>{currentEvent.venue}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                if (currentEvent.booking_url) {
                  window.open(currentEvent.booking_url, '_blank');
                }
              }}
              className="px-8 py-3 bg-yellow-400 rounded-lg font-semibold text-black hover:shadow-lg hover:shadow-yellow-400/50 transition-all duration-300 transform hover:scale-105"
            >
              Book Now
            </button>
            <button
              onClick={() => onEventSelect?.(currentEvent)}
              className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg font-semibold text-white hover:bg-white/20 transition-all duration-300"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {featuredEvents.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {featuredEvents.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
                  }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
