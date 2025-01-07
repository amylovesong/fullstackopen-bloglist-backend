const _ = require('lodash')
const logger = require('../utils/logger')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => {
    return sum + blog.likes
  }

  return blogs.length === 0
    ? 0
    : blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  return blogs.length === 0
    ? null
    : blogs.map(b => {
      return {
        title: b.title,
        author: b.author,
        likes: b.likes
      }
    }).reduce((cur, next) => {
      return cur.likes >= next.likes ? cur : next
    })
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  
  const countedResult = _.countBy(blogs, 'author')
  logger.info('countedResult:', countedResult)
  const pairs = _.toPairs(countedResult)
  logger.info('pairs:', pairs)
  const mapResult = _.map(pairs, p => {
    return {
      author: p[0],
      blogs: p[1]
    }
  })
  logger.info('mapResult:', mapResult)

  const result = _.maxBy(mapResult, 'blogs')
  logger.info('result:', result)
  return result
}

// TODO E4.7
// const mostLikes = (blogs) => {

// }

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs
}
