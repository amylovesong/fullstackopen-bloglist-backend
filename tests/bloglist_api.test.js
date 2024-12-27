const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const app = require('../app')
const supertest = require('supertest')
const mongoose = require('mongoose')
const Blog = require('../models/blog')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({}) // clear out the database

  const blogs = helper.initialBlogs
    .map(blog => new Blog(blog))
  const promises = blogs.map(b => b.save())
  await Promise.all(promises)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are two blogs', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('the unique identifier property of the blog posts is named id', async () => {
  const response = await api.get('/api/blogs')

  assert(response.body[0].id)
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

  const titles = blogsAtEnd.map(blog => blog.title)
  assert(titles.includes('First class tests'))
})

test('the default value of the likes property is 0', async () => {
  const newBlog = {
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
  }

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
  console.log('addedBlog:', response.body)
  
  assert.strictEqual(response.body.likes, 0)
})

test('the title property of a new blog is required', async () => {
  const newBlog = {
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('the url property of a new blog is required', async () => {
  const newBlog = {
    title: "First class tests",
    author: "Robert C. Martin",
    likes: 10,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('a blog can be deleted', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

  const titles = blogsAtEnd.map(blog => blog.title)
  assert(!titles.includes(blogToDelete.title))
})

after(async () => {
  await mongoose.connection.close()
})
