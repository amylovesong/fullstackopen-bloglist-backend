const logger = require('./logger')

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

const tokenExtractor = (request, response, next) => {
  request.token = getTokenFrom(request)

  next()
}

module.exports = {
  errorHandler, tokenExtractor
}
