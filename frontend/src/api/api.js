const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export async function getItems() {
  const res = await fetch(`${BASE}/items`);
  if (!res.ok) throw new Error("Échec de la récupération des articles");
  return res.json();
}

export async function createItem(data) {
  const res = await fetch(`${BASE}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      price: data.price ? parseFloat(data.price) : null,
      size: data.size || null,
      category: data.categoryId ? { id: Number(data.categoryId) } : null,
    }),
  });
  if (!res.ok) throw new Error("Échec de la création");
  return res.json();
}

export async function updateItem(id, data) {
  const res = await fetch(`${BASE}/items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      price: data.price ? parseFloat(data.price) : null,
      size: data.size || null,
      category: data.categoryId ? { id: Number(data.categoryId) } : null,
    }),
  });
  if (!res.ok) throw new Error("Échec de la mise à jour");
  return res.json();
}

export async function deleteItem(id) {
  const res = await fetch(`${BASE}/items/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Échec de la suppression");
}

export async function getCategories() {
  const res = await fetch(`${BASE}/categories`);
  if (!res.ok) throw new Error("Échec de la récupération des catégories");
  return res.json();
}
