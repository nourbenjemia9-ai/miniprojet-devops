import { useEffect, useState } from "react";

const API = "/api/products";

export default function App() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [editId, setEditId] = useState(null);

  // READ
  const load = async () => {
    const res = await fetch(API);
    setProducts(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  // CREATE ou UPDATE selon editId
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || price === "") return;
    const body = JSON.stringify({ name, price: Number(price) });
    const headers = { "Content-Type": "application/json" };

    if (editId) {
      await fetch(`${API}/${editId}`, { method: "PUT", headers, body });
    } else {
      await fetch(API, { method: "POST", headers, body });
    }
    setName("");
    setPrice("");
    setEditId(null);
    load();
  };

  const startEdit = (p) => {
    setEditId(p.id);
    setName(p.name);
    setPrice(p.price);
  };

  // DELETE
  const remove = async (id) => {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="container">
      <h1>Gestion de produits</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Nom du produit"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Prix"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <button type="submit">{editId ? "Modifier" : "Ajouter"}</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Prix</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.price}</td>
              <td>
                <button onClick={() => startEdit(p)}>Éditer</button>
                <button onClick={() => remove(p.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
