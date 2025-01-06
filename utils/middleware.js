const logger = require('./logger')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')

const errorHandler = (error, request, response, next) => {
  logger.info('error name:', error.name, 'message:', error.message)
  
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'expected `username` to be unique' })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'token invalid'})
  }

  next(error)
}

const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }

  return null
}

const userExtractor = (request, response, next) => {
  const token = getTokenFrom(request)
  const decodedToken = jwt.verify(token, config.SECRET)
  logger.info('userExtractor decodedToken:', decodedToken)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  request.user = decodedToken

  next()
}

module.exports = {
  errorHandler, userExtractor
}
