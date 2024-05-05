const config = require('./utils/config')
const express = require('express')
const app = express()
require('express-async-errors')
const cors = require('cors')
const mongoose = require('mongoose')

const { MONGODB_URI } = require('./utils/config')
const { info,error } = require('./utils/logger')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
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

app.use(middleware.tokenExtractor)
// app.use(middleware.userExtractor)
app.use(middleware.requestLogger)

app.use('/api/users',usersRouter)
app.use('/api/blogs',middleware.userExtractor,blogsRouter)
app.use('/api/login',loginRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
