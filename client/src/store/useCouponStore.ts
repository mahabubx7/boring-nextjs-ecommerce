"use client";

import { getAxiosInstance } from "@/lib/axios";
import { API_ROUTES } from "@/utils/api";
import { create } from "zustand";

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usageCount: number;
  prizeCoupons:
    | {
        success: true;
        message: string;
        coupon: {
          code: string;
          discountPercent: number;
        };
      }
    | { success: false; message: string };
}

interface CouponStore {
  couponList: Coupon[];
  isLoading: boolean;
  error: string | null;
  fetchCoupons: () => Promise<void>;
  createCoupon: (
    coupon: Omit<Coupon, "id" | "usageCount" | "prizeCoupons">
  ) => Promise<Coupon | null>;
  deleteCoupon: (id: string) => Promise<boolean>;
}

export const useCouponStore = create<CouponStore>((set, get) => ({
  couponList: [],
  isLoading: false,
  error: null,
  fetchCoupons: async () => {
    set({ isLoading: true, error: null });
    try {
      const ax = getAxiosInstance(API_ROUTES.COUPON);
      const response = await ax.get(`/fetch-all-coupons`);
      console.log("all-cps: ", response.data);
      set({ couponList: response.data.couponList, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: "Failed to fetch coupons" });
    }
  },
  createCoupon: async (coupon) => {
    set({ isLoading: true, error: null });
    try {
      const ax = getAxiosInstance(API_ROUTES.COUPON);
      const response = await ax.post(`/create-coupon`, coupon);

      set({ isLoading: false });
      return response.data.coupon;
    } catch (e) {
      set({ isLoading: false, error: "Failed to fetch coupons" });
      return null;
    }
  },
  deleteCoupon: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const ax = getAxiosInstance(API_ROUTES.COUPON);
      const response = await ax.delete(`/${id}`);
      set({ isLoading: false });
      return response.data.success;
    } catch (error) {
      set({ isLoading: false, error: "Failed to fetch coupons" });
      return null;
    }
  },
}));
