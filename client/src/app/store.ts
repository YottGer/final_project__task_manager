import { configureStore, combineReducers } from "@reduxjs/toolkit";
import accessTokenReducer from "../features/accessToken/accessTokenSlice";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";


const persistConfig = {
  key: 'root',
  varsion: 1,
  storage
};

const reducer = combineReducers({
  accessToken: accessTokenReducer
})

const persistedReducer = persistReducer(persistConfig, reducer);

export default configureStore({
  reducer: persistedReducer
})