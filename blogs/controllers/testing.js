const testingRouter = require('express').Router()
const Note = require('../models/blogs')
const User = require('../models/users')

testingRouter.post('/reset', async (request, response) => {
  console.log('resetting db....')
  // await Blog.deleteMany({})
  await User.deleteMany({})

  // const users = User.find({})
  // console.log('users are ',users.length)

  response.status(204).end()
})

module.exports = testingRouter