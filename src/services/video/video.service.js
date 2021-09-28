const srtConvert = require('aws-transcription-to-srt')
const exec = require('child_process').exec
const crypto = require('crypto')
const https = require('https')
const path = require('path')
const fs = require('fs')

const uploadService = require('../aws/s3/upload.service')

const downloadVideoTranscriptionFile = async (fileUrl) => {
  return new Promise((resolve, reject) => {
    https.get(fileUrl, async (response) => {
      await response.pipe(fs.createWriteStream(path.resolve('src', 'tmp', 'transcriptionFile.json')))
        .on('finish', () => {
          resolve()
        })
        .on('error', (error) => {
          reject(error)
        })
    })
    .on('error', (error) => {
      reject(error)
    })
  })
}

const createSrtFile = async () => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve('src', 'tmp', 'transcriptionFile.json'), 'utf-8', (error, data) => {
      if (error) {
        reject(error)
      }

      const json = JSON.parse(data)
      const srt = srtConvert(json)

      fs.writeFile(path.resolve('src', 'tmp', 'subtitles.srt'), srt, async (error) => {
        if (error) {
          reject(error)
        }

        const subtitlesJson = await srtToJson(path.resolve('src', 'tmp', 'subtitles.srt'))
        resolve(subtitlesJson)
      })
    })
  })
}

const srtToJson = async (filePath) => {
  const fileBuffer = fs.readFileSync(filePath, 'utf-8')

  const text = fileBuffer.toString()
  const lines = text.split('\n')

  const output = []
  let buffer = {
    text: ''
  }

  lines.forEach((line) => {
    if (!buffer.id) {
      buffer.id = line
    } else if (!buffer.start) {
      const range = line.split(' --> ')

      buffer.start = range[0]
      buffer.end = range[1]
    } else if (line !== '') {
      buffer.text = line
    } else {
      output.push(buffer)

      buffer = {
        text: ''
      }
    }
  })

  return JSON.parse(JSON.stringify(output))
}

const downloadVideoFile = async (originalVideoLink) => {
  return new Promise((resolve, reject) => {
    https.get(originalVideoLink, async (response) => {
      await response.pipe(fs.createWriteStream(path.resolve('src', 'tmp', 'originalVideo.mp4')))
        .on('finish', () => {
          resolve()
        })
        .on('error', (error) => {
          reject(error)
        })
    })
    .on('error', (error) => {
      reject(error)
    })
  })
}

const generateSubtitledVideo = async (originalVideoLink) => {
  return new Promise(async (resolve, reject) => {
    await downloadVideoFile(originalVideoLink)

    /**
     * NOTE
     * Ainda vai ser necessário configurar os caminhos para os arquivos corretamente,
     * aplicando os escapes nos caracteres necessários. Deixei essa parte por último
     * para não perder tempo demais nisso e conseguir finalizer. Como ainda não consegui
     * implementar um método para fazer o normalize do caminho das legendas automaticamente,
     * deixei hard coded. O método path.normalize() foi suficiente para os outros.
     *
     * Especificamente o caminho das legendas deve ter as 3 "\" após a letra C porque precisamos escapar
     * o caractere ":" para o ffmpeg e só funcionou colocando 3 barras invertidas
     * Assim: C\\\:/projects/vicap/back-vicap/src/tmp/subtitles.srt
     */
    const videoFile = path.normalize(path.resolve(__dirname, '..', '..', 'tmp', 'originalVideo.mp4'))
    const subtitlesFile = 'C\\\:/projects/vicap/back-vicap/src/tmp/subtitles.srt'
    const outputFile = path.normalize(path.resolve(__dirname, '..', '..', 'tmp', 'output.mp4'))
    exec(`ffmpeg -i "${videoFile}" -vf "subtitles='${subtitlesFile}'" "${outputFile}"`, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else {
        resolve('Deu boa carai!1!1!!') // kkk
      }
    }).stdin.write("y\n")
  })
}

const generateVideoThumbnail = async () => {
  return new Promise((resolve, reject) => {
    const imageFile = path.normalize(path.resolve(__dirname, '..', '..', 'tmp', 'originalVideo.mp4'))
    const outputFile = path.normalize(path.resolve(__dirname, '..', '..', 'tmp', 'thumbnail.jpg'))

    exec(`ffmpeg -itsoffset -1 -i ${imageFile} -vcodec mjpeg -vframes 1 -an -f rawvideo -s 1920x1080 ${outputFile}`, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else {
        resolve('Deu boa carai!1!1!!') // kkk
      }
    }).stdin.write("y\n")
  })
}

const uploadThumbnailToS3 = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const imageFile = path.normalize(path.resolve(__dirname, '..', '..', 'tmp', 'thumbnail.jpg'))

      const fileName = await generateRandomFileName()
      const fileStream = fs.createReadStream(imageFile)
      fileStream.on('error', (error) => {
        reject(error)
      })

      const result = await uploadService.uploadToS3(fileStream, `${fileName}.jpg`)
      resolve(result)
    } catch (error) {
      reject(error)
    }
  })
}

const uploadSubtitledVideoToS3 = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const videoFile = path.normalize(path.resolve(__dirname, '..', '..', 'tmp', 'output.mp4'))

      const fileName = await generateRandomFileName()
      const fileStream = fs.createReadStream(videoFile)
      fileStream.on('error', (error) => {
        reject(error)
      })

      const result = await uploadService.uploadToS3(fileStream, `${fileName}.mp4`)
      resolve(result)
    } catch (error) {
      reject(error)
    }
  })
}

const generateRandomFileName = async () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(16, (error, hash) => {
      if (error) {
        reject(error)
      }

      const fileName = `${hash.toString('hex')}`

      resolve(fileName)
    })
  })
}

module.exports = {
  downloadVideoTranscriptionFile,
  generateSubtitledVideo,
  generateVideoThumbnail,
  uploadThumbnailToS3,
  uploadSubtitledVideoToS3,
  createSrtFile
}