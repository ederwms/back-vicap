const { CustomError } = require('../helpers/errors')

module.exports = (error, req, res, next) => {
  if (error instanceof CustomError) {
    return res.status(error.getStatusCode()).json({
      error: {
        code: error.getStatusCode(),
        message: error.getMessage()
      }
    })
  }

  return res.status(500).json({
    error,
    message: 'Unexpected error ocurred, try again later.'
  })
}
