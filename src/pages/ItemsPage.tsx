import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useCreateItemMutation,
  useDeleteItemMutation,
  useGetItemsQuery,
  useUpdateItemMutation,
} from "../api/itemApiSlice";
import type { Item } from "../api/itemApiSlice";
import ItemForm from "../components/ItemForm";
import type { ItemFormValues } from "../components/ItemForm";
import ItemList from "../components/ItemList";
import useInjectReducer from "../hooks/useInjectReducer";
import itemUiReducer, { setItemLoading } from "../store/itemUiSlice";

type ApiErrorLike = {
  status?: number | string;
  errors?: string | string[];
  message?: string;
};

const getErrorMessage = (error: unknown) => {
  if (!error) return null;
  if (typeof error === "object" && error !== null) {
    const err = error as ApiErrorLike;
    if (err.errors) {
      return Array.isArray(err.errors) ? err.errors.join(", ") : err.errors;
    }
    if (err.message) return err.message;
  }
  return "Error desconocido";
};

const ItemsPage = () => {
  useInjectReducer("itemUi", itemUiReducer);
  const dispatch = useDispatch();
  const pageLoading = useSelector(
    (state: any) => state.itemUi?.isLoading ?? false
  );
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);

  const perPage = 5;
  const { data, error, isLoading, isFetching } = useGetItemsQuery({
    status: "ok",
    page,
    perPage,
  });

  useEffect(() => {
    dispatch(setItemLoading(isLoading || isFetching));
  }, [dispatch, isFetching, isLoading]);

  const [createItem, createState] = useCreateItemMutation();
  const [updateItem, updateState] = useUpdateItemMutation();
  const [deleteItem, deleteState] = useDeleteItemMutation();

  const items = data?.data || [];
  const pagination = data?.meta?.pagination;

  const orderedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (aTime !== bTime) return bTime - aTime;
      return b.id - a.id;
    });
  }, [items]);

  const pageInfo = useMemo(() => {
    if (!pagination) return null;
    return {
      current: pagination.currentPage,
      last: pagination.lastPage,
    };
  }, [pagination]);

  const currentEditingItem = useMemo(() => {
    if (!editingId) return null;
    return items.find((item) => item.id === editingId) || null;
  }, [editingId, items]);

  const initialValues = useMemo<ItemFormValues>(
    () => ({
      name: currentEditingItem?.name || "",
      price: currentEditingItem ? String(currentEditingItem.price) : "",
    }),
    [currentEditingItem]
  );

  const handleSubmit = useCallback(
    async (values: ItemFormValues) => {
      const price = Number(values.price);
      if (!values.name.trim() || !Number.isFinite(price)) return false;

      if (editingId) {
        const result = await updateItem({
          id: editingId,
          name: values.name.trim(),
          price,
        });
        if (!("error" in result)) setEditingId(null);
        return !("error" in result);
      }

      const result = await createItem({ name: values.name.trim(), price });
      return !("error" in result);
    },
    [createItem, editingId, updateItem]
  );

  const handleEdit = useCallback((item: Item) => {
    setEditingId(item.id);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    await deleteItem(id);
  }, [deleteItem]);

  const handleClear = useCallback(() => {
    setEditingId(null);
  }, []);

  const handlePrev = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setPage((prev) => Math.min(pageInfo?.last || prev, prev + 1));
  }, [pageInfo]);

  const listErrorMessage = getErrorMessage(error);
  const mutationErrorMessage =
    getErrorMessage(createState.error) ||
    getErrorMessage(updateState.error) ||
    getErrorMessage(deleteState.error);

  return (
    <div className="app">
      {pageLoading && (
        <div className="loading-overlay" role="status">
          <div className="spinner" />
          <span>Cargando...</span>
        </div>
      )}
      <header className="app__header">
        <div>
          <p className="app__eyebrow">Inventario</p>
          <h1>Items</h1>
          <p className="app__subtitle">
            CRUD de items con RTK Query y cache optimizada.
          </p>
        </div>
        <div className="app__meta">
          <span className="pill">/items</span>
          <span className="pill">status=ok</span>
          {pageLoading && <span className="pill">cargando...</span>}
        </div>
      </header>

      <section className="grid">
        <ItemForm
          initialValues={initialValues}
          isEditing={Boolean(editingId)}
          isLoading={createState.isLoading || updateState.isLoading}
          errorMessage={mutationErrorMessage}
          onSubmit={handleSubmit}
          onClear={handleClear}
        />
        <ItemList
          items={orderedItems}
          isLoading={isLoading}
          isFetching={isFetching}
          errorMessage={listErrorMessage}
          onEdit={handleEdit}
          onDelete={handleDelete}
          pageInfo={pageInfo}
          onPrev={handlePrev}
          onNext={handleNext}
          isDeleting={deleteState.isLoading}
        />
      </section>
    </div>
  );
};

export default ItemsPage;
