import baseApi from "./baseApi";
import type { ApiResponse, ApiResponseWithPagination } from "../types/api";

export type Item = {
  id: number;
  name: string;
  price: number;
  createdAt?: string;
};

export type ItemDraft = {
  name: string;
  price: number;
};

export type ItemsQueryParams = {
  status?: string;
  page?: number;
  perPage?: number;
};

const itemApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getItems: builder.query<ApiResponseWithPagination<Item[]>, ItemsQueryParams>(
      {
        query: ({ status = "ok", page = 1, perPage = 5 } = {}) => ({
          url: "/items",
          method: "GET",
          params: { status, page, perPage },
        }),
        keepUnusedDataFor: 60,
        providesTags: ["Items"],
      }
    ),
    createItem: builder.mutation<ApiResponse<Item>, ItemDraft>({
      query: (body) => ({
        url: "/items",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Items"],
      async onQueryStarted(newItem, { dispatch, getState, queryFulfilled }) {
        const cachedArgs = itemApiSlice.util.selectCachedArgsForQuery(
          getState(),
          "getItems"
        );

        const tempId = Number(`-${Date.now()}`);
        const optimisticItem: Item = {
          id: tempId,
          name: newItem.name,
          price: newItem.price,
          createdAt: new Date().toISOString(),
        };

        const patches = cachedArgs.map((args) =>
          dispatch(
            itemApiSlice.util.updateQueryData("getItems", args, (draft) => {
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
                itemApiSlice.util.updateQueryData("getItems", args, (draft) => {
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
    updateItem: builder.mutation<ApiResponse<Item>, Item>({
      query: ({ id, name, price }) => ({
        url: `/items/${id}`,
        method: "PUT",
        data: { name, price },
      }),
      async onQueryStarted(updatedItem, { dispatch, getState, queryFulfilled }) {
        const cachedArgs = itemApiSlice.util.selectCachedArgsForQuery(
          getState(),
          "getItems"
        );

        const patches = cachedArgs.map((args) =>
          dispatch(
            itemApiSlice.util.updateQueryData("getItems", args, (draft) => {
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
                itemApiSlice.util.updateQueryData("getItems", args, (draft) => {
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
    deleteItem: builder.mutation<ApiResponse<Item>, number>({
      query: (id) => ({
        url: `/items/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Items"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetItemsQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
} = itemApiSlice;

export default itemApiSlice;
