import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// attach JWT if present (client-side only)
if (typeof window !== 'undefined') {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
}

export const fetcher = (url: string) => api.get(url).then((res) => res.data);

export type Region = 'north_coast' | 'ain_sokhna' | 'marsa_matrouh' | 'sharm';

export interface Listing {
  id: string;
  title: string;
  description: string;
  location: string;
  region: Region;
  images: string[];
  maxGuests: number;
  verifiedFlag: boolean;
  pricing?: { basePrice: string; weekendPrice?: string; seasonalPrice?: string };
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
  status: 'pending_review' | 'approved' | 'rejected';
  adminNotes?: string;
  rejectionReason?: string;
  createdAt: string;
}
