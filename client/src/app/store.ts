import { configureStore } from "@reduxjs/toolkit";
import accessTokenReducer from "../features/accessToken/accessTokenSlice";

export default configureStore({
  reducer: {
    accessToken: accessTokenReducer
  },
})