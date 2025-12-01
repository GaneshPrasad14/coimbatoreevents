import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Star, X, Upload, Image as ImageIcon, Tag } from 'lucide-react';
import { apiService, Event, Category, getPublicUrl } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export function AdminDashboard() {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    venue: '',
    category: '',
    event_date: '',
    is_featured: false,
    featured_order: '',
    priority: '',
    status: 'upcoming' as 'upcoming' | 'ongoing' | 'past',
    booking_url: '',
  });

  useEffect(() => {
    if (isAdmin) {
      fetchEvents();
      fetchCategories();
    }
  }, [isAdmin]);

  const fetchEvents = async () => {
    try {
      const response = await apiService.getAllEvents({
        limit: 10000,
        skip: 0
      });

      if (response.success) {
        setEvents(response.data || []);
        setImageErrors(new Set());
      } else {
        throw new Error('Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
        // Set default category if available and not set
        if (response.data.length > 0 && !formData.category) {
          setFormData(prev => ({ ...prev, category: response.data![0].name }));
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const response = await apiService.createCategory(newCategoryName.trim());
      if (response.success) {
        setNewCategoryName('');
        fetchCategories();
        alert('Category created successfully');
      } else {
        throw new Error(response.message || 'Failed to create category');
      }
    } catch (error: any) {
      console.error('Error creating category:', error);
      alert(error.message || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const response = await apiService.deleteCategory(id);
      if (response.success) {
        fetchCategories();
      } else {
        throw new Error(response.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const eventData = {
        ...formData,
        featured_order: formData.featured_order ? parseInt(formData.featured_order) : null,
        priority: formData.priority ? parseInt(formData.priority) : null,
        // Ensure category is set, fallback to first available if empty
        category: formData.category || (categories.length > 0 ? categories[0].name : 'Uncategorized')
      };
      console.log('Submitting event data:', eventData);

      if (editingEvent) {
        const id = editingEvent.id || editingEvent._id;
        if (!id) throw new Error('Event ID is missing');
        const response = await apiService.updateEvent(id, eventData);
        if (!response.success) throw new Error('Failed to update event');
      } else {
        const response = await apiService.createEvent(eventData);
        if (!response.success) throw new Error('Failed to create event');
      }

      setShowModal(false);
      setEditingEvent(null);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event. Please try again.');
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      image: event.image,
      venue: event.venue,
      category: event.category,
      event_date: event.event_date.split('T')[0],
      is_featured: event.is_featured,
      featured_order: event.featured_order?.toString() || '',
      priority: event.priority?.toString() || '',
      status: event.status,
      booking_url: event.booking_url || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await apiService.deleteEvent(id);
      if (!response.success) throw new Error(response.message || 'Failed to delete event');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      venue: '',
      category: categories.length > 0 ? categories[0].name : '',
      event_date: '',
      is_featured: false,
      featured_order: '',
      priority: '',
      status: 'upcoming',
      booking_url: '',
    });
  };

  const handleImageError = (eventId: string) => {
    setImageErrors(prev => new Set(prev).add(eventId));
  };

  const getImageSrc = (event: Event) => {
    if (imageErrors.has(event.id!)) {
      return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop&crop=entropy&auto=format';
    }
    return getPublicUrl(event.image);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      const response = await apiService.uploadImage(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success && response.data) {
        const newUrl = response.data.optimized.url;
        setFormData(prev => ({ ...prev, image: newUrl }));
        alert('Image uploaded successfully!');
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      event.target.value = '';
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 font-playfair">Access Denied</h2>
          <p className="text-gray-600">You do not have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-playfair">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your events</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 border border-gray-200 transition-all duration-300"
            >
              <Tag className="w-5 h-5" />
              Categories
            </button>
            <button
              onClick={() => {
                setEditingEvent(null);
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              Add Event
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No events yet. Create your first event!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hero Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event.id || event._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getImageSrc(event)}
                            alt={event.title}
                            className="w-16 h-16 rounded-lg object-cover"
                            onError={() => handleImageError(event.id || event._id!)}
                          />
                          <div>
                            <div className="font-semibold text-gray-900">{event.title}</div>
                            <div className="text-sm text-gray-500">{event.venue}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(event.event_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {event.priority || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                          {event.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${event.status === 'upcoming'
                            ? 'bg-green-100 text-green-800'
                            : event.status === 'ongoing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {event.is_featured && (
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-xs font-semibold">
                              {event.featured_order}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(event)}
                          className="text-orange-600 hover:text-orange-900 mr-4"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            const id = event.id || event._id;
                            if (id) handleDelete(id);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 p-4">
              {events.map((event) => (
                <div key={event.id || event._id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="flex p-4 gap-4">
                    <img
                      src={getImageSrc(event)}
                      alt={event.title}
                      className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                      onError={() => handleImageError(event.id || event._id!)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-900 truncate pr-2">{event.title}</h3>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleEdit(event)}
                            className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const id = event.id || event._id;
                              if (id) handleDelete(id);
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{event.venue}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                          {event.category}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${event.status === 'upcoming'
                            ? 'bg-green-100 text-green-800'
                            : event.status === 'ongoing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {event.status}
                        </span>
                        {event.is_featured && (
                          <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 fill-current" />
                            {event.featured_order}
                          </span>
                        )}
                        {event.priority && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            Pri: {event.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
                    <span>{new Date(event.event_date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 font-playfair">Manage Categories</h2>
              <button onClick={() => setShowCategoryModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleCreateCategory} className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category name"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                />
                <button
                  type="submit"
                  disabled={!newCategoryName.trim()}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </form>

              <div className="space-y-2">
                {categories.map(category => (
                  <div key={category.id || category._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">{category.name}</span>
                    <button
                      onClick={() => handleDeleteCategory(category.id || category._id!)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No categories found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 font-playfair">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingEvent(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Image
                </label>

                {/* File Upload Option */}
                <div className="mb-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      disabled={uploading}
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-sm">
                        {uploading ? 'Uploading...' : 'Upload Image'}
                      </span>
                    </button>

                    {formData.image && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ImageIcon className="w-4 h-4" />
                        <span>Image selected</span>
                      </div>
                    )}
                  </div>

                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />

                  {uploading && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>


              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Venue *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id || category._id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'upcoming' | 'ongoing' | 'past',
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="past">Past</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Booking URL
                </label>
                <input
                  type="url"
                  value={formData.booking_url}
                  onChange={(e) => setFormData({ ...formData, booking_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  General Priority (1 = first)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Leave empty for default order"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) =>
                      setFormData({ ...formData, is_featured: e.target.checked })
                    }
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Show in Hero Section</span>
                </label>

                {formData.is_featured && (
                  <div className="flex-1">
                    <input
                      type="number"
                      min="1"
                      placeholder="Hero Priority (1 = first)"
                      value={formData.featured_order}
                      onChange={(e) =>
                        setFormData({ ...formData, featured_order: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEvent(null);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
