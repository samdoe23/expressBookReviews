const express = require("express");
const crypto = require("crypto");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).json({ message: "Missing username" });
  }
  if (!password) {
    return res.status(400).json({ message: "Missing password" });
  }
  if (!isValid(username)) {
    return res.status(409).json({ message: "Username already registered" });
  }
  users.push({ username, password: crypto.hash("sha256", password) });
  return res.status(200).json({ message: "User registered" });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  //Write your code here
  return res.status(300).json({ message: "Yet to be implemented" });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(book);
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const book = Object.entries(books).find(
    ([_, book]) => book.author === req.params.author,
  )?.[1];
  if (!book) return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(book);
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const book = Object.entries(books).find(
    ([_, book]) => book.title === req.params.title,
  )?.[1];
  if (!book) return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(book);
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  //Write your code here
  return res.status(300).json({ message: "Yet to be implemented" });
});

module.exports.general = public_users;
