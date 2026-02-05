import { configureStore } from "@reduxjs/toolkit";
import baseApi from "../api/baseApi";
import createReducerManager from "./reducerManager";
import appReducer from "./appSlice";

const reducerManager = createReducerManager({
  [baseApi.reducerPath]: baseApi.reducer,
  app: appReducer,
});

const store = configureStore({
  reducer: reducerManager.reduce,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

(store as AppStore).reducerManager = reducerManager;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store & {
  reducerManager: ReturnType<typeof createReducerManager>;
};

export default store;
