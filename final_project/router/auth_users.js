import { Router } from "express";
import jwt from "jsonwebtoken";
import { hash } from "crypto";
import books from "./booksdb.js";
const regd_users = Router();

/** @type {{username:string,password:string}[]} */
let users = [];

const isValid = (username) => {
  return !users.find((u) => u.username === username);
};

const authenticatedUser = (username, password) => {
  const user = users.find((u) => u.username === username);
  if (!user) return false;
  return user.password === hash("sha256", password);
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
  const review = req.body.review;
  if (!review) {
    return res.status(400).json({ message: "Empty review" });
  }
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  book.reviews[req.token.sub] = review;
  return res.status(200).json({ message: "Review saved" });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  book.reviews[req.token.sub] = undefined;
  return res.status(200).json({ message: "Review deleted" });
});

export const authenticated = regd_users;
const _isValid = isValid;
export { _isValid as isValid };
const _users = users;
export { _users as users };
