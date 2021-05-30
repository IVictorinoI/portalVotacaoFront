import axios from 'axios'

export function register() {
    let url = `${window.Params.URL_API}/logsAcessos/register`
    
    const request = axios.post(`${url}`)
}