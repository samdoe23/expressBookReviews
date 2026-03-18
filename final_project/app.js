import express, { json } from "express";
import jwt from "jsonwebtoken";
import session from "express-session";
import { authenticated as customer_routes } from "./router/auth_users.js";
import { general as genl_routes } from "./router/general.js";

const app = express();

app.use(json());

app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  }),
);

app.use("/customer/auth/*", function auth(req, res, next) {
  const token = req.session?.token;

  if (!token) {
    res.status(401).json({ message: "Unauthorized user" });
    return;
  }

  try {
    const token = jwt.verify(req.session.token, process.env["JWT_SECRET"], {});
    req.token = token;
    next();
  } catch (e) {
    res.status(403).json({ message: "Invalid credentials" });
  }
});

app.use("/customer", customer_routes);
app.use("/", genl_routes);

export default app;
