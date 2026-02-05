import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type ProductUiState = {
  isLoading: boolean;
  message: string | null;
};

const initialState: ProductUiState = {
  isLoading: false,
  message: null,
};

const productUiSlice = createSlice({
  name: "productUi",
  initialState,
  reducers: {
    setProductLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setProductMessage(state, action: PayloadAction<string | null>) {
      state.message = action.payload;
    },
  },
});

export const { setProductLoading, setProductMessage } = productUiSlice.actions;
export default productUiSlice.reducer;
