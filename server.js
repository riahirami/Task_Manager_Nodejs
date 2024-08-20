const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 9000;
const SECRET_KEY = 'just_for_pm';
// Middleware
app.use(bodyParser.json());
app.use(cors());

// Database Setup
const db = new sqlite3.Database(':memory:');

// Create Tables
db.serialize(() => {
    db.run(`CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT
    )`);

    db.run(`CREATE TABLE tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'incomplete',
        FOREIGN KEY (project_id) REFERENCES projects(id)
    )`);
});

// Helper Functions
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Auth Endpoints

// Register a new user
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

// Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ username: user.username, id: user.id }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    });
});

// API Endpoints (Protected)

app.post('/projects', authenticateToken, (req, res) => {
    const { name, description } = req.body;
    db.run(`INSERT INTO projects (name, description) VALUES (?, ?)`, [name, description], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

app.get('/projects', authenticateToken, (req, res) => {
    db.all(`SELECT * FROM projects`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.put('/projects/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    db.run(`UPDATE projects SET name = ?, description = ? WHERE id = ?`,
        [name, description, id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ updated: this.changes });
        });
});

app.post('/tasks', authenticateToken, (req, res) => {
    const { project_id, title, description } = req.body;
    db.run(`INSERT INTO tasks (project_id, title, description) VALUES (?, ?, ?)`,
        [project_id, title, description], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ id: this.lastID });
        });
});

app.get('/projects/:id/tasks', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.all(`SELECT * FROM tasks WHERE project_id = ?`, [id], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.put('/tasks/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    db.run(`UPDATE tasks SET title = ?, description = ? WHERE id = ?`,
        [title, description, id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ updated: this.changes });
        });
});

app.delete('/tasks/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM tasks WHERE id = ?`, id, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ deleted: this.changes });
    });
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running Gooduck & Happy coding !`);
});
