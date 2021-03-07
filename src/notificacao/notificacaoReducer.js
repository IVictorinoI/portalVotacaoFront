const INITIAL_STATE = {
    notify: {
        lastRead: localStorage.getItem("_chat_notify_last_read") || "1899-12-30T21:05:19.000Z",
        notifyCount: 0
    }
}

export default function(state = INITIAL_STATE, action) {
    switch (action.type) {
        case 'CHAT_NOTIFY_RECEIVED':
            const { data } = action.payload
            
            const notifyCount = data ? state.notify.notifyCount + data.length : state.notify.notifyCount
            const lastRead = data && data.length ? data[data.length-1].data : state.notify.lastRead

            const notify = { notifyCount, lastRead }
            return { ...state, notify: notify}
        case 'CHAT_EMPTY_NOTIFY': 
            return { ...state, notify: action.payload.data }
        default:
            return state
    }
}