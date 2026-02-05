import { memo } from "react";
export type ItemLike = {
  id: number;
  name: string;
  price: number;
  createdAt?: string;
};

type PageInfo = {
  current: number;
  last: number;
} | null;

type ItemListProps = {
  items: ItemLike[];
  isLoading: boolean;
  isFetching: boolean;
  errorMessage: string | null;
  onEdit: (item: ItemLike) => void;
  onDelete: (id: number) => void;
  pageInfo: PageInfo;
  onPrev: () => void;
  onNext: () => void;
  isDeleting: boolean;
};

const ItemList = ({
  items,
  isLoading,
  isFetching,
  errorMessage,
  onEdit,
  onDelete,
  pageInfo,
  onPrev,
  onNext,
  isDeleting,
}: ItemListProps) => {
  return (
    <div className="panel">
      <div className="list__header">
        <h2>Items</h2>
        <div className="list__meta">{isFetching && <span>Actualizando...</span>}</div>
      </div>
      {isLoading ? (
        <div className="table">
          <div className="table__row table__row--head">
            <span>Nombre</span>
            <span>Precio</span>
            <span>Acciones</span>
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="table__row">
              <span className="skeleton" />
              <span className="skeleton" />
              <span className="skeleton" />
            </div>
          ))}
        </div>
      ) : errorMessage ? (
        <div className="alert">{errorMessage}</div>
      ) : (
        <div className="table">
          <div className="table__row table__row--head">
            <span>Nombre</span>
            <span>Precio</span>
            <span>Acciones</span>
          </div>
          {items.map((item) => (
            <div key={item.id} className="table__row">
              <span>{item.name}</span>
              <span>${item.price.toFixed(2)}</span>
              <span className="table__actions">
                <button type="button" className="ghost" onClick={() => onEdit(item)}>
                  Editar
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => onDelete(item.id)}
                  disabled={isDeleting}
                >
                  Eliminar
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {pageInfo && (
        <div className="pager">
          <button type="button" className="ghost" onClick={onPrev} disabled={pageInfo.current <= 1}>
            Anterior
          </button>
          <span>
            Pagina {pageInfo.current} de {pageInfo.last}
          </span>
          <button
            type="button"
            className="ghost"
            onClick={onNext}
            disabled={pageInfo.current >= pageInfo.last}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(ItemList);
