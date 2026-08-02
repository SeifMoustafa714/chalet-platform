import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

if (typeof window !== 'undefined') {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  let refreshPromise: Promise<string | null> | null = null;

  async function refreshAccessToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, { refreshToken });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data.accessToken;
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return null;
    }
  }

  api.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config;
      if (error.response?.status === 401 && !original._retry) {
        original._retry = true;
        if (!refreshPromise) refreshPromise = refreshAccessToken();
        const newToken = await refreshPromise;
        refreshPromise = null;

        if (newToken) {
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        }
        window.location.href = '/login';
      }
      return Promise.reject(error);
    },
  );
}

export const fetcher = (url: string) => api.get(url).then((res) => res.data);

export interface CurrentUser {
  userId: string;
  email: string;
  role: 'USER' | 'BROKER' | 'ADMIN';
}

export function getCurrentUser(): CurrentUser | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { userId: payload.sub, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
}

export type Region = 'north_coast' | 'ain_sokhna' | 'marsa_matrouh' | 'sharm';

export const AMENITIES = [
  'WiFi', 'Pool', 'Air Conditioning', 'Sea View', 'Parking',
  'BBQ Area', 'Kids Friendly', 'Beach Access', 'Generator', 'Smart TV',
];

export function whatsappLink(phone: string, message: string) {
  const digits = phone.replace(/\D/g, '');
  const withCountryCode = digits.startsWith('20')
    ? digits
    : digits.startsWith('0')
      ? '20' + digits.slice(1)
      : '20' + digits;
  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  location: string;
  region: Region;
  images: string[];
  amenities: string[];
  maxGuests: number;
  verifiedFlag: boolean;
  contactPhone?: string;
  pricing?: { basePrice: string; weekendPrice?: string; seasonalPrice?: string };
  availability?: { date: string; isBlocked: boolean }[];
  reviews?: Review[];
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: { fullName: string };
}

export interface ListingRequest {
  id: string;
  title: string;
  description: string;
  location: string;
  region: Region;
  images: string[];
  maxGuests: number;
  priceMin?: string;
  priceMax?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  status: 'pending_review' | 'approved' | 'rejected';
  adminNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  user?: { fullName: string; email: string; phone?: string };
}
