const Blog = require('../models/blogs')

const initialBlogs = [
    {
        title:   "A new blog!",
        author:  "clario",
        url:     "https://clareivers.com",
        likes:   11
    },
    {
        title:   "Second blog",
        author:  "betty",
        url:     "https://bettysblog.com",
        likes:   9
    },
    {
        title:   "Third blog",
        author:  "Lucy",
        url:     "https://coolblog.com",
        likes:   10
    }
]

const initialUser = {
    username: "testuser",
    password: "password"
}

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

module.exports = {
    initialBlogs,
    initialUser,
    blogsInDb
}