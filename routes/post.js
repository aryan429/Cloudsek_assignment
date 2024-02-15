import { Router } from "express";
import multer from "multer";
import path from "path";

import Post from "../models/post.js";
import Comment from "../models/comment.js";

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads/`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

router.get("/add-new", (req, res) => {
  return res.render("addPost", {
    user: req.user,
  });
});

router.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ postId: req.params.id }).populate(
    "createdBy"
  );

  return res.render("post", {
    user: req.user,
    post,
    comments,
  });
});

router.post("/comment/:postId", async (req, res) => {
  await Comment.create({
    content: req.body.content,
    postId: req.params.postId,
    createdBy: req.user._id,
  });
  return res.redirect(`/post/${req.params.postId}`);
});

router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;
  const post = await Post.create({
    body,
    title,
    createdBy: req.user._id,
    coverImageURL: `/uploads/${req.file.filename}`,
  });
  return res.redirect(`/post/${post._id}`);
});
router.post("/delete/:id", async (req, res) => {
  const postId = req.params.id;
  await Post.findByIdAndDelete(postId);
  await Comment.deleteMany({ postId });
  return res.redirect("/"); 
});
export default router;
