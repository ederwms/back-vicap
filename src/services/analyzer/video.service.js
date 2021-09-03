const { customAxios } = require('./_access')

const getVideoIndex = async (token) => {
  console.log('[video] Buscando transcrição do vídeo...')

  try {
    const videoId = '40f40e3fbda'

    const response = await customAxios().get(`
      https://api.videoindexer.ai/${process.env.VIDEO_ANALYZER_LOCATION}/Accounts/${process.env.VIDEO_ANALYZER_ACCOUNT_ID}/Videos/${videoId}/Index?accessToken=${token}
    `)

    return response.data.videos[0].insights
  } catch (error) {
    // TODO tratativa de erro
    throw error
  }
}

module.exports = {
  getVideoIndex
}
