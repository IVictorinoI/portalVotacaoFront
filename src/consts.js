const backendUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://gladius-portalvotacao-back.herokuapp.com'

export default {
    API_URL: `${backendUrl}/api`,
    OAPI_URL: `${backendUrl}/oapi`
}
