const accountService = require('../services/analyzer/account.service')
const videoService = require('../services/analyzer/video.service')

const handleError = require('../helpers/errors/errorHandler')

const getVideoTranscription = async (req, res) => {
  console.log('teste')
  try {
    const token = await accountService.getAccountToken()
    const videoInsights = await videoService.getVideoIndex(token)

    const transcript = videoInsights.transcript.map((item) => ({
      text: item.text,
      startTime: item.instances[0].start,
      endTime: item.instances[0].end
    }))

    return res.json({ transcription: transcript })
  } catch (error) {
    // TODO tratativa de erro
    // console.log(error)
    // throw new Error('erro')
    handleError(error.response.status, error.response.data.Message)
  }
}

module.exports = {
  getVideoTranscription
}
