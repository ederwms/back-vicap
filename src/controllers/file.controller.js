const { Created } = require('../helpers/success')
const handleError = require('../helpers/errors/errorHandler')

const createFile = async (req, res) => {
  const file = req.file

  if (file.location) {
    return new Created(req, res).json({
      message: 'Arquivo enviado com sucesso!',
      fileUrl: file.location
    })
  } else {
    handleError(500, 'Ocorreu um erro ao enviar o arquivo, tente novamente mais tarde.')
  }
}
module.exports = {
  createFile
}
