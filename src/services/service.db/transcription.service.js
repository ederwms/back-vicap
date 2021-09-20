const db = require('./_access')

const getAllTranscriptionJobs = async () => {
  try {
    const result = await db.query(
      `
        SELECT
          job_name as "jobName",
          original_video_link as "originalVideoLink",
          subtitled_video_link as "subtitledVideoLink",
          is_job_finished as "isJobFinished",
          subtitles_json as "subtitlesJson"
        FROM transcription_jobs;
      `
    )

    return result
  } catch(error) {
    throw error
  }
}

const getTranscriptionJobByName = async (name) => {
  const result = await db.queryFirstOrDefault(
    `
      SELECT
        job_name as "jobName",
        original_video_link as "originalVideoLink",
        subtitled_video_link as "subtitledVideoLink",
        is_job_finished as "isJobFinished",
        subtitles_json as "subtitlesJson"
      FROM transcription_jobs
      WHERE job_name = $1;
    `,
    [name]
  )

  return result
}

const createTranscriptionJob = async ({ jobName, originalVideoLink }) => {
  const result = await db.insertOrUpdate(
    `
      INSERT INTO transcription_jobs
        (job_name, original_video_link, subtitled_video_link, is_job_finished, subtitles_json)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING *;
    `,
    [jobName, originalVideoLink, null, false, null]
  )

  return result
}

const editTranscriptionJob = async ({ jobName, subtitledVideoLink, isJobFinished, subtitlesJson }) => {
  const result = await db.insertOrUpdate(
    `
      UPDATE transcription_jobs SET
        subtitled_video_link = $2,
        is_job_finished = $3,
        subtitles_json = $4
      WHERE job_name = $1
      RETURNING *
    `,
    [jobName, subtitledVideoLink, isJobFinished, subtitlesJson]
  )

  return result
}

module.exports = {
  getTranscriptionJobByName,
  getAllTranscriptionJobs,
  createTranscriptionJob,
  editTranscriptionJob
}
