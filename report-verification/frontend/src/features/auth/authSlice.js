import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const loadFromStorage = () => {
  try {
    return {
      user: JSON.parse(localStorage.getItem("user")) || null,
      accessToken: localStorage.getItem("accessToken") || null,
      refreshToken: localStorage.getItem("refreshToken") || null,
    };
  } catch {
    return { user: null, accessToken: null, refreshToken: null };
  }
};

const saveToStorage = ({ user, accessToken, refreshToken }) => {
  if (user) localStorage.setItem("user", JSON.stringify(user));
  if (accessToken) localStorage.setItem("accessToken", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
};

const clearStorage = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

const camelToSnakeObj = (obj) => {
  const result = {};
  Object.keys(obj).forEach((key) => {
    const snakeKey = key.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);
    result[snakeKey] = obj[key];
  });
  return result;
};

export const restoreSessionThunk = createAsyncThunk(
  "auth/restoreSession",
  async () => {
    const stored = loadFromStorage();

    if (!stored.accessToken || !stored.user) {
      return { user: null, accessToken: null, refreshToken: null };
    }

    try {
      const payload = JSON.parse(atob(stored.accessToken.split(".")[1]));
      const isExpired = payload.exp * 1000 < Date.now();

      if (isExpired && stored.refreshToken) {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh/`,
          { refresh: stored.refreshToken },
        );
        const newAccessToken = data.access;
        localStorage.setItem("accessToken", newAccessToken);
        return {
          user: stored.user,
          accessToken: newAccessToken,
          refreshToken: stored.refreshToken,
        };
      }
    } catch (e) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      return { user: null, accessToken: null, refreshToken: null };
    }

    return stored;
  },
);

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      const normalizedUser = camelToSnakeObj(user);

      state.user = normalizedUser;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.error = null;
      saveToStorage({ user: normalizedUser, accessToken, refreshToken });
    },

    updateAccessToken: (state, action) => {
      state.accessToken = action.payload;
      localStorage.setItem("accessToken", action.payload);
    },

    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(state.user));
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
      clearStorage();
    },

    setError: (state, action) => {
      state.error = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(restoreSessionThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreSessionThunk.fulfilled, (state, action) => {
        const { user, accessToken, refreshToken } = action.payload;
        state.user = user;
        state.accessToken = accessToken;
        state.refreshToken = refreshToken;
        state.loading = false;
      })
      .addCase(restoreSessionThunk.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.loading = false;
      });
  },
});

export const {
  setCredentials,
  updateAccessToken,
  updateUser,
  logout,
  setError,
} = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectIsAuthenticated = (state) =>
  !!state.auth.accessToken && !!state.auth.user;
export const selectIsAdmin = (state) => state.auth.user?.role === "admin";
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectUserRole = (state) => state.auth.user?.role ?? null;

export default authSlice.reducer;
