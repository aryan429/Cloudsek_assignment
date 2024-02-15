import dotenv from "dotenv";
dotenv.config();

import path from "path";
import express from "express";
import mongoose from "mongoose";
import cookiePaser from "cookie-parser";
import Post from "./models/post.js";

import userRoute from "./routes/user.js";
import postRoute from "./routes/post.js";

import {
  checkForAuthenticationCookie,
} from "./middlewares/authentication.js";

const app = express();
const PORT = process.env.PORT || 8000;

mongoose
  .connect(process.env.MONGODB_URL)
  .then((e) => console.log("MongoDB Connected"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookiePaser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

app.get("/", async (req, res) => {
  const allPosts = await Post.find({});
  res.render("home", {
    user: req.user,
    posts: allPosts,
  });
});

app.use("/user", userRoute);
app.use("/post", postRoute);

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
