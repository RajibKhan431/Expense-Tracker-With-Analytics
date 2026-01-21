import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: false,
    user: null,
  },
  reducers: {
    setUser: (state, actions) => {
      state.user = actions.payload.user;
      state.isAuthenticated = true;
    },
    logOut: (state) => {
      state.user = null;     
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, logOut } = authSlice.actions;
export default authSlice.reducer;
