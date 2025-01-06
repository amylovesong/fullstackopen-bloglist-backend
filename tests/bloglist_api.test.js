const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const app = require('../app')
const supertest = require('supertest')
const mongoose = require('mongoose')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)
const testToken = process.env.TEST_TOKEN

describe('when there are some blogs saved initially', () => {
  beforeEach(async () => {
    await Blog.deleteMany({}) // clear out the database
    await Blog.insertMany(helper.initialBlogs)
  })
  
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
  
  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
  
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })
  
  test('the unique identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs')
  
    assert(response.body[0].id)
  })
  
  describe('addition of a new blog', () => {
    const testData = {}
    beforeEach(async () => {
      await User.deleteMany({})
      const token = await helper.insertOneUserAndGenerateToken()
      testData.token = `Bearer ${token}`
    })

    test('succeeds with valid data', async () => {
      const newBlog = {
        title: "First class tests",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
        likes: 10,
      }
    
      await api
        .post('/api/blogs')
        .set('Authorization', testData.token)
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
        .set('Authorization', testData.token)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      
      assert.strictEqual(response.body.likes, 0)
    })
    
    test('fails with status code 400 if title is missing', async () => {
      const newBlog = {
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
        likes: 10,
      }
    
      await api
        .post('/api/blogs')
        .set('Authorization', testData.token)
        .send(newBlog)
        .expect(400)
    })
    
    test('fails with status code 400 if url is missing', async () => {
      const newBlog = {
        title: "First class tests",
        author: "Robert C. Martin",
        likes: 10,
      }
    
      await api
        .post('/api/blogs')
        .set('Authorization', testData.token)
        .send(newBlog)
        .expect(400)
    })

    test('fails with status code 401 if token is not provided', async () => {
      const newBlog = {
        title: "First class tests",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
        likes: 10,
      }
    
      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)
        .expect('Content-Type', /application\/json/)
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]
    
      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', testToken)
        .expect(204)
    
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
    
      const titles = blogsAtEnd.map(blog => blog.title)
      assert(!titles.includes(blogToDelete.title))
    })
  })

  describe('update of a blog', () => {
    test('succeeds with status code 200 if data and id are valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]
    
      const blog = {
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
        likes: 6,
      }
    
      const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(blog)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      
      assert.strictEqual(response.body.likes, blog.likes)
    
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })
})

describe('when there are some users saved initially', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    await User.insertMany(helper.initialUsers)
  })

  describe('addition of a new user', () => {
    test('succeeds with valid data', async () => {
      const newUser = {
        "username": "amylovesong",
        "password": "password",
        "name": "Amy Sun"
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, helper.initialUsers.length + 1)

      const usernames = usersAtEnd.map(u => u.username)
      assert(usernames.includes('amylovesong'))
    })

    test('fails with status code 400 if username is missing', async () => {
      const newUser = {
        "password": "password",
        "name": "Amy Sun"
      }

      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

      assert(response.body.error.length !== 0)
      
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, helper.initialUsers.length)
    })

    test('fails with status code 400 if username is invalid', async () => {
      const newUser = {
        "username": "am",
        "password": "password",
        "name": "Amy Sun"
      }

      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
      
      assert(response.body.error.length !== 0)

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, helper.initialUsers.length)
    })

    test('fails with status code 400 if password is missing', async () => {
      const newUser = {
        "username": "amylovesong",
        "name": "Amy Sun"
      }

      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

      assert.strictEqual(response.body.error, 'invalid password')
      
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, helper.initialUsers.length)
    })

    test('fails with status code 400 if password is invalid', async () => {
      const newUser = {
        "username": "amylovesong",
        "password": "pa",
        "name": "Amy Sun"
      }

      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
      
      assert.strictEqual(response.body.error, 'invalid password')

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, helper.initialUsers.length)
    })

    test('fails with status code 400 if username is not unique', async () => {
      const newUser = {
        "username": "root",
        "password": "password",
        "name": "root"
      }

      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

      assert.strictEqual(response.body.error, 'expected `username` to be unique')
      
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, helper.initialUsers.length)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})
