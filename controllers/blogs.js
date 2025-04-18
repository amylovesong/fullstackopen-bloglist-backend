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
  logger.info('find user:', user)

  const blog = new Blog(request.body)
  blog.user = user.id

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  // replace user id with user info for response
  const blogToResponse = await Blog.findById(savedBlog.id)
    .populate('user', { username: 1, name: 1 })
  response.status(201).json(blogToResponse)
})

blogRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const id = request.params.id
  const blog = await Blog.findById(id)
  logger.info('find blog:', blog)
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
    author: body.author,
    user: body.user,
    url: body.url,
    likes: body.likes
  }

  logger.info('put request.body:', body, ' blog:', blog)
  const id = request.params.id
  const options = { new: true, runValidators: true, context: 'query' }
  const updatedBlog = await Blog.findByIdAndUpdate(id, blog, options)
  // replace user id with user info for response
  const blogToResponse = await Blog.findById(updatedBlog.id)
    .populate('user', { username: 1, name: 1 })
  
  response.json(blogToResponse)
})

blogRouter.put('/:id/comments', async (request, response) => {
  const body = request.body
  const id = request.params.id
  const blog = await Blog.findById(id)
  logger.info('put request.body:', body, ' blog:', blog)
  const comments = blog.comments ? blog.comments : []
  const newBlog = {
    ...blog._doc,
    comments: comments.concat(body.comment)
  }
  logger.info('put newBlog:', newBlog)

  const options = { new: true, runValidators: true, context: 'query' }
  const updatedBlog = await Blog.findByIdAndUpdate(id, newBlog, options)
  // replace user id with user info for response
  const blogToResponse = await Blog.findById(updatedBlog.id)
    .populate('user', { username: 1, name: 1 })
  
  response.json(blogToResponse)
})

module.exports = blogRouter
