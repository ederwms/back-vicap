const CustomError = require('./http/custom')
const UnauthorizedError = require('./http/unauthorized')
const InternalServerError = require('./http/internal')
const NotFounderror = require('./http/notfound')
const BadRequestError = require('./http/badrequest')

module.exports = {
  CustomError,
  NotFounderror,
  BadRequestError,
  UnauthorizedError,
  InternalServerError
}
