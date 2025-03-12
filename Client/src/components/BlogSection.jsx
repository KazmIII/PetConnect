import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";  // Import Link from React Router

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/blogs")
      .then((response) => setBlogs(response.data))
      .catch((error) => console.error("Error fetching blogs:", error));
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-orange-700">Latest Pet Blogs</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <div key={blog._id} className="bg-white rounded-lg shadow-lg p-4">
            <Link to={`/blog/${blog._id}`} className="block">
              <img src={blog.Images} alt={blog.Title} className="rounded-lg w-full h-48 object-cover" />
              <h2 className="text-xl font-semibold mt-4 hover:underline hover:decoration-gray-400 transition-all duration-300">
                {blog.Title}
              </h2>
            </Link>
            {/* Render HTML content correctly */}
            <div
              className="text-gray-600 mt-2 line-clamp-3"
              dangerouslySetInnerHTML={{
                __html: blog.Content ? blog.Content.slice(0, 150) + "..." : "No content available...",
              }}
            />
            <Link to={`/blog/${blog._id}`} className="text-teal-600 mt-2 block font-semibold hover:text-blue-400">
              Read More →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogList;
