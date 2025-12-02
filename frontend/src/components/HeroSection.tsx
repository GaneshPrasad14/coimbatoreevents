import React, { useEffect, useState, useRef } from 'react';
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  const fetchFeaturedEvents = async () => {
    try {
      const response = await apiService.getFeaturedEvents();
      if (response.success) {
        setFeaturedEvents(response.data || []);
        setImageErrors(new Set());
      } else {
        console.warn('Featured events API returned error:', response);
        setFeaturedEvents([]);
      }
    } catch (error) {
      console.error('Error fetching featured events:', error);
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

  const getImageSrc = (event: Event) => {
    if (imageErrors.has(event.id!)) {
      return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop&crop=entropy&auto=format';
    }
    return getPublicUrl(event.image);
  };

  if (loading) {
    return (
      <div className="relative w-full h-[600px] bg-black animate-pulse overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-2xl text-white space-y-6">
            <div className="h-8 bg-gray-800 rounded w-32 animate-pulse" />
            <div className="h-12 bg-gray-800 rounded w-96 animate-pulse" />
            <div className="h-6 bg-gray-800 rounded w-80 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (featuredEvents.length === 0) {
    return (
      <div className="relative w-full h-[600px] bg-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-900/20 via-black to-black"></div>
        <div className="text-white text-center relative z-10">
          <h2 className="text-4xl font-bold mb-4 font-playfair text-yellow-400">No Featured Events</h2>
          <p className="text-lg opacity-90 text-gray-300">Check back soon for exciting events!</p>
        </div>
      </div>
    );
  }

  const currentEvent = featuredEvents[currentIndex];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[700px] overflow-hidden bg-black group mt-28"
    >
      {/* Spotlight Effect */}
      <div
        className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(247, 198, 0, 0.15), transparent 40%)`
        }}
      />

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 4 + 1}px`,
            height: `${Math.random() * 4 + 1}px`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 10 + 10}s`
          }}
        />
      ))}

      {/* Background Image with Parallax-like feel via CSS transitions */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
        style={{
          backgroundImage: `url(${getImageSrc(currentEvent)})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Neon Glow Accents */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-yellow-400/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-yellow-400/5 to-transparent pointer-events-none rounded-full blur-3xl" />

      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center z-20">
        <div className="max-w-2xl text-white space-y-8 animate-float">
          <div className="inline-block overflow-hidden">
            <span className="px-4 py-2 bg-yellow-400/10 border border-yellow-400/50 text-yellow-400 rounded-full text-sm font-semibold uppercase tracking-wider backdrop-blur-md shadow-[0_0_15px_rgba(247,198,0,0.3)]">
              Featured Event
            </span>
          </div>

          <div className="overflow-hidden">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight font-playfair text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-100 to-yellow-400 drop-shadow-lg animate-typewriter pb-2">
              {currentEvent.title}
            </h1>
          </div>

          <p className="text-lg md:text-xl text-gray-300 line-clamp-3 font-light leading-relaxed max-w-xl border-l-2 border-yellow-400/50 pl-4">
            {currentEvent.description}
          </p>

          <div className="flex flex-wrap gap-6 text-sm md:text-base text-gray-300">
            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-white/10 backdrop-blur-sm">
              <Calendar className="w-5 h-5 text-yellow-400" />
              <span>{formatDate(currentEvent.event_date)}</span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-white/10 backdrop-blur-sm">
              <MapPin className="w-5 h-5 text-yellow-400" />
              <span>{currentEvent.venue}</span>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => {
                if (currentEvent.booking_url) {
                  window.open(currentEvent.booking_url, '_blank');
                }
              }}
              className="px-8 py-4 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-300 hover:shadow-[0_0_25px_rgba(247,198,0,0.5)] transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              Book Now
            </button>
            <button
              onClick={() => onEventSelect?.(currentEvent)}
              className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl font-bold text-white hover:bg-white/10 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
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
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-yellow-400 hover:text-black hover:border-yellow-400 transition-all duration-300 group/nav z-30"
          >
            <ChevronLeft className="w-6 h-6 group-hover/nav:scale-110 transition-transform" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-yellow-400 hover:text-black hover:border-yellow-400 transition-all duration-300 group/nav z-30"
          >
            <ChevronRight className="w-6 h-6 group-hover/nav:scale-110 transition-transform" />
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
            {featuredEvents.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-500 ${index === currentIndex
                  ? 'bg-yellow-400 w-8 shadow-[0_0_10px_rgba(247,198,0,0.5)]'
                  : 'bg-gray-600 w-2 hover:bg-gray-400'
                  }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
