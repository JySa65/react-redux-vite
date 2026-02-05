import { lazy, Suspense } from "react";
import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import "./App.css";
import useInjectReducer from "./hooks/useInjectReducer";
import themeReducer from "./store/themeSlice";

const ItemsPage = lazy(() => import("./pages/ItemsPage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));

const App = () => {
  useInjectReducer("theme", themeReducer);
  return (
    <div>
      <nav className="nav">
        <div className="nav__brand">Inventario</div>
        <div className="nav__links">
          <NavLink className="nav__link" to="/items">
            Items
          </NavLink>
          <NavLink className="nav__link" to="/products">
            Productos
          </NavLink>
        </div>
      </nav>
      <Suspense
        fallback={<div className="app"><p>Cargando pagina...</p></div>}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/items" replace />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/products" element={<ProductsPage />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;
