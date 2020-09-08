const userKey = '_application_user'
const INITIAL_STATE = {
    user: JSON.parse(localStorage.getItem(userKey)),
    validToken: false
} 

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'TOKEN_VALIDATED':
            if (action.payload) {
                return { ...state, validToken: true }
            } else {
                localStorage.removeItem(userKey)
                window.location.reload()
                return { ...state, validToken: false, user: null }
            }
        case 'USER_FETCHED':
            localStorage.setItem(userKey, JSON.stringify(action.payload))
            window.socketIo.emit('setUser', action.payload)
            if(action.payload.codigoAssembleia)
                window.Params.codigoAssembleiaAtiva = action.payload.codigoAssembleia
            return { ...state, user: action.payload, validToken: true }
        default:
            return state
    }
}
