import React, { useState } from 'react';
import { Calendar, MapPin, X } from 'lucide-react';
import { Event, getPublicUrl } from '../lib/api';

interface EventDetailsModalProps {
    event: Event;
    onClose: () => void;
}

export function EventDetailsModal({ event, onClose }: EventDetailsModalProps) {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const getImageSrc = (evt: Event) => {
        if (imageError) {
            return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop&crop=entropy&auto=format';
        }
        return getPublicUrl(evt.image);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
                <div className="sticky top-0 bg-gray-900/95 backdrop-blur border-b border-gray-700 px-6 py-4 flex justify-between items-center z-10">
                    <h2 className="text-2xl font-bold text-white font-playfair">Event Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="relative rounded-lg overflow-hidden bg-gray-800 aspect-video lg:aspect-auto lg:h-full">
                            {imageLoading && (
                                <div className="absolute inset-0 animate-pulse bg-gray-700" />
                            )}
                            <img
                                src={getImageSrc(event)}
                                alt={event.title}
                                className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                                onLoad={() => setImageLoading(false)}
                                onError={() => {
                                    setImageLoading(false);
                                    setImageError(true);
                                }}
                            />
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-3xl font-bold text-white mb-2 font-playfair">
                                    {event.title}
                                </h3>
                                <span className="px-3 py-1 bg-yellow-400 text-black text-sm font-semibold rounded-full">
                                    {event.category}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-yellow-400 shrink-0" />
                                    <div>
                                        <p className="font-semibold text-white">Date & Time</p>
                                        <p className="text-gray-400">
                                            {new Date(event.event_date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                        <p className="text-gray-400">
                                            {new Date(event.event_date).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-yellow-400 shrink-0" />
                                    <div>
                                        <p className="font-semibold text-white">Venue</p>
                                        <p className="text-gray-400">{event.venue}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="font-semibold text-white mb-2">Status</p>
                                    <span
                                        className={`px-3 py-1 text-sm font-semibold rounded-full inline-block ${event.status === 'upcoming'
                                                ? 'bg-green-900/50 text-green-200 border border-green-700'
                                                : event.status === 'ongoing'
                                                    ? 'bg-blue-900/50 text-blue-200 border border-blue-700'
                                                    : 'bg-gray-800 text-gray-400 border border-gray-600'
                                            }`}
                                    >
                                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-white mb-2">Description</h4>
                                <p className="text-gray-400 leading-relaxed">
                                    {event.description}
                                </p>
                            </div>

                            {event.booking_url && (
                                <div className="pt-4">
                                    <button
                                        onClick={() => window.open(event.booking_url!, '_blank')}
                                        className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-yellow-400/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
