// Blog Management Service
const BLOG_STORAGE_KEY = 'blogs';

/**
 * Retrieve all blogs from localStorage
 * @returns {Array} Array of blog objects
 */
export function getBlogs() {
    const data = localStorage.getItem(BLOG_STORAGE_KEY);
    if (data) {
        try {
            return JSON.parse(data);
        } catch (error) {
            console.error('Error parsing blog data:', error);
            return [];
        }
    }
    return [];
}

/**
 * Save blogs array to localStorage
 * @param {Array} blogs - Array of blog objects to save
 */
export function saveBlogs(blogs) {
    localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(blogs));
}

/**
 * Add a new blog post
 * @param {Object} blog - Blog object to add
 */
export function addBlog(blog) {
    const blogs = getBlogs();
    blogs.push(blog);
    saveBlogs(blogs);
}

/**
 * Update an existing blog post
 * @param {Object} updatedBlog - Updated blog object with same ID
 */
export function updateBlog(updatedBlog) {
    const blogs = getBlogs();
    const idx = blogs.findIndex(b => b.id === updatedBlog.id);
    if (idx !== -1) {
        blogs[idx] = updatedBlog;
        saveBlogs(blogs);
    }
}

/**
 * Delete a blog post by ID
 * @param {string|number} id - ID of the blog to delete
 */
export function deleteBlog(id) {
    const blogs = getBlogs().filter(b => b.id !== id);
    saveBlogs(blogs);
}

/**
 * Reset blogs to mock data
 * @param {Array} mockBlogs - Array of mock blog objects
 */
export function resetBlogs(mockBlogs) {
    saveBlogs(mockBlogs);
} 