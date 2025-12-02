// API service for communicating with the Express backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

console.log('API Base URL:', API_BASE_URL);

export const getPublicUrl = (path: string | undefined | null) => {
  if (!path) return '';

  // Handle absolute URLs (external images)
  if (path.startsWith('http') && !path.includes('localhost:5000')) {
    return path;
  }

  // Handle legacy localhost:5000 URLs
  if (path.includes('localhost:5000')) {
    return path.replace('localhost:5000', 'localhost:5001');
  }

  // Handle relative paths
  if (path.startsWith('/')) {
    const origin = new URL(API_BASE_URL).origin;
    return `${origin}${path}`;
  }

  return path;
};

export interface Category {
  id?: string;
  _id?: string;
  name: string;
}

export interface Event {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  image: string;
  venue: string;
  category: string;
  event_date: string;
  is_featured: boolean;
  featured_order?: number | null;
  priority?: number | null;
  status: 'upcoming' | 'ongoing' | 'past';
  booking_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: AdminUser;
    token: string;
  };
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    original: {
      filename: string;
      size: number;
      mimetype: string;
    };
    optimized: {
      filename: string;
      url: string;
      path: string;
    };
    thumbnail: {
      filename: string;
      url: string;
      path: string;
    };
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('admin_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    let retries = 3;

    while (retries > 0) {
      try {
        const response = await fetch(url, config);

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Network error' }));
          throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        retries--;
        console.error(`API Request failed (${3 - retries}/3): ${endpoint}`, error);

        if (retries === 0) {
          throw error;
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, (3 - retries) * 1000));
      }
    }

    throw new Error('Request failed after retries');
  }

  // Event API methods
  async getAllEvents(params?: {
    status?: string;
    category?: string;
    featured?: boolean;
    limit?: number;
    skip?: number;
  }): Promise<{ success: boolean; data: Event[]; pagination?: any }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const query = searchParams.toString();
    return this.request(`/events${query ? `?${query}` : ''}`);
  }

  async getEventById(id: string): Promise<{ success: boolean; data: Event }> {
    return this.request(`/events/${id}`);
  }

  async getFeaturedEvents(): Promise<{ success: boolean; data: Event[] }> {
    return this.request('/events/featured');
  }

  async createEvent(eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data: Event }> {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(id: string, eventData: Partial<Event>): Promise<{ success: boolean; data: Event }> {
    try {
      return await this.request(`/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(eventData),
      });
    } catch (error: any) {
      console.error('Update Event API Error:', error);
      alert(`Debug: Update failed. Error: ${error.message}`);
      throw error;
    }
  }

  async deleteEvent(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Authentication API methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getProfile(): Promise<{ success: boolean; data: AdminUser }> {
    return this.request('/auth/profile');
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async createAdmin(adminData: { email: string; password: string }): Promise<{ success: boolean; data: AdminUser }> {
    return this.request('/auth/create-admin', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
  }

  // Admin dashboard API methods
  async getDashboardStats(): Promise<{ success: boolean; data: any }> {
    return this.request('/admin/dashboard-stats');
  }

  async getRecentEvents(limit?: number): Promise<{ success: boolean; data: Event[] }> {
    const query = limit ? `?limit=${limit}` : '';
    return this.request(`/admin/recent-events${query}`);
  }

  // Upload API methods
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Category endpoints
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.request('/categories');
  }

  async createCategory(name: string): Promise<ApiResponse<Category>> {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();