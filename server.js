const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express(); // Back bone of our server

// Middleware functions for handling client-side CSS and JavaScript
app.use(express.static(path.join(__dirname, "public")));
app.use(cors()); // To manage controlled web security
app.use(express.json()); // For parsing JSON in HTTP requests

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "student",
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
    process.exit(1); // Exit if connection fails
  }
  console.log("Connected to the MySQL database.");
});

// API route to add a user
app.post("/add_user", (req, res) => {
  const sql =
    "INSERT INTO student_details (`name`, `email`, `age`, `gender`) VALUES (?);";

  const values = [req.body.name, req.body.email, req.body.age, req.body.gender];

  db.query(sql, [values], (err, results) => {
    if (err) {
      console.error("Error inserting data:", err.message);
      return res
        .status(500)
        .json({ message: "Something unexpected has occurred" });
    }
    return res.status(201).json({ message: "Student added successfully" });
  });
});

// API route to fetch the students data
app.get("/students", (req, res) => {
  const sql = "SELECT * FROM student_details;";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching the data:", err.message);
      return res
        .status(500)
        .json({ message: "Something unexpected has occurred" });
    }
    return res.status(200).json(results); // Send only the results
  });
});

// API route to fetch the student data by ID
app.get("/get_student/:id", (req, res) => {
  const id = req.params.id;

  const sql = "SELECT * FROM student_details WHERE `id` = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching the data:", err.message);
      return res
        .status(500)
        .json({ message: "Something unexpected has occurred" });
    }
    return res.status(200).json(results); // Send only the results
  });
});

// API to Update the student data by ID
app.put("/edit_user/:id", (req, res) => {
  const id = req.params.id;

  const values = [
    req.body.name,
    req.body.email,
    req.body.age,
    req.body.gender,
    id,
  ];

  const sql =
    "UPDATE student_details SET `name`=?, `email`=?, `age`=?, `gender`=? WHERE `id` = ?";

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("Error fetching the data:", err.message);
      return res
        .status(500)
        .json({ message: "Something unexpected has occurred" });
    }
    return res.status(200).json(results); // Send only the results
  });
});

// API to Delete the student data by ID
app.delete("/delete/:id", (req, res) => {
  const id = req.params.id;

  const values = [id];

  const sql = "DELETE FROM student_details WHERE `id` = ?";

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("Error fetching the data:", err.message);
      return res
        .status(500)
        .json({ message: "Something unexpected has occurred" });
    }
    return res.status(200).json(results); // Send only the results
  });
});

// Start the server
const port = 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
