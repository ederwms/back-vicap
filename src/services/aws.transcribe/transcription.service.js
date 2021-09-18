const {
  TranscribeClient,
  StartTranscriptionJobCommand,
  ListTranscriptionJobsCommand,
  GetTranscriptionJobCommand
} = require('@aws-sdk/client-transcribe')

const client = new TranscribeClient({ region: process.env.AWS_REGION })

const awsTranscribeParams = {
  TranscriptionJobName: 'transcription-job-07',
  IdentifyLanguage: true,
  MediaFormat: 'mp4',
  Media: {
    MediaFileUri: 'https://vicap-bucket.s3.amazonaws.com/video-portugues.mp4'
  }
}

const startTranscriptionJob = async () => {
  try {
    const data = await client.send(new StartTranscriptionJobCommand(awsTranscribeParams))

    return data
  } catch (error) {
    throw error
  }
}

const listTranscriptionJobs = async (transcriptionName = '', nextPageToken = '') => {
  const listTranscriptionParams = {
    MaxResults: 10,
    ...(transcriptionName !== '' && { JobNameContains: transcriptionName }),
    ...(nextPageToken !== '' && { NextToken: nextPageToken })
 }

  try {
    const data = await client.send(new ListTranscriptionJobsCommand(listTranscriptionParams))

    return data
  } catch (error) {
    throw error
  }
}

const getTranscriptionDetailsByName = async (transcriptionJobName = null) => {
  const getTranscriptionParams = {
    TranscriptionJobName: transcriptionJobName
  }

  try {
    const data = await client.send(new GetTranscriptionJobCommand(getTranscriptionParams))
    const result = {
      transcriptionFileUrl: data.TranscriptionJob.Transcript.TranscriptFileUri
    }

    return result
  } catch (error) {
    throw error
  }
}

module.exports = {
  startTranscriptionJob,
  listTranscriptionJobs,
  getTranscriptionDetailsByName
}
