const transcriptionService = require('../services/aws/transcribe/transcription.service')
const dbService = require('../services/service.db/transcription.service')
const videoService = require('../services/video/video.service')

const { Created, Success } = require('../helpers/success')
const handleError = require('../helpers/errors/errorHandler')

const startVideoTranscription = async (req, res) => {
  const { transcriptionJobName } = req.body
  const file = req.file

  try {
    const transcriptionJobResult = await transcriptionService.startTranscriptionJob(transcriptionJobName, file.location)
    await dbService.createTranscriptionJob({
      jobName: transcriptionJobName,
      originalVideoLink: file.location
    })

    return new Created(req, res).json({
      transcriptionJobResult
    })
  } catch (error) {
    handleError(error.$metadata ? error.$metadata.httpStatusCode : 500, error.message)
  }
}

const listTranscriptionJobs = async (req, res) => {
  const { name: filter, nextPageToken } = req.query

  try {
    const dbData = await dbService.getAllTranscriptionJobs()
    const transcribeData = await transcriptionService.listTranscriptionJobs(filter, nextPageToken)
    const result = transcribeData.TranscriptionJobSummaries.map((item) => {
      const dbRecordData = dbData.find((dbItem) => dbItem.jobName === item.TranscriptionJobName)

      return {
        startTime: item.StartTime,
        endTime: item.CompletionTime,
        language: item.LanguageCode,
        name: item.TranscriptionJobName,
        status: item.TranscriptionJobStatus,
        originalVideoLink: dbRecordData.originalVideoLink,
        ...(dbRecordData.subtitledVideoLink && { subtitledVideoLink: dbRecordData.subtitledVideoLink }),
        ...(item.TranscriptionJobStatus === 'FAILED' && item.FailureReason && { failureReason: item.FailureReason })
      }
    })

    return new Success(req, res).json({
      jobs: result,
      ...(transcribeData.NextToken && {
        nextPageToken: transcribeData.NextToken
      })
    })
  } catch (error) {
    handleError(error.$metadata ? error.$metadata.httpStatusCode : 500, error.message)
  }
}

const getTranscriptionJobByName = async (req, res) => {
  const transcriptionJobName = req.query.name

  try {
    const { subtitledVideoLink, subtitlesJson } = await dbService.getTranscriptionJobByName(transcriptionJobName)

    if (subtitledVideoLink) {
      return res.json({
        videoUrl: subtitledVideoLink,
        subtitles: JSON.parse(subtitlesJson)
      })
    } else {
      const { transcriptionFileUrl, originalVideoLink } = await transcriptionService.getTranscriptionDetailsByName(
        transcriptionJobName
      )
      await videoService.downloadVideoTranscriptionFile(transcriptionFileUrl)
      const subtitlesJson = await videoService.createSrtFile()
      await videoService.generateSubtitledVideo(originalVideoLink)
      const uploadedVideo = await videoService.uploadSubtitledVideoToS3()
      await dbService.editTranscriptionJob({
        jobName: transcriptionJobName,
        subtitledVideoLink: uploadedVideo.Location,
        isJobFinished: true,
        subtitlesJson: JSON.stringify(subtitlesJson)
      })

      return new Success(req, res).json({
        videoUrl: uploadedVideo.Location,
        subtitles: subtitlesJson
      })
    }
  } catch (error) {
    handleError(error.$metadata ? error.$metadata.httpStatusCode : 500, error.message)
  }
}

module.exports = {
  startVideoTranscription,
  getTranscriptionJobByName,
  listTranscriptionJobs
}
