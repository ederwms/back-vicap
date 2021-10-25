const transcriptionService = require('../services/aws/transcribe/transcription.service')
const dbService = require('../services/service.db/transcription.service')
const videoService = require('../services/video/video.service')

const { Created, Success } = require('../helpers/success')
const handleError = require('../helpers/errors/errorHandler')

const startVideoTranscription = async (req, res) => {
  const { transcriptionJobName, videoUrl } = req.body

  try {
    const transcriptionJobResult = await transcriptionService.startTranscriptionJob(transcriptionJobName, videoUrl)
    await dbService.createTranscriptionJob({
      jobName: transcriptionJobName,
      originalVideoLink: videoUrl
    })

    return new Created(req, res).json({
      transcriptionJobResult,
      message: 'Pedido de transcrição gerado com sucesso!'
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
        ...(dbRecordData.videoThumbnail && { videoThumbnail: dbRecordData.videoThumbnail }),
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
    const {
      subtitled_video_link: subtitledVideoLink,
      subtitles_json: subtitlesJson,
      video_thumbnail: videoThumbnail
    } = await dbService.getTranscriptionJobByName(transcriptionJobName)

    if (subtitledVideoLink) {
      return new Success(req, res).json({
        videoUrl: subtitledVideoLink,
        thumbnailUrl: videoThumbnail,
        subtitles: JSON.parse(subtitlesJson)
      })
    } else {
      const { transcriptionFileUrl, originalVideoLink } = await transcriptionService.getTranscriptionDetailsByName(
        transcriptionJobName
      )

      await videoService.downloadVideoTranscriptionFile(transcriptionFileUrl)
      const subtitlesJson = await videoService.createSrtFile()
      await videoService.generateSubtitledVideo(originalVideoLink)
      await videoService.generateVideoThumbnail()
      const uploadedThumbnail = await videoService.uploadThumbnailToS3()
      const uploadedVideo = await videoService.uploadSubtitledVideoToS3()
      await dbService.editTranscriptionJob({
        jobName: transcriptionJobName,
        subtitledVideoLink: uploadedVideo.Location,
        videoThumbnail: uploadedThumbnail.Location,
        subtitlesJson: JSON.stringify(subtitlesJson)
      })

      return new Success(req, res).json({
        videoUrl: uploadedVideo.Location,
        thumbnailUrl: uploadedThumbnail.Location,
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
