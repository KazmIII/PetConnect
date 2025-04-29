// import { useState, useEffect } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom"; // Import Link from React Router
// import { FaSearch } from "react-icons/fa"; // Import the search icon from react-icons

// const BlogList = () => {
//   const [blogs, setBlogs] = useState([]);
//   const [category, setCategory] = useState(""); // State for selected category
//   const [categories, setCategories] = useState([
//     "Dog Care", "Cat Care", "Pet Nutrition", "General Pet Care"
//   ]); // List of categories
//   const [searchTerm, setSearchTerm] = useState(""); // State for search term

//   useEffect(() => {
//     // Fetch blogs based on the selected category and search term
//     const fetchBlogs = () => {
//       const url = category
//         ? `http://localhost:5000/api/blogs?category=${category}` // Filter blogs by category
//         : "http://localhost:5000/api/blogs"; // Fetch all blogs if no category is selected

//       axios.get(url)
//         .then((response) => setBlogs(response.data))
//         .catch((error) => console.error("Error fetching blogs:", error));
//     };

//     fetchBlogs(); // Call the fetch function
//   }, [category]); // Re-fetch blogs whenever the category changes

//   // Filter blogs based on the search term
//   const filteredBlogs = blogs.filter(blog =>
//     blog.Title.toLowerCase().includes(searchTerm.toLowerCase()) // Match the search term to blog title
//   );

//   return (
//     <div className="max-w-6xl mx-auto p-6">
//       <h1 className="text-4xl font-bold text-center mb-8 text-orange-700">Latest Pet Blogs</h1>

//       {/* Row for category dropdown and search bar */}
//       <div className="flex justify-between mb-6">
//         {/* Category Dropdown */}
//         <div className="w-1/4">
//           <select
//             className="px-4 py-2 border rounded-lg w-full"
//             value={category}
//             onChange={(e) => setCategory(e.target.value)} // Update the category when selected
//           >
//             <option value="">Select Category</option>
//             {categories.map((cat, index) => (
//               <option key={index} value={cat}>
//                 {cat}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Search Bar with Icon */}
//         <div className="w-1/3 relative"> {/* Reduced the width to 1/3 */}
//           <input
//             type="text"
//             placeholder="Search..."
//             className="px-4 py-2 border rounded-lg w-full pl-10"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)} // Update search term as user types
//           />
//           {/* Search Icon inside the input */}
//           <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
//         </div>
//       </div>

//       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filteredBlogs.length > 0 ? (
//           filteredBlogs.map((blog) => (
//             <div key={blog._id} className="bg-white rounded-lg shadow-lg p-4">
//               <Link to={`/blog/${blog._id}`} className="block">
//                 <img
//                   src={blog.Images} // Assuming blog has an Images field
//                   alt={blog.Title}
//                   className="rounded-lg w-full h-48 object-cover"
//                 />
//                 <h2 className="text-xl font-semibold mt-4 hover:underline hover:decoration-gray-400 transition-all duration-300">
//                   {blog.Title}
//                 </h2>
//               </Link>
//               {/* Render HTML content correctly */}
//               <div
//                 className="text-gray-600 mt-2 line-clamp-3"
//                 dangerouslySetInnerHTML={{
//                   __html: blog.Content ? blog.Content.slice(0, 150) + "..." : "No content available...",
//                 }}
//               />
//               <Link to={`/blog/${blog._id}`} className="text-teal-600 mt-2 block font-semibold hover:text-blue-400">
//                 Read More →
//               </Link>
//             </div>
//           ))
//         ) : (
//           <div className="text-center text-gray-600">
//             No blogs found for the selected category or search term.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default BlogList;

import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

const BlogList = () => {
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const initialCategory = queryParams.get("category") || "";

  const [blogs, setBlogs] = useState([]);
  const [category, setCategory] = useState(initialCategory);
  const [categories] = useState([
    "Dog Care",
    "Cat Care",
    "Pet Nutrition",
    "General Pet Care",
  ]);
  const [searchTerm, setSearchTerm] = useState("");

  // Keep category state in sync if someone clicks the breadcrumb link
  useEffect(() => {
    const qp = new URLSearchParams(search);
    setCategory(qp.get("category") || "");
  }, [search]);

  // Fetch blogs whenever category changes
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const url = category
          ? `http://localhost:5000/api/blogs?category=${encodeURIComponent(
              category
            )}`
          : "http://localhost:5000/api/blogs";

        const response = await axios.get(url);
        setBlogs(response.data);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      }
    };

    fetchBlogs();
  }, [category]);

  // Filter by title search
  const filteredBlogs = blogs.filter((b) =>
    b.Title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Heading: category name or default
  const headingText = category || "Pet Blogs";

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-orange-700">
        {headingText}
      </h1>

      {/* Category + Search Row */}
      <div className="flex justify-between mb-6">
        <div className="w-1/4">
          <select
            className="px-4 py-2 border rounded-lg w-full"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="w-1/3 relative">
          <input
            type="text"
            placeholder="Search..."
            className="px-4 py-2 border rounded-lg w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
        </div>
      </div>

      {/* Blog Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlogs.length > 0 ? (
          filteredBlogs.map((blog) => (
            <div key={blog._id} className="bg-white rounded-lg shadow-lg p-4">
              <Link to={`/blog/${blog._id}`} className="block">
                <img
                  src={blog.Images}
                  alt={blog.Title}
                  className="rounded-lg w-full h-48 object-cover"
                />
                <h2 className="text-xl font-semibold mt-4 hover:underline transition">
                  {blog.Title}
                </h2>
              </Link>
              <div
                className="text-gray-600 mt-2 line-clamp-3"
                dangerouslySetInnerHTML={{
                  __html: blog.Content
                    ? blog.Content.slice(0, 150) + "..."
                    : "No content available...",
                }}
              />
              <Link
                to={`/blog/${blog._id}`}
                className="text-teal-600 mt-2 block font-semibold hover:text-blue-400"
              >
                Read More →
              </Link>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-600">
            No blogs found for "{category}".
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;
