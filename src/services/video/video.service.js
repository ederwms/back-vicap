const srtConvert = require('aws-transcription-to-srt')
const AWS = require('aws-sdk')

AWS.config.update({ region: 'us-east-1' })

const exec = require('child_process').exec
const https = require('https')
const path = require('path')
const fs = require('fs')
const { resolve, normalize } = require('path')

const downloadVideoTranscriptionFile = async (fileUrl) => {
  return new Promise((resolve, reject) => {
    https.get(fileUrl, async (response) => {
      await response.pipe(fs.createWriteStream(path.resolve('src', 'tmp', 'file.json')))
        .on('finish', async () => {
          try {
            resolve()
          } catch(error) {
            reject(error)
          }
        })
    })
    .on('error', (error) => {
      reject(error)
    })
  })
}

const createSrtFile = async () => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve('src', 'tmp', 'file.json'), 'utf-8', (error, data) => {
      if (error) {
        reject(error)
      }

      const json = JSON.parse(data)
      const srt = srtConvert(json)

      fs.writeFile(path.resolve('src', 'tmp', 'subtitles.srt'), srt, (error) => {
        if (error) {
          reject(error)
        }

        resolve({
          status: 'success'
        })
      })
    })
  })
}

const downloadVideoFile = async () => {
  // TODO receber url do video via parametros do método e fazer download do arquivo correto
  const videoUrl = 'https://vicap-bucket.s3.amazonaws.com/video-portugues.mp4'

  return new Promise((resolve, reject) => {
    https.get(videoUrl, async (response) => {
      await response.pipe(fs.createWriteStream(path.resolve('src', 'tmp', 'originalVideo.mp4')))
        .on('finish', () => {
          try {
            resolve()
          } catch(error) {
            reject(error)
          }
        })
    })
    .on('error', (error) => {
      reject(error)
    })
  })
}

const generateSubtitledVideo = async () => {
  return new Promise(async (resolve, reject) => {
    await downloadVideoFile()

    /**
     * TODO
     * configurar os caminhos para os arquivos corretamente, aplicando os escapes
     * nos caracteres necessários
     *
     * Especificamente o caminho das legendas deve ter as 3 "\" após a letra C porque precisamos escapar
     * o caractere ":" para o ffmpeg e só funcionou colocando 3 barras invertidas
     * Assim: C\\\:/projects/vicap/back-vicap/src/tmp/subtitles.srt
     *
     * Ainda não consegui implementar um método para fazer o normalize automaticamente...
     * Por enquanto está hard coded
     */
    const videoFile = path.normalize(path.resolve(__dirname, '..', '..', 'tmp', 'originalVideo.mp4'))
    const subtitlesFile = 'C\\\:/projects/vicap/back-vicap/src/tmp/subtitles.srt'
    const outputFile = path.normalize(path.resolve(__dirname, '..', '..', 'tmp', 'output.mp4'))
    exec(`ffmpeg -i "${videoFile}" -vf "subtitles='${subtitlesFile}'" "${outputFile}"`, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else {
        resolve('Deu boa carai!1!1!!')
      }
    }).stdin.write("y\n")
  })
}

const uploadSubtitledVideoToS3 = async () => {
  return new Promise(async (resolve, reject) => {
    const videoFile = path.normalize(path.resolve(__dirname, '..', '..', 'tmp', 'output.mp4'))

    const fileStream = fs.createReadStream(videoFile)
    fileStream.on('error', (error) => {
      console.log('Deu zebra no upload aqui mano: ', error)
      reject(error)
    })

    try {
      const result = await uploadToS3(fileStream)

      resolve(result)
    } catch (error) {
      reject(error)
    }
  })
}

const uploadToS3 = async (file) => {
  return new Promise(async (resolve, reject) => {
    try {
      const s3 = new AWS.S3({ apiVersion: '2006-03-01' })
      const uploadParams = {
        Bucket: 'vicap-bucket',
        Key: 'subtitled-video.mp4',
        Body: file
      }

      const uploadedFile = await s3.upload(uploadParams).promise()

      resolve(uploadedFile)
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  downloadVideoTranscriptionFile,
  generateSubtitledVideo,
  uploadSubtitledVideoToS3,
  createSrtFile
}