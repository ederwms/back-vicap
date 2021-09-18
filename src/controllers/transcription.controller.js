const transcriptionService = require('../services/aws.transcribe/transcription.service')
const videoService = require('../services/video/video.service')

const handleError = require('../helpers/errors/errorHandler')

const startVideoTranscription = async (req, res) => {
  try {
    const result = await transcriptionService.startTranscriptionJob()

    return res.json({ result })
  } catch (error) {
    handleError(error.$metadata.httpStatusCode, error.message)
  }
}

const listTranscriptionJobs = async (req, res) => {
  const { name: filter, nextPageToken } = req.query

  try {
    const data = await transcriptionService.listTranscriptionJobs(filter, nextPageToken)
    const result = data.TranscriptionJobSummaries.map((item) => ({
      startTime: item.StartTime,
      endTime: item.CompletionTime,
      language: item.LanguageCode,
      name: item.TranscriptionJobName,
      status: item.TranscriptionJobStatus
    }))

    return res.json({
      jobs: result,
      ...(data.NextToken && { nextPageToken: data.NextToken })
    })
  } catch (error) {
    handleError(error.$metadata.httpStatusCode, error.message)
  }
}

const getTranscriptionJobByName = async (req, res) => {
  const transcriptionJobName = req.query.name

  try {
    const { transcriptionFileUrl } = await transcriptionService.getTranscriptionDetailsByName(transcriptionJobName)
    await videoService.downloadVideoTranscriptionFile(transcriptionFileUrl)
    await videoService.createSrtFile()
    await videoService.generateSubtitledVideo()
    const uploadedVideo = await videoService.uploadSubtitledVideoToS3()

    return res.json({ videoUrl: uploadedVideo.Location })
  } catch (error) {
    handleError(error.$metadata.httpStatusCode, error.message)
  }
}

module.exports = {
  startVideoTranscription,
  getTranscriptionJobByName,
  listTranscriptionJobs
}
