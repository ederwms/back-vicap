const crypto = require('crypto')
const multerS3 = require('multer-s3')
const aws = require('aws-sdk')

module.exports = {
  storage: multerS3({
    s3: new aws.S3(),
    bucket: 'vicap-bucket',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key: (req, file, cb) => {
      crypto.randomBytes(16, (error, hash) => {
        if (error) {
          cb(error)
        }

        const fileName = `${hash.toString('hex')}${file.originalname}`

        cb(null, fileName)
      })
    }
  }),
  limits: {
    fileSize: 20 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'video/mp4'
    ]

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Tipo de arquivo inválido.'))
    }
  }
}