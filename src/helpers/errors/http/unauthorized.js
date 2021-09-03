const CustomError = require('./custom')

class UnauthorizedError extends CustomError {
  constructor (message) {
    super(401, message)
  }
}

module.exports = UnauthorizedError
