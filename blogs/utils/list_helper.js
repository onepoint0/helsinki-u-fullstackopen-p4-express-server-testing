const _ = require('lodash')

const dummy = (blogs) => 1

const totalLikes = (blogs) => {
    return blogs.reduce((sum,part) => sum + part.likes,0)
}

const favoriteBlog = (blogs) => {
    const favorite = blogs.reduce((highest,blog) => highest.likes > blog.likes ? highest : blog )

    return {
        title: favorite.title,
        author: favorite.author,
        likes: favorite.likes,
    }
}

const mostBlogs = (blogs) => {
    return _(blogs).groupBy('author').map((group,author) => ({author,blogs: group.length})).maxBy('blogs')
}

const mostLikes = (blogs) => {
    return _(blogs).groupBy('author').map((group,author) => ({author,likes: _.sumBy(group,group => group.likes)})).maxBy('likes')
}

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes }