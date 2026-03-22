import axios from 'axios';
import * as storage from './storage';
import { Platform } from 'react-native';

export const API_URL = 'http://localhost:9999/api';
// export const API_URL = 'https://mythicscroll-backend.onrender.com/api';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await storage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.warn("Failed to retrieve token for API request", error);
  }
  return config;
});

export interface User {
  _id?: string;
  id?: string;
  username: string;
  email: string;
}

export interface Manga {
  _id: string;
  id?: string;
  title: string;
  description: string;
  genres: string[];
  coverUrl: string;
  status: string;
  year: number;
  uploadedAt: string;
  averageRating?: number;
  ratingCount?: number;
  userRating?: number;
}

export interface Chapter {
  _id: string;
  mangaId: string;
  chapterNumber: string;
  title: string;
  pages: string[];
}

export interface Genre {
  _id: string;
  name: string;
}

export const getMangas = async (params: { keyword?: string; genre?: string[]; status?: string; sort?: string } = {}): Promise<Manga[]> => {
  const res = await api.get('/manga', { params });
  return res.data;
};

export const getMangaById = async (id: string): Promise<Manga> => {
  const res = await api.get(`/manga/${id}`);
  return res.data;
};

export const getChaptersByMangaId = async (mangaId: string): Promise<Chapter[]> => {
  const res = await api.get(`/chapters/${mangaId}`);
  return res.data;
};

export const getChapterById = async (chapterId: string): Promise<Chapter> => {
  const res = await api.get(`/chapters/single/${chapterId}`);
  return res.data;
};

export const getGenres = async (): Promise<Genre[]> => {
  const res = await api.get('/genres');
  return res.data;
};

export const getFeaturedManga = async (): Promise<Manga[]> => {
  const res = await api.get('/manga', { params: { sort: '-uploadedAt' } });
  return res.data.slice(0, 5);
};

export const getLatestUpdates = async (): Promise<Manga[]> => {
  const res = await api.get('/manga', { params: { sort: '-uploadedAt' } });
  return res.data.slice(0, 10);
};

export const searchManga = async (query: string): Promise<Manga[]> => {
  const res = await api.get('/manga', { params: { keyword: query } });
  return res.data;
};

export const login = async (email: string, password: string): Promise<{ token: string; user: User }> => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
}

export const register = async (username: string, email: string, password: string): Promise<{ token: string; user: User }> => {
  const res = await api.post('/auth/register', { username, email, password });
  return res.data;
}

export const getProfile = async (): Promise<User> => {
  const res = await api.get('/users/profile');
  return res.data;
}

export const logout = async () => {
  await storage.deleteItem('userToken');
}

export const rateManga = async (mangaId: string, rating: number): Promise<any> => {
  const res = await api.post(`/manga/${mangaId}/rate`, { rating });
  return res.data;
};
