import { Router } from "express";
import { hash } from "crypto";
import books from "./booksdb.js";
import { isValid } from "./auth_users.js";
import { users } from "./auth_users.js";
const public_users = Router();

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
  users.push({ username, password: hash("sha256", password) });
  return res
    .status(200)
    .json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get("/", function (_req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(book);
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const matches = Object.values(books).filter(
    (book) => book.author === req.params.author,
  );
  if (!matches.length)
    return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(matches);
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const matches = Object.values(books).filter(
    (book) => book.title === req.params.title,
  );
  if (!matches.length)
    return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(matches);
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(book.reviews);
});

export const general = public_users;
