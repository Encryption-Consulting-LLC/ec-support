import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios/api";
import URL from "../../utils/url";
import { showToast } from "../notification/notification";

export const autoRefresh = createAsyncThunk(
  "auth/auto_renew",
  async (sessionInfo, { rejectWithValue }) => {
    try {
      const response = await api.post(URL.auth.refresh, sessionInfo);
      return response?.data;
    } catch (error) {
      // Axios wraps HTTP failures inside error.response; .status on
      // the bare error is undefined, which collapsed every refresh
      // failure to "500" in the toast even when the backend returned
      // 401 / 502 / 503. Read through response first, fall back to a
      // bare-error message string if the request never reached the
      // server (network failure, CORS, etc.).
      const code = error?.response?.status ?? 500;
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Session refresh failed";
      showToast("error", code, message);
      return rejectWithValue({ message, code });
    }
  }
);
