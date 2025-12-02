import React, { useState, useEffect, useRef } from 'react';
import { Search, Calendar, MapPin, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiService, Event, Category, getPublicUrl } from '../lib/api';

interface EventsSectionProps {
  onEventSelect: (event: Event) => void;
}

// Tilt Card Component for 3D Parallax Effect
const TiltCard = ({ children, className, onClick, style }: { children: React.ReactNode, className?: string, onClick?: () => void, style?: React.CSSProperties }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg rotation
    const rotateY = ((x - centerX) / centerX) * 10;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <div
      ref={cardRef}
      className={`${className} transition-transform duration-100 ease-out`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
      style={{
        ...style,
        transform: isHovered
          ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1.02, 1.02, 1.02)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      }}
    >
      {children}
    </div>
  );
};

export function EventsSection({ onEventSelect }: EventsSectionProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Auto-scroll state
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsResponse, categoriesResponse] = await Promise.all([
          apiService.getAllEvents({ limit: 100 }),
          apiService.getCategories()
        ]);

        if (eventsResponse.success) {
          setEvents(eventsResponse.data || []);
        }

        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animationId: number;
    let scrollPos = container.scrollLeft;
    let direction = 1;
    const speed = 0.5;

    const animate = () => {
      if (!isPaused && container) {
        // Check if scrolling is possible
        if (container.scrollWidth > container.clientWidth) {
          scrollPos += speed * direction;

          // Reverse direction at edges
          if (scrollPos >= container.scrollWidth - container.clientWidth) {
            direction = -1;
            scrollPos = container.scrollWidth - container.clientWidth;
          } else if (scrollPos <= 0) {
            direction = 1;
            scrollPos = 0;
          }

          container.scrollLeft = scrollPos;
        }
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused, categories]); // Re-run when categories change

  const handleImageError = (eventId: string) => {
    setImageErrors(prev => new Set(prev).add(eventId));
  };

  const getImageSrc = (event: Event) => {
    if (imageErrors.has(event.id!)) {
      return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop&crop=entropy&auto=format';
    }
    return getPublicUrl(event.image);
  };

  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryList = ['All', ...categories.map(c => c.name)];

  return (
    <section id="events-section" className="py-20 bg-black text-white relative overflow-hidden">
      {/* Background Glows for Section */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-playfair">
            <span className="text-white">Discover </span>
            <span className="text-yellow-400">Events</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light">
            Explore the best events happening in Coimbatore. From music festivals to workshops, find your next experience.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-12 space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search */}
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-yellow-400 transition-colors" />
              <input
                type="text"
                placeholder="Search events, venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all duration-300 backdrop-blur-sm"
              />
            </div>

            {/* Category Filter - Desktop */}
            <div
              className="hidden md:flex items-center gap-2 relative group/categories w-full md:w-auto overflow-hidden"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <button
                onClick={() => {
                  const container = scrollRef.current;
                  if (container) container.scrollBy({ left: -200, behavior: 'smooth' });
                }}
                className="absolute left-0 z-10 p-2 bg-gradient-to-r from-black to-transparent text-white hover:text-yellow-400 transition-colors opacity-0 group-hover/categories:opacity-100"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div
                ref={scrollRef}
                id="category-scroll-container"
                className="flex gap-4 overflow-x-auto pb-4 pt-2 max-w-full no-scrollbar scroll-smooth px-8 mask-linear-gradient"
              >
                {categoryList.map((category, index) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`
                      px-8 py-3 rounded-full text-sm font-bold tracking-wide transition-all duration-300 whitespace-nowrap flex-shrink-0
                      border border-yellow-400/30 backdrop-blur-md animate-float
                      ${selectedCategory === category
                        ? 'bg-yellow-400 text-black shadow-[0_0_20px_rgba(247,198,0,0.6)] scale-110'
                        : 'bg-black/40 text-gray-300 hover:bg-yellow-400/10 hover:text-yellow-400 hover:border-yellow-400 hover:shadow-[0_0_15px_rgba(247,198,0,0.4)] hover:scale-105'
                      }
                    `}
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  const container = scrollRef.current;
                  if (container) container.scrollBy({ left: 200, behavior: 'smooth' });
                }}
                className="absolute right-0 z-10 p-2 bg-gradient-to-l from-black to-transparent text-white hover:text-yellow-400 transition-colors opacity-0 group-hover/categories:opacity-100"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Category Filter - Mobile */}
          <div className="md:hidden relative group/mobile-categories">
            <button
              onClick={() => {
                const container = document.getElementById('mobile-category-scroll-container');
                if (container) container.scrollBy({ left: -150, behavior: 'smooth' });
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-gradient-to-r from-black via-black/50 to-transparent text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              id="mobile-category-scroll-container"
              className="flex items-center gap-3 overflow-x-auto pb-4 pt-2 no-scrollbar scroll-smooth px-8"
            >
              <Filter className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              {categoryList.map((category, index) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0
                    border border-yellow-400/30 backdrop-blur-md
                    ${selectedCategory === category
                      ? 'bg-yellow-400 text-black shadow-[0_0_15px_rgba(247,198,0,0.5)]'
                      : 'bg-black/40 text-gray-300 hover:text-yellow-400 hover:border-yellow-400'
                    }
                  `}
                >
                  {category}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                const container = document.getElementById('mobile-category-scroll-container');
                if (container) container.scrollBy({ left: 150, behavior: 'smooth' });
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-gradient-to-l from-black via-black/50 to-transparent text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-gray-900/50 rounded-[18px] h-[250px] animate-pulse border border-gray-800" />
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredEvents.map((event, index) => (
              <div
                key={event.id}
                className="animate-float"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <TiltCard
                  onClick={() => onEventSelect(event)}
                  className="group relative rounded-[18px] overflow-hidden cursor-pointer border border-yellow-400/20 hover:border-yellow-400 shadow-lg hover:shadow-[0_0_20px_rgba(247,198,0,0.4)] aspect-[3/4]"
                >
                  {/* Full Background Image */}
                  <img
                    src={getImageSrc(event)}
                    alt={event.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={() => handleImageError(event.id!)}
                  />

                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 transition-opacity duration-300" />

                  {/* Category Badge */}
                  <div className="absolute top-4 right-4 bg-yellow-400/90 backdrop-blur-sm text-black text-[10px] font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(247,198,0,0.3)] z-10">
                    {event.category}
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-xl font-bold text-white mb-1 line-clamp-1 group-hover:text-yellow-400 transition-colors duration-300 font-playfair drop-shadow-md">
                      {event.title}
                    </h3>

                    <p className="text-gray-300 text-xs line-clamp-2 mb-3 font-light opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-0 group-hover:h-auto">
                      {event.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-300 border-t border-white/20 pt-3 mt-2">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-yellow-400" />
                        <span>{new Date(event.event_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="truncate max-w-[100px]">{event.venue}</span>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[rgba(0,0,0,0.35)] backdrop-blur-[18px] rounded-[24px] border border-gray-800 animate-fade-in">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
              <Search className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No events found</h3>
            <p className="text-gray-400">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-6 px-6 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 hover:shadow-[0_0_15px_rgba(247,198,0,0.4)] transition-all duration-300"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
