'use client';

import { getAxiosInstance } from "@/lib/axios";
import { API_ROUTES } from "@/utils/api";
import { create } from "zustand";

export interface Address {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

interface AddressStore {
  addresses: Address[];
  isLoading: boolean;
  error: string | null;
  fetchAddresses: () => Promise<void>;
  createAddress: (address: Omit<Address, "id">) => Promise<Address | null>;
  updateAddress: (
    id: string,
    address: Partial<Address>
  ) => Promise<Address | null>;
  deleteAddress: (id: string) => Promise<boolean>;
}

export const useAddressStore = create<AddressStore>((set, get) => ({
  addresses: [],
  isLoading: false,
  error: null,
  fetchAddresses: async () => {
    set({ isLoading: true, error: null });
    try {
      const ax = getAxiosInstance(API_ROUTES.ADDRESS);
      const response = await ax.get(`/get-address`);

      set({ addresses: response.data.address, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: "Failed to fetch address" });
    }
  },
  createAddress: async (address) => {
    set({ isLoading: true, error: null });
    try {
      const ax = getAxiosInstance(API_ROUTES.ADDRESS);
      const response = await ax.post(`/add-address`, address);

      const newAddress = response.data.address;

      set((state) => ({
        addresses: [newAddress, ...state.addresses],
        isLoading: false,
      }));

      return newAddress;
    } catch (e) {
      set({ isLoading: false, error: "Failed to create address" });
      return null;
    }
  },
  updateAddress: async (id, address) => {
    set({ isLoading: true, error: null });
    try {
      const ax = getAxiosInstance(API_ROUTES.ADDRESS);
      const response = await ax.put(`/update-address/${id}`, address);

      const updatedAddress = response.data.address;

      set((state) => ({
        addresses: state.addresses.map((item) =>
          item.id === id ? updatedAddress : item
        ),
        isLoading: false,
      }));

      return updatedAddress;
    } catch (e) {
      set({ isLoading: false, error: "Failed to update address" });
      return null;
    }
  },
  deleteAddress: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const ax = getAxiosInstance(API_ROUTES.ADDRESS);
      await ax.delete(`/delete-address/${id}`);

      set((state) => ({
        addresses: state.addresses.filter((address) => address.id !== id),
        isLoading: false,
      }));

      return true;
    } catch (e) {
      set({ isLoading: false, error: "Failed to delete address" });
      return false;
    }
  },
}));
