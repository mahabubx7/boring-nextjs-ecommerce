'use client';

import axios from "axios";

export const getAxiosInstance = (base: string) => {
    if (typeof window === "undefined") return axios; // fallback for SSR
  
    return axios.create({
      baseURL: base,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        'x-refresh-token': localStorage.getItem("auth_rf_token") || "",
      },
    });
  };
  