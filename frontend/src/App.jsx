import { useState, useEffect } from "react";
import { getItems, createItem, updateItem, deleteItem, getCategories } from "./api/api";

const CATEGORIES = [
  { name: "Robes",    emoji: "👗", color: "#ec4899" },
  { name: "Chaussures", emoji: "👠", color: "#f59e0b" },
  { name: "Chemises", emoji: "👔", color: "#3b82f6" },
  { name: "Pantalons", emoji: "👖", color: "#8b5cf6" },
  { name: "Sacs",    emoji: "👜", color: "#10b981" },
];

function getCatMeta(catName) {
  return CATEGORIES.find(c => c.name === catName) || { emoji: "🛍️", color: "#94a3b8" };
}

export default function App() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterCat, setFilterCat] = useState("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [modal, setModal] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", size: "", categoryId: "" });
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const [its, cats] = await Promise.all([getItems(), getCategories()]);
      setItems(its);
      setCategories(cats);
    } catch (e) {
      setError("Impossible de joindre le serveur. Spring Boot est-il lancé sur le port 8080 ?");
    }
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function openAdd() {
    setEditItem(null);
    setForm({ name: "", description: "", price: "", size: "", categoryId: categories[0]?.id || "" });
    setError(null);
    setModal("item");
  }

  function openEdit(item) {
    setEditItem(item);
    setForm({
      name: item.name,
      description: item.description || "",
      price: item.price || "",
      size: item.size || "",
      categoryId: item.category?.id || "",
    });
    setError(null);
    setModal("item");
  }

  function closeModal() { setModal(null); setEditItem(null); setError(null); }

  async function handleItemSubmit(e) {
    e.preventDefault();
    try {
      if (editItem) { await updateItem(editItem.id, form); showToast("Article mis à jour !"); }
      else { await createItem(form); showToast("Article ajouté !"); }
      closeModal();
      loadAll();
    } catch (e) { setError(e.message); }
  }

  async function handleDelete(id) {
    if (!confirm("Supprimer cet article ?")) return;
    try { await deleteItem(id); showToast("Article supprimé", "error"); loadAll(); }
    catch (e) { setError(e.message); }
  }

  const filtered = items.filter(item => {
    const matchCat = filterCat === "all" || item.category?.id === Number(filterCat);
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalValue = items.reduce((sum, i) => sum + (parseFloat(i.price) || 0), 0);

  return (
    <div style={{ minHeight: "100vh", background: "#faf7f5", color: "#1a1a2e", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet"/>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: toast.type === "error" ? "#fff0f0" : "#f0fff4",
          border: `1px solid ${toast.type === "error" ? "#fca5a5" : "#6ee7b7"}`,
          color: toast.type === "error" ? "#b91c1c" : "#065f46",
          padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 500,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}>
          {toast.type === "error" ? "🗑 " : "✓ "}{toast.msg}
        </div>
      )}

      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid #f0ebe6", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 70 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 28 }}>👗</span>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 22, color: "#1a1a2e", letterSpacing: "-0.3px" }}>La Boutique</div>
            <div style={{ fontSize: 11, color: "#9ca3af", letterSpacing: "2px", textTransform: "uppercase", marginTop: -2 }}>Collection Mode</div>
          </div>
        </div>
        <button onClick={openAdd} style={primaryBtn}>+ Nouvel article</button>
      </header>

      <main style={{ padding: "32px 40px", maxWidth: 1200, margin: "0 auto" }}>

        {/* Stats */}
        <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
          {[
            { label: "Articles total", value: items.length, icon: "🛍️", color: "#ec4899" },
            { label: "Catégories", value: categories.length, icon: "📂", color: "#8b5cf6" },
            { label: "Affichés", value: filtered.length, icon: "👁️", color: "#3b82f6" },
            { label: "Valeur stock", value: `${totalValue.toFixed(2)} DT`, icon: "💰", color: "#10b981" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", border: "1px solid #f0ebe6", borderRadius: 14, padding: "18px 24px", flex: "1 1 160px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color, fontFamily: "'Playfair Display', serif" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Category filter pills */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={() => setFilterCat("all")} style={{
            ...pillBtn,
            background: filterCat === "all" ? "#1a1a2e" : "#fff",
            color: filterCat === "all" ? "#fff" : "#6b7280",
            borderColor: filterCat === "all" ? "#1a1a2e" : "#e5e7eb",
          }}>
            🛍️ Tout ({items.length})
          </button>
          {categories.map(c => {
            const meta = getCatMeta(c.name);
            const active = filterCat === String(c.id);
            const count = items.filter(i => i.category?.id === c.id).length;
            return (
              <button key={c.id} onClick={() => setFilterCat(String(c.id))} style={{
                ...pillBtn,
                background: active ? meta.color + "18" : "#fff",
                color: active ? meta.color : "#6b7280",
                borderColor: active ? meta.color : "#e5e7eb",
                fontWeight: active ? 600 : 400,
              }}>
                {meta.emoji} {c.name} ({count})
              </button>
            );
          })}

          {/* Spacer + search + view toggle */}
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
            <input
              placeholder="🔍 Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, width: 200, background: "#fff" }}
            />
            <div style={{ display: "flex", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
              {["grid", "list"].map(v => (
                <button key={v} onClick={() => setView(v)} style={{
                  padding: "8px 14px", border: "none", cursor: "pointer", fontSize: 16,
                  background: view === v ? "#f3f4f6" : "transparent",
                  color: view === v ? "#1a1a2e" : "#9ca3af",
                }}>
                  {v === "grid" ? "⊞" : "☰"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && !modal && (
          <div style={{ background: "#fff0f0", border: "1px solid #fca5a5", borderRadius: 10, padding: "14px 18px", marginBottom: 24, color: "#b91c1c", fontSize: 14 }}>
            ⚠ {error}
          </div>
        )}

        {/* Empty */}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#d1d5db" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>👗</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#9ca3af", marginBottom: 8 }}>Aucun article trouvé</div>
            <div style={{ fontSize: 14 }}>Essayez une autre recherche ou ajoutez un article</div>
          </div>
        )}

        {/* Grid */}
        {view === "grid" && filtered.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
            {filtered.map(item => {
              const meta = getCatMeta(item.category?.name);
              return (
                <div key={item.id}
                  style={{ background: "#fff", border: "1px solid #f0ebe6", borderRadius: 16, padding: 22, transition: "box-shadow 0.2s, transform 0.15s", cursor: "default", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 24px ${meta.color}22`; e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: meta.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                      {meta.emoji}
                    </div>
                    {item.price && (
                      <span style={{ fontSize: 15, fontWeight: 700, color: meta.color }}>{parseFloat(item.price).toFixed(2)} DT</span>
                    )}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, color: "#1a1a2e" }}>{item.name}</div>
                  {item.size && <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>Taille : {item.size}</div>}
                  <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6, lineHeight: 1.5 }}>{item.description || "Aucune description"}</div>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: meta.color + "18", color: meta.color, fontWeight: 600, display: "inline-block", marginBottom: 16 }}>
                    {meta.emoji} {item.category?.name || "Sans catégorie"}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => openEdit(item)} style={{ ...smallBtn, flex: 1 }}>Modifier</button>
                    <button onClick={() => handleDelete(item.id)} style={{ ...smallBtn, flex: 1, background: "#fff0f0", color: "#ef4444", borderColor: "#fecaca" }}>Supprimer</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List */}
        {view === "list" && filtered.length > 0 && (
          <div style={{ background: "#fff", border: "1px solid #f0ebe6", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f0ebe6", background: "#faf7f5" }}>
                  {["Article", "Catégorie", "Taille", "Prix", "Actions"].map(h => (
                    <th key={h} style={{ padding: "14px 18px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.8px", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => {
                  const meta = getCatMeta(item.category?.name);
                  return (
                    <tr key={item.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f9f5f2" : "none" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#faf7f5"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "14px 18px", fontWeight: 500 }}>{item.name}</td>
                      <td style={{ padding: "14px 18px" }}>
                        <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, background: meta.color + "18", color: meta.color, fontWeight: 600 }}>
                          {meta.emoji} {item.category?.name || "—"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 18px", color: "#6b7280", fontSize: 13 }}>{item.size || "—"}</td>
                      <td style={{ padding: "14px 18px", fontWeight: 600, color: meta.color }}>{item.price ? `${parseFloat(item.price).toFixed(2)} DT` : "—"}</td>
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => openEdit(item)} style={smallBtn}>Modifier</button>
                          <button onClick={() => handleDelete(item.id)} style={{ ...smallBtn, background: "#fff0f0", color: "#ef4444", borderColor: "#fecaca" }}>Supprimer</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal */}
      {modal && (
        <div onClick={closeModal} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: 36, width: "100%", maxWidth: 500, boxShadow: "0 24px 80px rgba(0,0,0,0.15)" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 22, marginBottom: 24, color: "#1a1a2e" }}>
              {editItem ? "✏️ Modifier l'article" : "✨ Nouvel article"}
            </div>
            {error && <div style={{ background: "#fff0f0", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#b91c1c", fontSize: 13 }}>{error}</div>}
            <form onSubmit={handleItemSubmit}>
              <label style={labelStyle}>Nom de l'article *</label>
              <input placeholder="ex. Robe fleurie, Chemise blanche..." value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required
                style={{ ...inputStyle, width: "100%", marginBottom: 14, boxSizing: "border-box" }}/>

              <label style={labelStyle}>Catégorie</label>
              <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}
                style={{ ...inputStyle, width: "100%", marginBottom: 14, boxSizing: "border-box" }}>
                <option value="">Sans catégorie</option>
                {categories.map(c => {
                  const meta = getCatMeta(c.name);
                  return <option key={c.id} value={c.id}>{meta.emoji} {c.name}</option>;
                })}
              </select>

              <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Prix (DT)</label>
                  <input placeholder="0.00" type="number" step="0.01" min="0" value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}/>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Taille</label>
                  <input placeholder="XS, S, M, L, XL, 38..." value={form.size}
                    onChange={e => setForm({ ...form, size: e.target.value })}
                    style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}/>
                </div>
              </div>

              <label style={labelStyle}>Description</label>
              <textarea placeholder="Décrivez l'article..." value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ ...inputStyle, width: "100%", marginBottom: 24, minHeight: 80, resize: "vertical", boxSizing: "border-box" }}/>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={closeModal} style={{ ...outlineBtn, flex: 1 }}>Annuler</button>
                <button type="submit" style={{ ...primaryBtn, flex: 1 }}>{editItem ? "Mettre à jour" : "Ajouter"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; }
        select option { background: #fff; color: #1a1a2e; }
      `}</style>
    </div>
  );
}

const inputStyle = { padding: "10px 14px", background: "#faf7f5", border: "1px solid #e5e7eb", borderRadius: 8, color: "#1a1a2e", fontSize: 14, outline: "none", fontFamily: "inherit" };
const primaryBtn = { padding: "11px 22px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 14, fontFamily: "inherit" };
const outlineBtn = { padding: "11px 22px", background: "transparent", color: "#6b7280", border: "1px solid #e5e7eb", borderRadius: 10, cursor: "pointer", fontWeight: 500, fontSize: 14, fontFamily: "inherit" };
const pillBtn = { padding: "8px 16px", border: "1px solid", borderRadius: 20, cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "inherit" };
const smallBtn = { padding: "7px 14px", background: "#f9fafb", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 500, fontFamily: "inherit" };
const labelStyle = { display: "block", fontSize: 11, fontWeight: 600, color: "#9ca3af", marginBottom: 6, letterSpacing: "0.5px", textTransform: "uppercase" };
