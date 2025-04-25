import express from "express";
import Blog from "../models/Blog.js";

const router = express.Router();

// GET all blog posts (with optional category filtering)
router.get("/", async (req, res) => {
  const { category } = req.query;  // Get category from query parameters
  try {
    let blogs;
    if (category) {
      blogs = await Blog.find({ Category: category }).sort({ publishedDate: -1 });
    } else {
      blogs = await Blog.find().sort({ publishedDate: -1 });
    }
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single blog by ID
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blog", error });
  }
});

// PUT update blog content
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { Content } = req.body; // Expecting { Content: "..." }
    console.log("Received update for blog ID:", id, "with Content:", Content);

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    blog.Content = Content;
    const updatedBlog = await blog.save();
    console.log("Updated blog:", updatedBlog);
    return res.status(200).json(updatedBlog);
  } catch (error) {
    console.error("Error updating blog:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST comment on a blog by ID
router.post("/:id/comments", async (req, res) => {
  try {
    const { commentText } = req.body;
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    blog.comments.push({ commentText });
    const updatedBlog = await blog.save();
    return res.status(201).json(updatedBlog);
  } catch (error) {
    console.error("Error posting comment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;