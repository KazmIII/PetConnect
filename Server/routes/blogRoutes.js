import express from "express";
import Blog from "../models/Blog.js";

const router = express.Router();

// GET all blog posts
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ publishedDate: -1 }); // Sort by latest
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single blog by ID
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);  // Find blog by ID
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.json(blog);  // Return the found blog data
  } catch (error) {
    res.status(500).json({ message: "Error fetching blog", error });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { Content } = req.body; // the updated HTML

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    blog.Content = Content; // store HTML
    const updatedBlog = await blog.save();
    return res.status(200).json(updatedBlog);
  } catch (error) {
    console.error("Error updating blog:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/comments", async (req, res) => {
  try {
    const { commentText } = req.body;
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    // Push the new comment into the comments array
    blog.comments.push({ commentText });
    const updatedBlog = await blog.save();
    return res.status(201).json(updatedBlog);
  } catch (error) {
    console.error("Error posting comment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
