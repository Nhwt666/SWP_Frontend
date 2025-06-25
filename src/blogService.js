// blogService.js
// Service quản lý blog dùng chung cho cả admin và Blog Chia Sẻ

const BLOG_STORAGE_KEY = 'blogs';

// Lấy danh sách blog từ localStorage
export function getBlogs() {
    const data = localStorage.getItem(BLOG_STORAGE_KEY);
    if (data) {
        try {
            return JSON.parse(data);
        } catch {
            return [];
        }
    }
    return [];
}

// Lưu danh sách blog vào localStorage
export function saveBlogs(blogs) {
    localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(blogs));
}

// Thêm blog mới
export function addBlog(blog) {
    const blogs = getBlogs();
    blogs.push(blog);
    saveBlogs(blogs);
}

// Cập nhật blog
export function updateBlog(updatedBlog) {
    const blogs = getBlogs();
    const idx = blogs.findIndex(b => b.id === updatedBlog.id);
    if (idx !== -1) {
        blogs[idx] = updatedBlog;
        saveBlogs(blogs);
    }
}

// Xóa blog
export function deleteBlog(id) {
    const blogs = getBlogs().filter(b => b.id !== id);
    saveBlogs(blogs);
}

// Reset về mock data
export function resetBlogs(mockBlogs) {
    saveBlogs(mockBlogs);
} 