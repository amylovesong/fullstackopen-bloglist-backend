const testLogOn = false

const info = (...params) => {
  if (process.env.NODE_ENV !== 'test' || testLogOn) {
    console.log(...params)
  }
}

const error = (...params) => {
  if (process.env.NODE_ENV !== 'test' || testLogOn) {
    console.error(...params)
  }
}

module.exports = {
  info, error
}
