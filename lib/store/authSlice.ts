import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginUser,
  registerUser,
  logoutUser,
  getMe,
  type User,
} from "@/lib/api";

interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
};

export const fetchMeThunk = createAsyncThunk("auth/fetchMe", () => getMe());

export const loginThunk = createAsyncThunk(
  "auth/login",
  (body: { email: string; password: string }) => loginUser(body),
);

export const registerThunk = createAsyncThunk(
  "auth/register",
  (body: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => registerUser(body),
);

export const logoutThunk = createAsyncThunk("auth/logout", () => logoutUser());

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchMe
    builder
      .addCase(fetchMeThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMeThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(fetchMeThunk.rejected, (state) => {
        state.status = "failed";
        state.user = null;
      });

    // login
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Login failed";
      });

    // register
    builder
      .addCase(registerThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Registration failed";
      });

    // logout
    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.user = null;
      state.status = "succeeded";
    });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
