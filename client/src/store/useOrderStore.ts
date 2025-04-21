"use client";

import { create } from "zustand";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productCategory: string;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
}

type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED";
type PaymentMethod = "COD" | "ONLINE";
type PaymentStatus = "PENDING" | "COMPLETED";

export interface Order {
  id: string;
  userId: string;
  addressId: string;
  items: OrderItem[];
  couponId?: string;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrder {
  id: string;
  userId: string;
  addressId: string;
  items: OrderItem[];
  couponId?: string;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface CreateOrderData {
  userId: string;
  addressId: string;
  items: Omit<OrderItem, "id">[];
  couponId?: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTrxId?: string;
}

interface OrderStore {
  currentOrder: Order | null;
  isLoading: boolean;
  isPaymentProcessing: boolean;
  userOrders: Order[];
  adminOrders: AdminOrder[];
  error: string | null;
  // createPayPalOrder: (items: any[], total: number) => Promise<string | null>;
  // capturePayPalOrder: (orderId: string) => Promise<any | null>;
  // createFinalOrder: (orderData: CreateOrderData) => Promise<Order | null>;
  // getOrder: (orderId: string) => Promise<Order | null>;
  // updateOrderStatus: (
  //   orderId: string,
  //   status: Order["status"]
  // ) => Promise<boolean>;
  // getAllOrders: () => Promise<Order[] | null>;
  // getOrdersByUserId: () => Promise<Order[] | null>;
  // setCurrentOrder: (order: Order | null) => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  currentOrder: null,
  isLoading: true,
  error: null,
  isPaymentProcessing: false,
  userOrders: [],
  adminOrders: [],
  // createPayPalOrder: async (items, total) => {
  //   set({ isLoading: true, error: null });
  //   try {
  //     const ax = getAxiosInstance(API_ROUTES.ORDER);
  //     const response = await ax.post(`/create-paypal-order`, { items, total });
  //     set({ isLoading: false });
  //     return response.data.id;
  //   } catch (error) {
  //     set({ error: "Failed to create paypal order", isLoading: false });
  //     return null;
  //   }
  // },
  // capturePayPalOrder: async (orderId) => {
  //   set({ isLoading: true, error: null, isPaymentProcessing: true });
  //   try {
  //     const ax = getAxiosInstance(API_ROUTES.ORDER);
  //     const response = await ax.post(`/capture-paypal-order`, { orderId });
  //     set({ isLoading: false, isPaymentProcessing: false });
  //     return response.data;
  //   } catch (error) {
  //     set({
  //       error: "Failed to capture paypal order",
  //       isLoading: false,
  //       isPaymentProcessing: false,
  //     });
  //     return null;
  //   }
  // },
  // createFinalOrder: async (orderData) => {
  //   set({ isLoading: true, error: null, isPaymentProcessing: true });
  //   try {
  //     const ax = getAxiosInstance(API_ROUTES.ORDER);
  //     const response = await ax.post(`/create-final-order`, orderData);
  //     set({
  //       isLoading: false,
  //       currentOrder: response.data,
  //       isPaymentProcessing: false,
  //     });
  //     return response.data;
  //   } catch (error) {
  //     set({
  //       error: "Failed to capture paypal order",
  //       isLoading: false,
  //       isPaymentProcessing: false,
  //     });
  //     return null;
  //   }
  // },
  // updateOrderStatus: async (orderId, status) => {
  //   set({ isLoading: true, error: null });
  //   try {
  //     const ax = getAxiosInstance(API_ROUTES.ORDER);
  //     await ax.put(`/${orderId}/status`, { status });
  //     set((state) => ({
  //       currentOrder:
  //         state.currentOrder && state.currentOrder.id === orderId
  //           ? {
  //               ...state.currentOrder,
  //               status,
  //             }
  //           : state.currentOrder,
  //       isLoading: false,
  //       adminOrders: state.adminOrders.map((item) =>
  //         item.id === orderId
  //           ? {
  //               ...item,
  //               status,
  //             }
  //           : item
  //       ),
  //     }));
  //     return true;
  //   } catch (error) {
  //     set({ error: "Failed to capture paypal order", isLoading: false });
  //     return false;
  //   }
  // },
  // getAllOrders: async () => {
  //   set({ isLoading: true, error: null });
  //   try {
  //     const ax = getAxiosInstance(API_ROUTES.ORDER);
  //     const response = await ax.get(`/get-all-orders-for-admin`);
  //     set({ isLoading: false, adminOrders: response.data });
  //     return response.data;
  //   } catch (error) {
  //     set({ error: "Failed to fetch all orders for admin", isLoading: false });
  //     return null;
  //   }
  // },
  // getOrdersByUserId: async () => {
  //   set({ isLoading: true, error: null });
  //   try {
  //     const ax = getAxiosInstance(API_ROUTES.ORDER);
  //     const response = await ax.get(`/get-order-by-user-id`);
  //     set({ isLoading: false, userOrders: response.data });
  //     return response.data;
  //   } catch (error) {
  //     set({ error: "Failed to fetch all orders for admin", isLoading: false });
  //     return null;
  //   }
  // },
  // setCurrentOrder: (order) => set({ currentOrder: order }),
  // getOrder: async (orderId) => {
  //   set({ isLoading: true, error: null });
  //   try {
  //     const ax = getAxiosInstance(API_ROUTES.ORDER);
  //     const response = await ax.get(`/get-single-order/${orderId}`);
  //     set({ isLoading: false, currentOrder: response.data });
  //     return response.data;
  //   } catch (error) {
  //     set({ error: "Failed to fetch all orders for admin", isLoading: false });
  //     return null;
  //   }
  // },
}));

export type OrderPaymentProduct = {
  product_name: string;
  product_category: string;
  product_profile: string;
};

export type OrderPaymentCustomerInfo = {
  cus_name: string;
  cus_email: string;
  cus_add1: string;
  cus_add2: string;
  cus_city: string;
  cus_state: string;
  cus_postcode: string;
  cus_country: string;
  cus_phone: string;
  cus_fax: string;
};

export type OrderPaymentShippingInfo = {
  ship_name: string;
  ship_add1: string;
  ship_add2: string;
  ship_city: string;
  ship_state: string;
  ship_postcode: number;
  ship_country: string;
};

export type OrderPaymentInitDataType = {
  total_amount: number;
  currency: "BDT"; // BDT as fixed for now
  // tran_id: string;

  // success_url: string;
  // fail_url: string;
  // cancel_url: string;
  // ipn_url: string;

  shipping_method: string;
} & OrderPaymentCustomerInfo &
  OrderPaymentShippingInfo &
  OrderPaymentProduct;
