import { useEffect } from "react";
import type { Reducer } from "@reduxjs/toolkit";
import store from "../store/store";

const useInjectReducer = (key: string, reducer: Reducer) => {
  useEffect(() => {
    store.reducerManager.add(key, reducer);
    return () => {
      store.reducerManager.remove(key);
    };
  }, [key, reducer]);
};

export default useInjectReducer;
