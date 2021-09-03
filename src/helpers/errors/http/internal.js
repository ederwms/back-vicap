const CustomError = require('./custom')

class InternalServerError extends CustomError {
  constructor (message) {
    super(500, message)
  }
}

module.exports = InternalServerError
