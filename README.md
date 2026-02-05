# React + Vite + RTK Query (TypeScript)

Proyecto de React con Vite, TypeScript, Redux Toolkit (RTK Query), json-server y Formik/Yup. Incluye CRUD para Items y Products con rutas, cache optimizada y reducers lazy.

## Stack

- React + Vite + TypeScript
- Redux Toolkit + RTK Query
- Axios (baseQuery custom)
- json-server (API mock persistente)
- Formik + Yup (formularios)
- React Router (rutas)

## Scripts

- `npm run dev`: inicia Vite
- `npm run api`: inicia json-server (API local en `http://localhost:3001`)

## Rutas

- `/items`: CRUD de items
- `/products`: CRUD de products

## API mock (json-server)

Servidor local: `http://localhost:3001`

### Items

- `GET /items?status=ok&page=1&perPage=5`
- `POST /items`
- `PUT /items/:id`
- `PATCH /items/:id`
- `DELETE /items/:id`

### Products

- `GET /products?status=ok&page=1&perPage=5`
- `POST /products`
- `PUT /products/:id`
- `PATCH /products/:id`
- `DELETE /products/:id`

### Respuesta (exito)

```json
{
  "data": [],
  "meta": {
    "success": true,
    "errors": "",
    "pagination": {
      "total": 10,
      "perPage": 5,
      "lastPage": 2,
      "currentPage": 1
    }
  }
}
```

### Respuesta (error)

```json
{
  "meta": {
    "success": false,
    "errors": "Invalid status param"
  }
}
```

## RTK Query

Se usa `baseApi` + `injectEndpoints` para lazy code-splitting.

- `src/api/baseApi.ts`
- `src/api/itemApiSlice.ts`
- `src/api/productApiSlice.ts`

La base query usa Axios y normaliza `errors` en `src/api/baseQuery.ts`.

## Lazy reducers

Store con `reducerManager` y reducers inyectados por pagina:

- `src/store/reducerManager.ts`
- `src/hooks/useInjectReducer.ts`

Slices ejemplo:

- `src/store/itemUiSlice.ts`
- `src/store/productUiSlice.ts`
- `src/store/themeSlice.ts`

## Por que y que logramos

Hicimos esto para que el proyecto escale sin cargar todo desde el inicio y para mantener el codigo por dominio.
En un enfoque tradicional (store con todos los reducers y endpoints cargados siempre), el bundle inicial crece,
el tiempo de arranque aumenta y cualquier cambio en un slice impacta mas areas, lo que vuelve la app fragil.
A futuro, con decenas de features, esto suele explotar en tiempos de carga altos, refetches innecesarios
y una base de codigo dificil de mantener.

Logramos:

- Code splitting de endpoints y paginas (se cargan cuando se necesitan)
- Reducers lazy por feature para evitar un store gigante
- Cache de RTK Query controlada por feature
- CRUDs desacoplados entre items y products

Nota: Estas practicas (code splitting de endpoints y reducers lazy) son ideales para proyectos grandes.

## UI

- Formik + Yup con `FastField` (menos renders)
- Diseño base en `src/App.css` y `src/index.css`

## Como correr

```bash
npm run api
npm run dev
```

Abrir en el navegador:

- `http://localhost:5173/items`
- `http://localhost:5173/products`

## Demo

Video:

- [demo.mp4](demo.mp4)
