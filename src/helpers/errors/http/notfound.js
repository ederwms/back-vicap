const CustomError = require('./custom')

class NotFounderror extends CustomError {
  constructor (message) {
    super(404, message)
  }
}

module.exports = NotFounderror
