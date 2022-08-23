const { Router } = require("express");
const blogRouter = Router();
const { Blog, User, Comment } = require("../models");
const { isValidObjectId } = require("mongoose");
const { commentRouter } = require("./commentRoute");

blogRouter.use("/:blogId/comment", commentRouter);

blogRouter.get("/", async (req, res) => {
  try {
    let { page } = req.query;
    page = parseInt(page);
    console.log({ page });
    const blogs = await Blog.find({})
      .sort({ updatedAt: -1 })
      .skip(page * 3)
      .limit(3);
    // .select("title content")
    // .populate([
    //   { path: "user" },
    //   { path: "comments", populate: { path: "user" } },
    // ]);
    return res.send({ blogs });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});

blogRouter.get("/:blogId", async (req, res) => {
  try {
    const { blogId } = req.params;
    if (!isValidObjectId(blogId))
      return res.status(400).send({ err: "blogId is invalid" });

    const blog = await Blog.findOne({ _id: blogId });
    // const commentCount = await Comment.find({ blog: blogId }).countDocuments();

    return res.send({ blog, commentCount });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});

blogRouter.post("/", async (req, res) => {
  try {
    const { title, content, islive, userId } = req.body;
    console.log("body", req.body);
    if (typeof title !== "string")
      return res.status(400).send({ err: "title is required" });
    if (typeof content !== "string")
      return res.status(400).send({ err: "content is required" });
    if (islive && typeof islive !== "boolean") {
      return res.status(400).send({ err: "islive must be a boolean" });
    }
    if (!isValidObjectId(userId))
      return res.status(400).send({ err: "userId is invalid" });

    const user = await User.findById(userId);
    if (!user) return res.status(400).send({ err: "user does not exist" });

    const blog = new Blog({ ...req.body, user });
    await blog.save();
    return res.send({ blog });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});

blogRouter.put("/:blogId", async (req, res) => {
  try {
    const { blogId } = req.params;
    if (!isValidObjectId(blogId))
      return res.status(400).send({ err: "blogId is invalid" });

    const { title, content } = req.body;
    if (typeof title !== "string")
      return res.status(400).send({ err: "title is required" });
    if (typeof content !== "string")
      return res.status(400).send({ err: "content is required" });

    const blog = await Blog.findOneAndUpdate(
      { _id: blogId },
      { title, content },
      { new: true }
    );
    return res.send({ blog });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});

blogRouter.patch("/:blogId/live", async (req, res) => {
  try {
    const { blogId } = req.params;
    if (!isValidObjectId(blogId))
      res.status(400).send({ err: "blogId is invalid" });

    const { islive } = req.body;
    if (typeof islive !== "boolean")
      return res.status(400).send({ err: "boolean islive is required" });

    const blog = await Blog.findByIdAndUpdate(
      blogId,
      { islive },
      { new: true }
    );

    return res.send({ blog });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err.message });
  }
});

module.exports = { blogRouter };
