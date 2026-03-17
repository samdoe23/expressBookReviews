import { describe, it, expect } from "vitest";
import request from "supertest";
import { app as indexApp } from "./index.js";
import { beforeEach } from "vitest";
import { parseSetCookie } from "set-cookie-parser";
import books from "./router/booksdb.js";

let app = request(indexApp);
let agent = request.agent(indexApp);
let username = crypto.randomUUID();
let password = crypto.randomUUID();

describe("login / register", () => {
  beforeEach(() => {
    username = crypto.randomUUID();
    password = crypto.randomUUID();
  });

  describe("POST /register", () => {
    it("handles missing username payload", async () => {
      const res = await app.post("/register").send({ password });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: "Missing username" });
    });

    it("handles missing password payload", async () => {
      const res = await app.post("/register").send({ username });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: "Missing password" });
    });

    it("handles non unique username", async () => {
      var res = await app.post("/register").send({ username, password });
      var res = await app.post("/register").send({ username, password });
      expect(res.status).toBe(409);
      expect(res.body).toEqual({ message: "Username already registered" });
    });

    it("handles valid payload", async () => {
      const res = await app.post("/register").send({ username, password });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "User registered" });
    });
  });

  describe("POST /customer/login", () => {
    it("handles missing username payload", async () => {
      const res = await app.post("/customer/login").send({ password });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: "Missing username" });
    });

    it("handles missing password payload", async () => {
      const res = await app.post("/customer/login").send({ username });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: "Missing password" });
    });

    it("handles invalid username", async () => {
      await app.post("/register").send({ username, password });
      username = crypto.randomUUID();
      const res = await app
        .post("/customer/login")
        .send({ username, password });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: "Invalid credentials" });
    });

    it("handles invalid password", async () => {
      await app.post("/register").send({ username, password });
      password = crypto.randomUUID();
      const res = await app
        .post("/customer/login")
        .send({ username, password });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: "Invalid credentials" });
    });

    it("handles valid payload", async () => {
      await app.post("/register").send({ username, password });
      const res = await app
        .post("/customer/login")
        .send({ username, password });
      const sessCookie = parseSetCookie(res).find(
        (cookie) => cookie.name === "connect.sid",
      );
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "Successfully logged in" });
      expect(sessCookie).toBeDefined();
    });
  });
});

describe("GET /isbn/:isbn", () => {
  it("handles not found", async () => {
    const res = await app.get("/isbn/32190").expect(404);
    expect(res.body).toEqual({ message: "Book not found" });
  });

  it("handles found", async () => {
    const res = await app.get("/isbn/1").expect(200);
    expect(res.body).toEqual(books[1]);
  });
});

describe("GET /author/:author", () => {
  it("handles not found", async () => {
    const res = await app.get("/author/Sam Doe").expect(404);
    expect(res.body).toEqual({ message: "Book not found" });
  });

  it("handles found", async () => {
    const res = await app.get("/author/Chinua Achebe").expect(200);
    expect(res.body).toEqual(books[1]);
  });
});
