import axios from 'axios'


export function getSummary() {
    const request = axios.get(`${window.Params.URL_API}/votos/dashboard`)
    return {
        type: 'DASHBOARD_ATUALIZADO',
        payload: request
    }
}

export function getAssembleiaAtiva() {
    const request = axios.get(`${window.Params.URL_API}/assembleias/?ativo=true`)
    return {
        type: 'ASSEMBLEIA_ATIVA_ATUALIZADA',
        payload: request
    }
}