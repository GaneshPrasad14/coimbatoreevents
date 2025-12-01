import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiService, Event, Category, getPublicUrl } from '../lib/api';

interface EventsSectionProps {
  onEventSelect: (event: Event) => void;
}

export function EventsSection({ onEventSelect }: EventsSectionProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

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
    <section id="events-section" className="py-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-playfair">
            <span className="text-white">Discover </span>
            <span className="text-yellow-400">Events</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light">
            Explore the best events happening in Coimbatore. From music festivals to workshops, find your next experience.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-12 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search */}
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-yellow-400 transition-colors" />
              <input
                type="text"
                placeholder="Search events, venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all duration-300"
              />
            </div>

            {/* Category Filter - Desktop */}
            <div className="hidden md:flex items-center gap-2 relative group/categories">
              <button
                onClick={() => {
                  const container = document.getElementById('category-scroll-container');
                  if (container) container.scrollBy({ left: -200, behavior: 'smooth' });
                }}
                className="absolute left-0 z-10 p-2 bg-gradient-to-r from-black to-transparent text-white hover:text-yellow-400 transition-colors opacity-0 group-hover/categories:opacity-100"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div
                id="category-scroll-container"
                className="flex gap-2 overflow-x-auto pb-2 max-w-full no-scrollbar scroll-smooth px-8"
              >
                {categoryList.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${selectedCategory === category
                      ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/25 scale-105'
                      : 'bg-gray-900/50 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  const container = document.getElementById('category-scroll-container');
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
              className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar scroll-smooth px-8"
            >
              <Filter className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              {categoryList.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${selectedCategory === category
                    ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/25'
                    : 'bg-gray-900/50 text-gray-400 border border-gray-800'
                    }`}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-gray-900/50 rounded-2xl h-[300px] animate-pulse border border-gray-800" />
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="group relative bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-gray-700"
                onClick={() => onEventSelect(event)}
              >
                <div className="relative aspect-[2/3] overflow-hidden">
                  {/* Image with fallback logic inline since we can't use a separate component easily here without full rewrite */}
                  <img
                    src={getImageSrc(event)}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={() => handleImageError(event.id!)}
                  />

                  {/* Gradient overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Category Badge */}
                  <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {event.category}
                  </div>

                  {/* Movie title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white text-sm font-bold leading-tight line-clamp-2 group-hover:text-yellow-400 transition-colors duration-300 font-playfair">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-300">
                      <Calendar className="w-3 h-3 text-yellow-400" />
                      <span>{new Date(event.event_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-900/30 rounded-3xl border border-gray-800">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
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
              className="mt-6 px-6 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
