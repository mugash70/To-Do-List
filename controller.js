const db = require("./config");
const { v4: uuidv4 } = require('uuid');


// Get all  To-do lists
exports.getTodoLists = async (req, res) => {
    //pass the parameters depenign on the frontend configs
    const { page = 1, limit = 10, search = "",completed } = req.query;
    const offset = (page - 1) * limit;
    // base query
    let query = `SELECT * FROM todos`;
    const params = [];
    let whereClause = '';

    //add on to base query
    //let's assume the front end has a search  to search  for the description and title
    if (search) {whereClause = ` WHERE title ILIKE $1 OR description ILIKE $1`; params.push(`%${search}%`);}

    if (completed) {
      const completedValue = completed === "true";
      if (whereClause) {whereClause += ` AND completed = $${params.length + 1}`;
      }else { whereClause = ` WHERE completed = $1`;}
      params.push(completedValue);
    }

    query += whereClause;
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

    //paginate the response
    params.push(limit, offset);
    db.all(query, params, (err, rows) => {
      if (err) { return res.status(500).json({ error: "Failed to fetch To-dos" });}
      const countQuery = `SELECT COUNT(*) AS total FROM todos` + whereClause;
      db.get(countQuery, params.slice(0, -2), (countErr, countRow) => {
        if (countErr) {return res.status(500).json({ error: "Failed to fetch metadata" });}
        res.status(200).json({
          data: rows,
          metadata: {
            total: countRow.total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(countRow.total / limit),
          },
        });
      });
    });
};

// Create a new  To-do list
exports.createTodoList = async (req, res) => {
  const { title, description } = req.body;
  const id = uuidv4();
    const query = `INSERT INTO todos (id,title, description, completed) VALUES (?, ?, ?,?)`;
    db.run(query, [id,title, description,false], function (err) {
      if (err) {console.log(err);return res.status(500).json({ error: "Failed to create To-do " });}
      res.status(201).json({ id, title, description, completed: false });
    });
};


// Get a specific a To-do list
exports.getTodoListById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `SELECT * FROM todos WHERE id = ?`;
    db.get(query, [id], (err, row) => {
      if (err) {return res.status(500).json({ error: "Failed to fetch To-do" });}
      if (!row) {return res.status(404).json({ error: "To-do not found" });}
      res.status(200).json({ data: row });
  });
  } catch (err) { res.status(500).json({ error: "Failed to fetch To-do" });}
};

// Update a To-do list
exports.updateTodoList = async (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;
  try {
    const updates = [];
    const params = [];
    if (title) {updates.push(`title = $${params.length + 1}`); params.push(title); }
    if (description) { updates.push(`description = $${params.length + 1}`);  params.push(description);}
    if (completed) { updates.push(`completed = $${params.length + 1}`);params.push(completed);}
    // If no fields are provided to update, return an error
    if (updates.length === 0) { return res.status(400).json({ error: "No fields provided to update" });}
    params.push(id);
    // Construct the full query
    const query = `UPDATE todos SET ${updates.join(", ")} WHERE id = ?`;
    db.run(query, params, function (err) {
      if (err) {return res.status(500).json({ error: "Failed to update To-do" });}
      if (this.changes === 0) {return res.status(404).json({ error: "To-do not found" });}
      res.status(200).json({ message: "To-do updated successfully" });
    });
  } catch (err) {res.status(500).json({ error: "Failed to update To-do" });}
};


// Delete a To-do list
exports.deleteTodoList = async (req, res) => {
  const { id } = req.params;
  try {
  const query = `DELETE FROM todos WHERE id = ?`
  db.run(query, [id], function (err) {
    if (err) {return res.status(500).json({ error: "Failed to delete To-do" });}
    if (this.changes === 0) {return res.status(404).json({ error: "To-do not found" });}
    res.status(200).json({ message: "To-do deleted successfully" });
  });
  } catch (err) {res.status(500).json({ error: "Failed to delete To-do" });}
};


// create table
exports.CreateTable = async (req, res) => {
  const createTableSQL = `CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      completed BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`;
      db.serialize(() => {
        db.run(createTableSQL, (err) => {
          if (err) {
            console.error('Error creating table:', err);
            return res.status(500).json({ error: "Error creating table" });
          }
        });
      });
};
