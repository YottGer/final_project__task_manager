import { createSlice } from '@reduxjs/toolkit'

export const accessTokenSlice = createSlice({
  name: 'accessToken',
  initialState: {
    token: "",
    username: "",
  },
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setUsername: (state, action) => {
      state.username = action.payload;
    }
  }
});

export const { setToken, setUsername } = accessTokenSlice.actions;

export default accessTokenSlice.reducer;