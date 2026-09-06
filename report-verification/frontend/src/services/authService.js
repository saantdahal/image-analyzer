import axios from "axios";
import axiosInstance from "../api/axiosInstance";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export const loginUser = async ({ email, password }) => {
  const { data } = await axiosInstance.post("/auth/login/", {
    email,
    password,
  });

  const userRes = await axios.get(`${BASE_URL}/auth/me/`, {
    headers: { Authorization: `Bearer ${data.access}` },
  });

  return {
    accessToken: data.access,
    refreshToken: data.refresh,
    user: {
      id: userRes.data.id,
      email: userRes.data.email,
      firstName: userRes.data.first_name,
      middleName: userRes.data.middle_name,
      lastName: userRes.data.last_name,
      phone: userRes.data.phone_number,
      citizenshipNumber: userRes.data.citizenship_number,
      role: userRes.data.role ?? "user",
    },
  };
};

export const loginAdmin = async ({ email, password }) => {
  const { data } = await axiosInstance.post("/auth/admin/login/", {
    email,
    password,
  });
  return data;
};

export const registerUser = async (formData) => {
  const { data } = await axiosInstance.post("/auth/register/", formData);
  return data;
};

export const logoutUser = async () => {
  try {
    await axiosInstance.post("/auth/logout/");
  } catch {
    // Swallow — clear local state regardless
  }
};

export const refreshTokens = async (refreshToken) => {
  const { data } = await axiosInstance.post("/auth/refresh/", { refreshToken });
  return data; // { accessToken, refreshToken? }
};

export const getProfile = async (token = null) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const { data } = await axiosInstance.get("/auth/me/", config);
  return data;
};

export const updateProfile = async (updates) => {
  const formData = new FormData();
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  const { data } = await axiosInstance.put("auth/me/", formData);
  return data;
};