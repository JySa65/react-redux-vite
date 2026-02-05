import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type ItemUiState = {
  isLoading: boolean;
  message: string | null;
};

const initialState: ItemUiState = {
  isLoading: false,
  message: null,
};

const itemUiSlice = createSlice({
  name: "itemUi",
  initialState,
  reducers: {
    setItemLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setItemMessage(state, action: PayloadAction<string | null>) {
      state.message = action.payload;
    },
  },
});

export const { setItemLoading, setItemMessage } = itemUiSlice.actions;
export default itemUiSlice.reducer;
