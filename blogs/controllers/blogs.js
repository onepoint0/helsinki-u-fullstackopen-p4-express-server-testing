const blogsRouter = require('express').Router()
const Blog = require('../models/blogs')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {

  const blog = await Blog.findById(request.params.id)

  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }

})

blogsRouter.delete('/:id', async (request, response) => {
  const deleted = await Blog.findByIdAndDelete(request.params.id)

  response.status(204).end()
})

blogsRouter.post('/', async (request, response) => {
    const keys = Object.keys(request.body)

    if (!keys.includes('likes')) {
      console.log('nolikes :( ')
      request.body.likes = 0
    }

    if (!keys.includes('title')) return response.status(400).send({ error: `missing title` })

    if (!keys.includes('url')) return response.status(400).send({ error: `missing url` })

    const blog = new Blog(request.body)
  
    await blog
      .save()
      .then(result => {
        response.status(201).json(result)
      })
  })

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    .then(updatedBlog => {
      response.json(updatedBlog)
    })
    // .catch(error => next(error))

  })

module.exports = blogsRouter