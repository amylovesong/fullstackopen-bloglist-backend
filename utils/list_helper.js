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

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const groupResult = _.groupBy(blogs, 'author')
  logger.info('groupResult:', groupResult)
  const mapResult = _.mapValues(groupResult, (value) => _.sumBy(value, 'likes'))
  logger.info('mapResult:', mapResult)
  
  const result = _.maxBy(
    _.map(_.toPairs(mapResult), p => {
      return {
        author: p[0],
        likes: p[1]
      }
    }),
    'likes'
  )
  logger.info('result:', result)
  return result
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}
