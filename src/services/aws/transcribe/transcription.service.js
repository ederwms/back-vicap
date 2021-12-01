const {
  TranscribeClient,
  StartTranscriptionJobCommand,
  ListTranscriptionJobsCommand,
  GetTranscriptionJobCommand
} = require('@aws-sdk/client-transcribe')

const client = new TranscribeClient({ region: process.env.AWS_REGION })

const startTranscriptionJob = async (jobName, fileUrl) => {
  try {
    const awsTranscribeParams = {
      TranscriptionJobName: jobName,
      IdentifyLanguage: true,
      MediaFormat: 'mp4',
      Media: {
        MediaFileUri: fileUrl
      }
    }
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
  try {
    const getTranscriptionParams = {
      TranscriptionJobName: transcriptionJobName
    }
    const data = await client.send(new GetTranscriptionJobCommand(getTranscriptionParams))
    const result = {
      originalVideoLink: data.TranscriptionJob.Media.MediaFileUri,
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
