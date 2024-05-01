const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')

const { MONGODB_URI } = require('./utils/config')
const { info,error } = require('./utils/logger')
const blogsRouter = require('./controllers/blogs')
const middleware = require('./utils/middleware')

mongoose.set('strictQuery', false)

mongoose.connect(MONGODB_URI)
  .then(() => {
    info('connected to MongoDB')
  })
  .catch((err) => {
    error('error connecting to MongoDB:', err)
  })

app.use(cors())
app.use(express.json())

app.use(middleware.requestLogger)
app.use('/api/blogs',blogsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
