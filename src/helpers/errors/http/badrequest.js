const CustomError = require('./custom')

class BadRequestError extends CustomError {
  constructor (message) {
    super(400, message)
  }
}

module.exports = BadRequestError
