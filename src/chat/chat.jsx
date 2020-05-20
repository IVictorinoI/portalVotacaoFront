import React, { Component } from 'react'
import axios from 'axios'
import If from '../common/operator/if'
import Loading from '../common/components/Loading'
import List from './chatList'

export default class Chat extends Component {
    getUrl() {
        return window.Params.URL_API+'chats/?codigoAssembleia='+window.Params.codigoAssembleiaAtiva;
    }

    constructor(props){
        super(props);

        this.state = { list: [], loading: false, sending: false }

        this.enviarMensagem = this.enviarMensagem.bind(this)
        this.receiveNewMessage = this.receiveNewMessage.bind(this)        
    }

    componentDidMount() {
        window.socketIo.on('newMessage', this.receiveNewMessage)    

        this.refresh();
    }

    componentWillUnmount() {
        this.enviarMensagem = () => {}
        this.receiveNewMessage = () => {}
    }

    receiveNewMessage(data) {
        const list = this.state.list;
        list.unshift(data)
        this.setState({ list });
    }

    refresh() {
        this.setState({...this.state, loading: true})
        axios.get(`${this.getUrl()}&sort=-data&limit=300`)
            .then(resp => this.setState({...this.state, list: resp.data, loading: false}));
    }
    
    enviarMensagem() {
        const usuario = JSON.parse(localStorage.getItem('_application_user'))
        const input = $('[name=message]')[0];
        const msg = $('[name=message]')[0].value
        const msgDto = {
            codigoAssembleia: window.Params.codigoAssembleiaAtiva,
            codigoCredor: usuario.codigoCredor,
            msg: msg,
            nomeCredor: usuario.nome,
            idUsuario: usuario.id
        }
        input.value = '';
        input.focus()
        this.setState({...this.state, sending: true})
        axios.post(`${this.getUrl()}`, { ...msgDto })
        .then(resp => {
            this.setState({...this.state, sending: false})
            window.socketIo.emit('sendMessage', resp.data)
        })
        .catch(e => {
            e.response.data.errors.forEach(error => toastr.error('Erro', error))
        })
    }

    render() {
        const keyHandler = (e) => {
            if (e.key === 'Enter') {
                this.enviarMensagem();
            }
        }

        return (
            <div>
                <If test={this.state.loading}>
                    <center><Loading color="#3C8DBC" /></center>
                </If>
                <If test={!this.state.loading}>
                    <div>
                        <input name='message' onKeyUp={keyHandler} className='form-control' autoComplete="off" placeholder='Digite sua mensagem'></input>
                        <button className='btn btn-success' onClick={() => this.enviarMensagem()}>Enviar</button>
                        <If test={this.state.sending}>
                            <div className="chatdiv">
                                <div className="response">
                                    <div> 
                                        <strong>Enviando...</strong> 
                                        <p>Enviando...</p>
                                    </div>
                                </div>
                            </div>
                        </If>                        
                        <List list={this.state.list}/>
                    </div>
                </If>
            </div>
        );
    }
}