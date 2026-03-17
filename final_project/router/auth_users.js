const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
let books = require("./booksdb.js");
const regd_users = express.Router();

/** @type {{username:string,password:string}[]} */
let users = [];

const isValid = (username) => {
  return !users.find((u) => u.username === username);
};

const authenticatedUser = (username, password) => {
  const user = users.find((u) => u.username === username);
  if (!user) return false;
  return user.password === crypto.hash("sha256", password);
};

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).json({ message: "Missing username" });
  }
  if (!password) {
    return res.status(400).json({ message: "Missing password" });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  req.session.token = jwt.sign({ sub: username }, process.env["JWT_SECRET"]);
  return res.status(200).json({ message: "Successfully logged in" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  return res.status(300).json({ message: "Yet to be implemented" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
