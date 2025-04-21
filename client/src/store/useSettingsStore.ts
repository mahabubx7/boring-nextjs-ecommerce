'use client';

import { getAxiosInstance } from "@/lib/axios";
import { API_ROUTES } from "@/utils/api";
import axios from "axios";
import { create } from "zustand";

interface FeatureBanner {
  id: string;
  imageUrl: string;
}

interface FeaturedProduct {
  id: string;
  name: string;
  price: string;
  images: string[];
}

interface SettingsState {
  banners: FeatureBanner[];
  featuredProducts: FeaturedProduct[];
  isLoading: boolean;
  error: string | null;
  fetchBanners: () => Promise<void>;
  fetchFeaturedProducts: () => Promise<void>;
  addBanners: (files: File[]) => Promise<boolean>;
  updateFeaturedProducts: (productIds: string[]) => Promise<boolean>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  banners: [],
  featuredProducts: [],
  isLoading: false,
  error: null,
  fetchBanners: async () => {
    set({ isLoading: true, error: null });
    try {
      const ax = getAxiosInstance(API_ROUTES.SETTINGS);
      const response = await ax.get(`/get-banners`);
      set({ banners: response.data.banners, isLoading: false });
    } catch (e) {
      console.error(e);
      set({ error: "Failed to fetch banners", isLoading: false });
    }
  },
  fetchFeaturedProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const ax = getAxiosInstance(API_ROUTES.SETTINGS);
      const response = await ax.get(
        `/fetch-feature-products`,
        {
          withCredentials: true,
        }
      );
      set({
        featuredProducts: response.data.featuredProducts,
        isLoading: false,
      });
    } catch (e) {
      console.error(e);
      set({ error: "Failed to fetch banners", isLoading: false });
    }
  },
  addBanners: async (files: File[]) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));
      const ax = getAxiosInstance(API_ROUTES.SETTINGS);
      const response = await ax.post(
        `/banners`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      set({
        isLoading: false,
      });

      return response.data.success;
    } catch (e) {
      console.error(e);
      set({ error: "Failed to fetch banners", isLoading: false });
    }
  },
  updateFeaturedProducts: async (productIds: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const ax = getAxiosInstance(API_ROUTES.SETTINGS);
      const response = await ax.post(
        `/update-feature-products`,
        { productIds },
      );
      set({
        isLoading: false,
      });
      return response.data.success;
    } catch (e) {
      console.error(e);
      set({ error: "Failed to fetch banners", isLoading: false });
    }
  },
}));
