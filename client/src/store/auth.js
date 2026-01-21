import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: false,
    user: null, // ✅ FIX: must be null, NOT {}
  },
  reducers: {
    setUser: (state, actions) => {
      state.user = actions.payload.user;
      state.isAuthenticated = true;
    },
    logOut: (state) => {
      state.user = null;      // ✅ reset to null
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, logOut } = authSlice.actions;
export default authSlice.reducer;