const BadRequestError = require('./http/badrequest')
const InternalServerError = require('./http/internal')
const NotFoundError = require('./http/notfound')
const UnauthorizedError = require('./http/unauthorized')

const handleError = (statusCode, message) => {
  switch (statusCode) {
    case 400: throw new BadRequestError(message)
    case 401: throw new UnauthorizedError(message)
    case 404: throw new NotFoundError(message)
    default: throw new InternalServerError(message)
  }
}

module.exports = handleError
