class CustomError extends Error {
  constructor (statusCode, message) {
    super()

    this.name = this.constructor.name
    this.status = statusCode
    this.message = message
  }

  getStatusCode () {
    return this.status
  }

  getMessage () {
    return this.message
  }
}

module.exports = CustomError
