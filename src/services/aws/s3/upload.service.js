const AWS = require('aws-sdk')

AWS.config.update({ region: 'us-east-1' })

const uploadToS3 = async (file, fileName = 'subtitled-video') => {
  return new Promise(async (resolve, reject) => {
    try {
      const s3 = new AWS.S3({ apiVersion: '2006-03-01' })
      const uploadParams = {
        Bucket: 'vicap-bucket',
        Key: fileName,
        Body: file,
        ACL: 'public-read'
      }

      const uploadedFile = await s3.upload(uploadParams).promise()

      resolve(uploadedFile)
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  uploadToS3
}