import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios/api";
import URL from "../../utils/url";
import { showToast } from "../notification/notification";

export const SSOlogin = createAsyncThunk(
  "auth/SSOProvider",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(URL.auth.sso_providers);
      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.error || error.message || "Validation failed";
      const code = error?.response?.status || 500;
      console.log(message);
      console.log(error);
      showToast("error", code, message);
      return rejectWithValue({ message, code });
    }
  }
);
