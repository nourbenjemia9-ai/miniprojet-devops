const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// Connexion PostgreSQL : les valeurs viennent des variables d'environnement (docker-compose)
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Test rapide : le backend est vivant
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// READ : tous les produits
app.get("/api/products", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM products ORDER BY id");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE : ajouter un produit
app.post("/api/products", async (req, res) => {
  try {
    const { name, price } = req.body;
    const { rows } = await pool.query(
      "INSERT INTO products (name, price) VALUES ($1, $2) RETURNING *",
      [name, price]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE : modifier un produit
app.put("/api/products/:id", async (req, res) => {
  try {
    const { name, price } = req.body;
    const { rows } = await pool.query(
      "UPDATE products SET name = $1, price = $2 WHERE id = $3 RETURNING *",
      [name, price, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Produit introuvable" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE : supprimer un produit
app.delete("/api/products/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM products WHERE id = $1", [req.params.id]);
    res.json({ message: "Produit supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Backend démarré sur le port " + PORT));
