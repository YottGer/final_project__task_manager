import { createSlice } from '@reduxjs/toolkit'

export const accessTokenSlice = createSlice({
  name: 'accessToken',
  initialState: {
    token: ""
  },
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    }
  }
});

export const { setToken } = accessTokenSlice.actions;

export default accessTokenSlice.reducer;