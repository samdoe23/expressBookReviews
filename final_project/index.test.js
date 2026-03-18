import { describe, it, expect } from "vitest";
import request from "supertest";
import indexApp from "./app.js";
import { beforeEach } from "vitest";
import { parseSetCookie } from "set-cookie-parser";
import books from "./router/booksdb.js";
import { beforeAll } from "vitest";

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
      expect(res.body).toEqual({
        message: "User successfully registered. Now you can login",
      });
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
  it("handles non-existent book", async () => {
    const res = await app.get("/isbn/32190").expect(404);
    expect(res.body).toEqual({ message: "Book not found" });
  });

  it("handles found", async () => {
    const res = await app.get("/isbn/1").expect(200);
    expect(res.body).toEqual(books[1]);
  });
});

describe("GET /author/:author", () => {
  it("handles non-existent book", async () => {
    const res = await app.get("/author/Sam Doe").expect(404);
    expect(res.body).toEqual({ message: "Book not found" });
  });

  it("handles found", async () => {
    const res = await app.get("/author/Chinua Achebe").expect(200);
    expect(res.body.length === 1);
    expect(res.body[0]).toEqual(books[1]);
  });
});

describe("GET /title/:title", () => {
  it("handles non-existent book", async () => {
    const res = await app.get("/title/Some title").expect(404);
    expect(res.body).toEqual({ message: "Book not found" });
  });

  it("handles found", async () => {
    const res = await app.get("/title/Things Fall Apart").expect(200);
    expect(res.body.length === 1);
    expect(res.body[0]).toEqual(books[1]);
  });
});

describe("GET /", () => {
  it("shows all books", async () => {
    const res = await app.get("/").expect(200);
    expect(res.body).toEqual(books);
  });
});

describe("PUT /auth/review", () => {
  const review =
    "The alarm clock that is louder than God's own belongs to the roommate with the earliest class.";

  it("blocks unauthenticated requests", async () => {
    await app
      .put("/customer/auth/review/1")
      .send({ review })
      .expect(401)
      .expect({ message: "Unauthorized user" });
  });

  describe("authenticated", () => {
    beforeAll(async () => {
      await agent.post("/customer/login").send({ username, password });
    });

    it("handles empty review", async () => {
      await agent
        .put("/customer/auth/review/1")
        .send()
        .expect(400)
        .expect({ message: "Empty review" });
    });

    it("handles non-existent book", async () => {
      await agent
        .put("/customer/auth/review/2312132")
        .send({ review })
        .expect(404)
        .expect({ message: "Book not found" });
    });

    it("saves a review", async () => {
      await agent
        .put("/customer/auth/review/1")
        .send({ review })
        .expect(200)
        .expect({ message: "Review saved" });
      const res = await app.get("/isbn/1");
      expect(res.body.reviews).toEqual({ [username]: review });
    });
  });
});

describe("GET /review/:isbn", () => {
  it("handles non-existent book", async () => {
    const res = await app.get("/isbn/32190").expect(404);
    expect(res.body).toEqual({ message: "Book not found" });
  });

  it("shows book reviews", async () => {
    const res = await app.get("/review/1").expect(200);
    expect(res.body).toEqual(books[1].reviews);
  });
});

describe("DELETE /review/:isbn", () => {
  it("blocks unauthenticated requests", async () => {
    await app
      .delete("/customer/auth/review/1")
      .send()
      .expect(401)
      .expect({ message: "Unauthorized user" });
  });

  describe("authenticated", () => {
    beforeAll(async () => {
      await agent.post("/customer/login").send({ username, password });
    });

    it("handles non-existent book", async () => {
      await agent
        .delete("/customer/auth/review/2312132")
        .send()
        .expect(404)
        .expect({ message: "Book not found" });
    });

    it("deletes a review", async () => {
      await agent
        .delete("/customer/auth/review/1")
        .send()
        .expect(200)
        .expect({ message: "Review deleted" });
      await app.get("/review/1").expect(200).expect({});
    });
  });
});
