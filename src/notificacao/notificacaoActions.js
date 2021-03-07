import axios from 'axios'

export function getChatNontifications(lastRead) {
    let url = `${window.Params.URL_API}/chats/?codigoAssembleia=${window.Params.codigoAssembleiaAtiva}`
    
    const anoValido = lastRead && (lastRead.indexOf('-')>-1 || lastRead.indexOf('T')>-1 || lastRead.indexOf('2')>-1)

    if(anoValido)
        url = url + `&data__gt=${lastRead}`

    const request = axios.get(`${url}&sort=data&limit=300`)
    return {
        type: 'CHAT_NOTIFY_RECEIVED',
        payload: request
    }
}

export function setChatNotifyRead() {
    return {
        type: 'CHAT_EMPTY_NOTIFY',
        payload: { 
            data: {
                notifyCount: 0, 
                lastRead: localStorage.getItem("_chat_notify_last_read") || "1899-12-30T21:05:19.000Z"
            }            
        }
    }
}