import type { Reducer, ReducersMapObject } from "@reduxjs/toolkit";
import { combineReducers } from "@reduxjs/toolkit";

export type ReducerManager = {
  reduce: Reducer;
  add: (key: string, reducer: Reducer) => void;
  remove: (key: string) => void;
  getReducerMap: () => ReducersMapObject;
};

const createReducerManager = (initialReducers: ReducersMapObject): ReducerManager => {
  const reducers = { ...initialReducers };
  let combinedReducer = combineReducers(reducers);

  return {
    reduce: (state, action) => {
      let nextState = state;
      if (nextState) {
        const keysToRemove = Object.keys(nextState).filter(
          (key) => !reducers[key]
        );
        if (keysToRemove.length) {
          nextState = { ...nextState };
          keysToRemove.forEach((key) => {
            delete nextState[key];
          });
        }
      }
      return combinedReducer(nextState, action);
    },
    add: (key, reducer) => {
      if (!key || reducers[key]) return;
      reducers[key] = reducer;
      combinedReducer = combineReducers(reducers);
    },
    remove: (key) => {
      if (!key || !reducers[key]) return;
      delete reducers[key];
      combinedReducer = combineReducers(reducers);
    },
    getReducerMap: () => reducers,
  };
};

export default createReducerManager;
