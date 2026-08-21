import { createSlice, createSelector } from "@reduxjs/toolkit";
import { Status } from "../../utils/enum";
import { autoRefresh } from "../../services/auth/autoRefresh";
import { setupAutoValidate } from "../../services/auth/authValidate";
import { SSOlogin } from "../../services/login/SSOlogin";

const initialState = {
  sessionRenew: {
    status: Status.Idle,
    data: null,
    error: null,
  },
  userInfo: {
    status: Status.Idle,
    data: null,
    error: null,
  },
  autoValidate: {
    status: Status.Idle,
    data: null,
    error: null,
  },
  SSOProvider: {
    status: Status.Idle,
    data: null,
    error: null,
  },
  session: null,
  products: null,
  expiredSession: false,
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession: (state, action) => {
      state.session = action.payload;
    },
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    setExpiredSession: (state, action) => {
      state.expiredSession = action.payload;
    },
    resetAutoValidate: (state) => {
      state.autoValidate = initialState.autoValidate;
    },
  },
  extraReducers: (builder) => {
    builder
      // For Fetching Auto Renew Information
      .addCase(autoRefresh.pending, (state) => {
        state.sessionRenew.status = Status.Loading;
      })
      .addCase(autoRefresh.fulfilled, (state, action) => {
        state.sessionRenew.status = Status.Succeeded;
        state.sessionRenew.data = action.payload;
      })
      .addCase(autoRefresh.rejected, (state, action) => {
        state.sessionRenew.status = Status.Failed;
        state.sessionRenew.data = null;
        state.sessionRenew.error = action.payload;
      })

      // For Fetching Auto Validate Information
      .addCase(setupAutoValidate.pending, (state) => {
        state.autoValidate.status = Status.Loading;
      })
      .addCase(setupAutoValidate.fulfilled, (state, action) => {
        state.autoValidate.status = Status.Succeeded;
        state.autoValidate.data = action.payload;
      })
      .addCase(setupAutoValidate.rejected, (state, action) => {
        state.autoValidate.status = Status.Failed;
        state.autoValidate.data = null;
        state.autoValidate.error = action.payload;
      })

      // For Fetching SSO Provider Information
      .addCase(SSOlogin.pending, (state) => {
        state.SSOProvider.status = Status.Loading;
      })
      .addCase(SSOlogin.fulfilled, (state, action) => {
        state.SSOProvider.status = Status.Succeeded;
        state.SSOProvider.data = action.payload;
      })
      .addCase(SSOlogin.rejected, (state, action) => {
        state.SSOProvider.status = Status.Failed;
        state.SSOProvider.data = null;
        state.SSOProvider.error = action.payload;
      });
  },
});

export const { setSession, setProducts, setExpiredSession, resetAutoValidate } =
  authSlice.actions;

export const selectUserSession = (state) => state.auth.session;

export const selectAutoRefresh = (state) => state.auth.sessionRenew;

export const selectAutoValidate = (state) => state.auth.autoValidate;

export const selectSSOProvider = (state) => state.auth.SSOProvider;

export default authSlice.reducer;
