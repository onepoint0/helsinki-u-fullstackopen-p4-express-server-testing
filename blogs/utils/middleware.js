const { info, error } = require('./logger')
const jwt = require('jsonwebtoken')

const tokenExtractor = (request,response,next) => {
  const auth = request.get('Authorization')

  if ( auth && auth.startsWith('Bearer')) request.token = auth.replace('Bearer ','')

  next()
}

const userExtractor = (request,response,next) => {

  if (request.token) request.user =  jwt.verify(request.token,process.env.SECRET).id
  // console.log('userExtractor ',request.user)

  next()
}

const requestLogger = (request, response, next) => {
    if (process.env.NODE_ENV !== 'test') { 
      info('Method:', request.method)
      info('Path:  ', request.path)
      info('Body:  ', request.body)
      info('---')
    }
    next()
}
  
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (err, request, response, next) => {
  console.log('in error handler')
    error(err.message)
  
    if (err.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (err.name === 'ValidationError') {
      return response.status(400).json({ error: err.message })
    } else if (err.name === 'MongoServerError' && err.message.includes('E11000 duplicate key error')) {
      return response.status(400).json({ error: 'expected `username` to be unique' })
    }
  
    next(err)
}

module.exports = {
    requestLogger,
    tokenExtractor,
    userExtractor,
    unknownEndpoint,
    errorHandler
}