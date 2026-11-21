const express = require("express"); 
const sqlite3 = require("sqlite3").verbose(); 
const app = express(); 
const port = 3000; 

// Middleware 
app.use(express.json());

// Connect to database 
const db = new sqlite3.Database('./database/university.db');

// Start the server
if (require.main === module) {
  app.listen(port, () => {
    console.log(`University Course Catalog API server running at http://localhost:${port}`);
  });
}

// "Home" endpoint for the API. Display all possible endpoints and their functionality
app.get('/api', (req, res) => {
    res.json({ 
        message: "Welcome to the University Course Catalog API!", 
        endpoints: { 
            "GET /api/courses": 'List all courses',
            'GET /api/courses/:id': 'List a specific course by ID',
            'POST /api/courses': 'Post a new course to the database',
            'PUT /api/courses/:id': 'Update an existing course',
            'DELETE /api/courses/:id': 'Delete a course from the database'
        } 
    }); 
});

// GET all courses
app.get('/api/courses', (req, res) => { 
    db.all('SELECT * FROM courses', (err, rows) => { 
        if (err != null) {
            res.status(500).json({message: "Something went wrong when processing your request:", err: err.message});
        } else {
            res.json(rows);     
        }
    }); 
});

// GET single course by ID
app.get('/api/courses/:id', (req, res) => { 
    const id = req.params.id; 
    db.get('SELECT * FROM courses WHERE id = ?', [id], (err, row) => {
        if (err != null) {
            res.status(500).json({message: "Something went wrong when processing your request:", err: err.message});
        } else if (!row) {
            res.status(404).json({message: "Course could not be found under the specified ID."})
        } else {
            res.json(row); 
        }
    }); 
});

// POST new course
app.post('/api/courses', (req, res) => { 
    const { courseCode, title, credits, description, semester } = req.body; 
    db.run(` 
        INSERT INTO courses (courseCode, title, credits, description, semester) 
        VALUES (?, ?, ?, ?, ?) 
        `, [ courseCode, title, credits, description, semester ], 
        function(err) { 
            if (err != null) {
                res.status(500).json({message: "Something went wrong when processing your request:", err: err.message});
            } else {
                res.status(201).json({ 
                message: "Course posted successfully and is assigned the following ID:",
                id: this.lastID 
                });
            }
             
        }
    ); 
});

// PUT update on existing course
app.put('/api/courses/:id', (req, res) => { 
    const id = req.params.id; 
    const { courseCode, title, credits, description, semester } = req.body; 
    db.run(` UPDATE courses SET courseCode = ?, title = ?, credits = ?, description = ?, semester = ? WHERE id = ? 
        `, [ courseCode, title, credits, description, semester ], 
        function(err) { 
            if (err != null) {
                res.status(500).json({message: "Something went wrong when processing your request:", err: err.message});
            } else {
                res.json({ message: 'Course updated successfully.'}); 
            }
        }
    ); 
});

// DELETE course
app.delete('/api/courses/:id', (req, res) => { 
    const id = req.params.id; 
    db.run('DELETE FROM courses WHERE id = ?', [id], 
        function(err) { 
            if (err != null) {
                res.status(500).json({message: "Something went wrong when processing your request:", err: err.message});
            } else {
                res.json({ message: 'Course deleted successfully.' }); 
            }
        }
    ); 
});

// Export app for automated testing suites
module.exports = app;