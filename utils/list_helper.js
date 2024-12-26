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

// TODO E4.6
// const mostBlogs = (blogs) => {

// }

// TODO E4.7
// const mostLikes = (blogs) => {

// }

module.exports = {
  dummy, totalLikes, favoriteBlog
}
