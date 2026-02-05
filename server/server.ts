import jsonServer from "json-server";

const server = jsonServer.create();
const router = jsonServer.router("./server/db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

const respondSuccess = (res: any, data: unknown, meta?: Record<string, any>) =>
  res.json({
    data,
    meta: {
      success: true,
      errors: "",
      ...meta,
    },
  });

const respondError = (res: any, message: string, status = 422) =>
  res.status(status).json({
    meta: {
      success: false,
      errors: message,
    },
  });

const sortByCreatedAtDesc = (items: any[]) =>
  items.slice().sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (aTime !== bTime) return bTime - aTime;
    return (b.id || 0) - (a.id || 0);
  });

const buildListHandler = (collection: string) => (req: any, res: any) => {
  const { status = "ok", page = "1", perPage = "5" } = req.query;

  if (status !== "ok") {
    return respondError(res, "Invalid status param");
  }

  const currentPage = Number(page);
  const limit = Number(perPage);
  const allItems = router.db.get(collection).value();
  const orderedItems = sortByCreatedAtDesc(allItems);
  const total = orderedItems.length;
  const lastPage = Math.max(1, Math.ceil(total / limit));
  const offset = (currentPage - 1) * limit;
  const data = orderedItems.slice(offset, offset + limit);

  return respondSuccess(res, data, {
    pagination: {
      total,
      perPage: limit,
      lastPage,
      currentPage,
    },
  });
};

const buildCreateHandler = (collection: string) => (req: any, res: any) => {
  const { name, price } = req.body || {};

  if (!name || typeof name !== "string") {
    return respondError(res, "Name is required");
  }

  if (typeof price !== "number") {
    return respondError(res, "Price must be a number");
  }

  const items = router.db.get(collection).value();
  const maxId = items.reduce((max: number, item: any) => {
    const value = typeof item.id === "number" ? item.id : max;
    return Math.max(max, value);
  }, 0);
  const newItem = {
    id: maxId + 1,
    name,
    price,
    createdAt: new Date().toISOString(),
  };

  router.db.get(collection).push(newItem).write();
  return respondSuccess(res, newItem);
};

const buildUpdateHandler = (collection: string) => (req: any, res: any) => {
  const id = Number(req.params.id);
  const { name, price } = req.body || {};

  if (!Number.isFinite(id)) {
    return respondError(res, "Invalid id");
  }

  if (!name || typeof name !== "string") {
    return respondError(res, "Name is required");
  }

  if (typeof price !== "number") {
    return respondError(res, "Price must be a number");
  }

  const item = router.db.get(collection).find({ id }).value();
  if (!item) {
    return respondError(res, "Item not found", 404);
  }

  const updated = { ...item, name, price };
  router.db.get(collection).find({ id }).assign(updated).write();
  return respondSuccess(res, updated);
};

const buildPatchHandler = (collection: string) => (req: any, res: any) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return respondError(res, "Invalid id");
  }

  const item = router.db.get(collection).find({ id }).value();
  if (!item) {
    return respondError(res, "Item not found", 404);
  }

  const next = { ...item, ...req.body };
  router.db.get(collection).find({ id }).assign(next).write();
  return respondSuccess(res, next);
};

const buildDeleteHandler = (collection: string) => (req: any, res: any) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return respondError(res, "Invalid id");
  }

  const item = router.db.get(collection).find({ id }).value();
  if (!item) {
    return respondError(res, "Item not found", 404);
  }

  router.db.get(collection).remove({ id }).write();
  return respondSuccess(res, item);
};

server.get("/items", buildListHandler("items"));
server.post("/items", buildCreateHandler("items"));
server.put("/items/:id", buildUpdateHandler("items"));
server.patch("/items/:id", buildPatchHandler("items"));
server.delete("/items/:id", buildDeleteHandler("items"));

server.get("/products", buildListHandler("products"));
server.post("/products", buildCreateHandler("products"));
server.put("/products/:id", buildUpdateHandler("products"));
server.patch("/products/:id", buildPatchHandler("products"));
server.delete("/products/:id", buildDeleteHandler("products"));

server.use(router);

const port = 3001;
server.listen(port, () => {
  console.log(`JSON Server running at http://localhost:${port}`);
});
