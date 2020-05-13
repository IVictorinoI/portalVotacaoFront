import React, { Component } from 'react'
import axios from 'axios'
import List from './chatList'

export default class Chat extends Component {
    getUrl() {
        return window.Params.URL_API+'chats/?codigoAssembleia='+window.Params.codigoAssembleiaAtiva;
    }

    constructor(props){
        super(props);

        this.state = { list: [] }

        this.enviarMensagem = this.enviarMensagem.bind(this)
        this.receiveNewMessage = this.receiveNewMessage.bind(this)

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
        axios.get(`${this.getUrl()}&sort=-data`)
            .then(resp => this.setState({...this.state, list: resp.data}));
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
        axios.post(`${this.getUrl()}`, { ...msgDto })
        .then(resp => {
            this.refresh()
            window.socketIo.emit('sendMessage', resp.data)
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
                <input name='message' onKeyUp={keyHandler} className='form-control' placeholder='Digite sua mensagem'></input>
                
                <button className='btn btn-success' onClick={() => this.enviarMensagem()}>Enviar</button>
                <List list={this.state.list}/>
                
            </div>
        );
    }
}