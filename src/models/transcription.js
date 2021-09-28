const mongoose = require('mongoose')

const TranscriptionSchema = new mongoose.Schema({
  job_name: {
    type: String,
    required: true
  },
  original_video_link: {
    type: String,
    required: false
  },
  video_thumbnail: {
    type: String,
    required: false
  },
  subtitled_video_link: {
    type: String,
    required: false
  },
  subtitles_json: {
    type: String,
    required: false
  }
})

module.exports = mongoose.model('Transcription', TranscriptionSchema)
