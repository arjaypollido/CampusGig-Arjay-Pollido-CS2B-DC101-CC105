import express from "express";
import cors from "cors";
import mysql from "mysql2";

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "campus_gig"
});

db.connect(err => {
  if (err) {
    console.error("DB connection failed:", err);
    process.exit(1);
  }
  console.log("Connected to MySQL database ✅");
});

// -------------------- USERS ROUTES --------------------

app.get("/users", (req, res) => {
  db.query("SELECT * FROM users ORDER BY userId DESC", (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
});

app.post("/users", (req, res) => {
  const { name, email, role, number } = req.body;
  if (!name || !email || !role || !number) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const query = "INSERT INTO users (name, email, role, number) VALUES (?, ?, ?, ?)";
  db.query(query, [name, email, role, number], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to add user", error: err.message });
    res.json({ message: "User added successfully!", userId: result.insertId });
  });
});

// -------------------- PROJECTS ROUTES --------------------

app.get("/projects", (req, res) => {
  const query = `
    SELECT 
      p.*, 
      u.name AS ownerName, u.email AS ownerEmail, u.number AS ownerNumber,
      f.name AS freelancerName, f.email AS freelancerEmail, f.number AS freelancerNumber
    FROM projects p
    JOIN users u ON p.userId = u.userId
    LEFT JOIN users f ON p.freelancerId = f.userId
    ORDER BY p.projectId DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
});

app.post("/projects", (req, res) => {
  const { userId, title, description, budget, deadline } = req.body;
  if (!userId || !title || !description || !budget || !deadline) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const query = `
    INSERT INTO projects (userId, title, description, budget, deadline, status)
    VALUES (?, ?, ?, ?, ?, 'available')
  `;
  db.query(query, [userId, title, description, budget, deadline], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to post project", error: err.message });
    res.json({ message: "Project posted successfully!", projectId: result.insertId });
  });
});

app.patch("/projects/:projectId/status", (req, res) => {
  const { projectId } = req.params;
  const { status } = req.body;

  if (!["available", "in_progress", "completed"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const query = "UPDATE projects SET status = ? WHERE projectId = ?";
  db.query(query, [status, projectId], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Project not found" });
    res.json({ message: `Project status updated to "${status}"` });
  });
});

app.delete("/projects/:projectId", (req, res) => {
  const { projectId } = req.params;
  const query = "DELETE FROM projects WHERE projectId = ?";
  db.query(query, [projectId], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Project deleted successfully" });
  });
});

// -------------------- ORDERS ROUTES --------------------

app.post("/orders", (req, res) => {
  const { projectId, freelancerId, agreedAmount } = req.body;
  if (!projectId || !freelancerId || !agreedAmount) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const checkProject = "SELECT * FROM projects WHERE projectId = ?";
  db.query(checkProject, [projectId], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Project not found" });

    const project = results[0];
    if (project.status !== "available") {
      return res.status(400).json({ message: "Project is not available for acceptance" });
    }

    const insertOrder = "INSERT INTO orders (projectId, freelancerId, agreedAmount) VALUES (?, ?, ?)";
    db.query(insertOrder, [projectId, freelancerId, agreedAmount], (err) => {
      if (err) return res.status(500).json({ message: "Failed to accept project", error: err.message });

      const updateProject = "UPDATE projects SET status = 'in_progress', freelancerId = ? WHERE projectId = ?";
      db.query(updateProject, [freelancerId, projectId], (err2) => {
        if (err2) return res.status(500).json({ message: "Order saved but project not updated", error: err2.message });

        res.json({ message: "Project accepted!", projectId, freelancerId, agreedAmount });
      });
    });
  });
});

// -------------------- START SERVER --------------------
const PORT = 3000;
app.listen(PORT, () => console.log(`CampusGig API running on port ${PORT} 🚀`));
