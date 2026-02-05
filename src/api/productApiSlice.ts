import baseApi from "./baseApi";
import type { ApiResponse, ApiResponseWithPagination } from "../types/api";
import type { ItemsQueryParams } from "./itemApiSlice";

export type Product = {
  id: number;
  name: string;
  price: number;
  createdAt?: string;
};

export type ProductDraft = {
  name: string;
  price: number;
};

const productApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<
      ApiResponseWithPagination<Product[]>,
      ItemsQueryParams
    >({
      query: ({ status = "ok", page = 1, perPage = 5 } = {}) => ({
        url: "/products",
        method: "GET",
        params: { status, page, perPage },
      }),
      keepUnusedDataFor: 60,
      providesTags: ["Products"],
    }),
    createProduct: builder.mutation<ApiResponse<Product>, ProductDraft>({
      query: (body) => ({
        url: "/products",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Products"],
      async onQueryStarted(newItem, { dispatch, getState, queryFulfilled }) {
        const cachedArgs = productApiSlice.util.selectCachedArgsForQuery(
          getState(),
          "getProducts"
        );

        const tempId = Number(`-${Date.now()}`);
        const optimisticItem: Product = {
          id: tempId,
          name: newItem.name,
          price: newItem.price,
          createdAt: new Date().toISOString(),
        };

        const patches = cachedArgs.map((args) =>
          dispatch(
            productApiSlice.util.updateQueryData("getProducts", args, (draft) => {
              const list = draft?.data;
              if (!list) return;
              list.unshift(optimisticItem);
            })
          )
        );

        try {
          const { data } = await queryFulfilled;
          if (data?.data) {
            cachedArgs.forEach((args) => {
              dispatch(
                productApiSlice.util.updateQueryData("getProducts", args, (draft) => {
                  const list = draft?.data;
                  if (!list) return;
                  const index = list.findIndex((item) => item.id === tempId);
                  if (index >= 0) {
                    list[index] = data.data;
                  }
                })
              );
            });
          }
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
    }),
    updateProduct: builder.mutation<ApiResponse<Product>, Product>({
      query: ({ id, name, price }) => ({
        url: `/products/${id}`,
        method: "PUT",
        data: { name, price },
      }),
      async onQueryStarted(updatedItem, { dispatch, getState, queryFulfilled }) {
        const cachedArgs = productApiSlice.util.selectCachedArgsForQuery(
          getState(),
          "getProducts"
        );

        const patches = cachedArgs.map((args) =>
          dispatch(
            productApiSlice.util.updateQueryData("getProducts", args, (draft) => {
              const list = draft?.data;
              if (!list) return;
              const index = list.findIndex((item) => item.id === updatedItem.id);
              if (index >= 0) {
                list[index] = { ...list[index], ...updatedItem };
              }
            })
          )
        );

        try {
          const { data } = await queryFulfilled;
          if (data?.data) {
            cachedArgs.forEach((args) => {
              dispatch(
                productApiSlice.util.updateQueryData("getProducts", args, (draft) => {
                  const list = draft?.data;
                  if (!list) return;
                  const index = list.findIndex(
                    (item) => item.id === data.data.id
                  );
                  if (index >= 0) {
                    list[index] = data.data;
                  }
                })
              );
            });
          }
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
    }),
    deleteProduct: builder.mutation<ApiResponse<Product>, number>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApiSlice;

export default productApiSlice;
