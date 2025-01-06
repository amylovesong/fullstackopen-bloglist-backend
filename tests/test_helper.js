const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const initialBlogs = [
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
    likes: 5,
    user: '67794b19fc811aeaa3decd92',
  },
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    user: '67794b19fc811aeaa3decd92',
  }
]

const initialUsers = [
  {
    "username": "root",
    "password": "password",
    "name": "root"
  }
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

const insertOneUserAndGenerateToken = async () => {
  await User.insertMany([
    {
      "username": "amylovesong",
      "name": "Amy Sun",
    }
  ])
  const user = await User.findOne({})
  const userForToken = {
    username: user.username,
    id: user._id
  }
  return jwt.sign(userForToken, process.env.SECRET)
}

module.exports = {
  initialBlogs, blogsInDb, initialUsers, usersInDb, insertOneUserAndGenerateToken
}
