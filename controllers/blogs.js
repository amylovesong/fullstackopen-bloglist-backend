const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const middleware = require('../utils/middleware')
const logger = require('../utils/logger')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
    .populate('user', { username: 1, name: 1 })

  response.json(blogs)
})

blogRouter.post('/', middleware.userExtractor, async (request, response) => {
  logger.info('request.user:', request.user)
  const user = await User.findById(request.user.id)

  const blog = new Blog(request.body)
  blog.user = user.id

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const id = request.params.id
  const blog = await Blog.findById(id)
  if (request.user.id !== blog.user.toString()) { // blog.user is not a string, but an object
    return response.status(401).json({ error: 'token invalid'})
  }

  await Blog.findByIdAndDelete(id)
  response.status(204).end()
})

blogRouter.put('/:id', async (request, response) => {
  const body = request.body
  const blog = {
    title: body.title,
    name: body.name,
    url: body.url,
    likes: body.likes
  }

  const id = request.params.id
  const options = { new: true, runValidators: true, context: 'query' }
  const updatedBlog = await Blog.findByIdAndUpdate(id, blog, options)
  response.json(updatedBlog)
})

module.exports = blogRouter
