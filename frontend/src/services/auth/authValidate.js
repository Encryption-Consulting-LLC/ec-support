import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios/api";
import URL from "../../utils/url";
import { showToast } from "../notification/notification";

export const setupAutoValidate = createAsyncThunk(
  "auth/setupAutoValidate",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(URL.auth.validate);
      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.error || error.message || "Validation failed";
      const code = error?.response?.status || 500;
      showToast("error", code, message);
      return rejectWithValue({ message, code });
    }
  }
);
