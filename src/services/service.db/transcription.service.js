const db = require('./_access')
const transcriptionModel = require('../../models/transcription')

const getAllTranscriptionJobs = async () => {
  try {
    const result = await transcriptionModel.find({})

    return result.map((item) => ({
      jobName: item._doc.job_name,
      originalVideoLink: item._doc.original_video_link,
      subtitledVideoLink: item._doc.subtitled_video_link,
      videoThumbnail: item._doc.video_thumbnail,
      subtitlesJson: item._doc.subtitles_json
    }))
  } catch(error) {
    throw error
  }
}

const getTranscriptionJobByName = async (name) => {
  const result = await transcriptionModel.findOne({ job_name: name })

  return result._doc
}

const createTranscriptionJob = async ({ jobName, originalVideoLink }) => {
  const result = await transcriptionModel.create({
    job_name: jobName,
    original_video_link: originalVideoLink,
    video_thumbnail: null,
    subtitled_video_link: null,
    subtitles_json: null
  })

  return result
}

const editTranscriptionJob = async ({ jobName, subtitledVideoLink, subtitlesJson, videoThumbnail }) => {
  const result = await transcriptionModel.updateOne({ job_name: jobName }, {
    $set: {
      subtitled_video_link: subtitledVideoLink,
      subtitles_json: subtitlesJson,
      video_thumbnail: videoThumbnail
    }
  })

  return result
}

module.exports = {
  getTranscriptionJobByName,
  getAllTranscriptionJobs,
  createTranscriptionJob,
  editTranscriptionJob
}
