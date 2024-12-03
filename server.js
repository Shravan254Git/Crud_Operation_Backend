const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const salt = 10;

const app = express(); // Back bone of our server

// Middleware functions for handling client-side CSS and JavaScript
app.use(express.static(path.join(__dirname, "public")));
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["POST", "GET", "UPDATE", "DELETE"],
    credentials: true,
  })
); // To manage controlled web security
app.use(express.json()); // For parsing JSON in HTTP requests
app.use(cookieParser());

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

// Authentication using JWT

// Api to register
app.post("/registration", (req, res) => {
  const sql =
    "INSERT INTO student.users (`username`, `password`, `email`) VALUES (?, ?, ?);";

  bcrypt.hash(req.body.password.toString(), salt, (err, hash) => {
    if (err) return res.json({ Error: "Error for hassing password" });

    const values = [req.body.username, hash, req.body.email];

    db.query(sql, values, (err, results) => {
      if (err) {
        console.error("Error inserting data:", err.message);
        return res
          .status(500)
          .json({ message: "Something unexpected has occurred" });
      }
      return res.status(201).json({ message: "User registered successfully!" });
    });
  });
});

// Api to Login
app.post("/auth", (req, res) => {
  const sql = "SELECT * FROM student.users WHERE email = ?;";
  const values = [req.body.email];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("Database query error:", err.message);
      return res.status(500).json({ Error: "Login error on server" });
    }

    if (results.length === 0) {
      return res.status(404).json({ Error: "No email found" });
    }

    const user = results[0];

    bcrypt.compare(
      req.body.password.toString(),
      user.password,
      (err, match) => {
        if (err) {
          console.error("Password comparison error:", err.message);
          return res.status(500).json({ Error: "Password comparison error" });
        }

        if (match) {
          const email = user.email;

          // Generate JWT token
          const token = jwt.sign({ email }, "jwt-secret-key", {
            expiresIn: "5m", // Token valid for 5 minutes
          });

          res.cookie('token', token);

          // Respond with user details and token
          return res.status(200).json({
            Status: "Success",
            User: {
              id: user.id,
              username: user.username,
              email: user.email,
            },
            Token: token,
          });
        } else {
          return res.status(401).json({ Error: "Incorrect password" });
        }
      }
    );
  });
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
