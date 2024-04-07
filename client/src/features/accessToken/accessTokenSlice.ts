import { createSlice } from '@reduxjs/toolkit'

export const accessTokenSlice = createSlice({
  name: 'accessToken',
  initialState: {
    token: "",
    username: "",
    isAdmin: false
  },
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setUsername: (state, action) => {
      state.username = action.payload;
    },
    setIsAdmin: (state, action) => {
      state.isAdmin = action.payload;
    }
  }
});

export const { setToken, setUsername, setIsAdmin } = accessTokenSlice.actions;

export default accessTokenSlice.reducer;