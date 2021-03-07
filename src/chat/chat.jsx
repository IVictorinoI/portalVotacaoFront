import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import axios from 'axios'
import If from '../common/operator/if'
import Loading from '../common/components/Loading'
import List from './chatList'
import Select from 'react-select'
import { toastr } from 'react-redux-toastr'
import { setChatNotifyRead } from '../notificacao/notificacaoActions'

class Chat extends Component {
    getUrl() {
        return window.Params.URL_API+'chats/';
    }

    constructor(props){
        super(props);

        this.state = { list: [], loading: false, sending: false, credores: [], privateMessageTo: {} }

        this.enviarMensagem = this.enviarMensagem.bind(this)
        this.receiveNewMessage = this.receiveNewMessage.bind(this)        
        this.rolar = this.rolar.bind(this)        
        this.setLastReadMessageNotify = this.setLastReadMessageNotify.bind(this)
    }

    componentDidMount() {
        window.socketIo.on('newMessage', this.receiveNewMessage)    

        this.refresh();
        this.refreshCredores();
    }

    componentWillUnmount() {
        this.enviarMensagem = () => {}
        this.receiveNewMessage = () => {}
        this.rolar = () => {}
        this.setLastReadMessageNotify = () => {}
    }

    receiveNewMessage(data) {
        const list = this.state.list;
        list.push(data)
        this.setState({ list });
        this.rolar();
        this.setLastReadMessageNotify() 
    }

    refresh() {
        this.setState({...this.state, loading: true})

        axios.get(`${this.getUrl()}?codigoAssembleia=${window.Params.codigoAssembleiaAtiva}&sort=data&limit=300`)
            .then(resp => {
                const { data } = resp
                this.setState({...this.state, list: data, loading: false})
                this.rolar();

                this.setLastReadMessageNotify()                   
            });

        /*axios.get(`${this.getUrl()}myChats`)
            .then(resp => {
                this.setState({...this.state, list: resp.data, loading: false});
                this.rolar();                
            });*/
    }

    setLastReadMessageNotify() {
        const list = this.state.list

        const lastRead = list.length ? list[list.length-1].data : null
        if(lastRead) {
            localStorage.setItem('_chat_notify_last_read', lastRead)
            this.props.setChatNotifyRead()
        }   
    }

    refreshCredores() {
        /*this.setState({...this.state, loading: true})
        axios.get(`${window.Params.URL_API}usuarios/chat`)
            .then(resp => this.setState({...this.state, credores: resp.data}));*/
    }
    
    enviarMensagem() {
        const usuario = JSON.parse(localStorage.getItem('_application_user'))
        const input = $('[name=message]')[0]
        const msg = $('[name=message]')[0].value
        const privateMessageTo = this.state.privateMessageTo
        const msgDto = {
            codigoAssembleia: window.Params.codigoAssembleiaAtiva,
            codigoCredor: usuario.codigoCredor,
            msg: msg,
            nomeCredor: usuario.nome,
            idUsuario: usuario.id,
            privateMessageTo: privateMessageTo,
            codigoCredorDest: privateMessageTo ? privateMessageTo.codigo : null
        }

        if(!msgDto.msg)
            return;

        input.value = '';
        input.focus()
        this.setState({...this.state, sending: true})        

        axios.post(`${this.getUrl()}`, { ...msgDto })
        .then(resp => {
            this.setState({...this.state, sending: false})
            window.socketIo.emit('sendMessage', resp.data)
            this.rolar();
        })
        .catch(e => {
            e.response.data.errors.forEach(error => toastr.error('Erro', error))
            this.setState({...this.state, sending: false})
        })
    }

    rolar() {
        var div = document.getElementById("conteudoPrincipalRolagem");

        div.scrollTop = div.scrollHeight;
    }

    render() {
        const keyHandler = (e) => {
            if (e.key === 'Enter') {
                this.enviarMensagem();
            }
        }

        return (
            <div className="container-b">
                <If test={this.state.loading}>
                    <center><Loading color="#3C8DBC" /></center>
                </If>
                <If test={!this.state.loading}>
                    <div className="container-a">
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
                        <div className='conteudo-principal-com-rolagem' id="conteudoPrincipalRolagem">
                            <List list={this.state.list}/>
                        </div>
                        <div className="container">
                            <div className="row chatinputdiv">
                                <div className="col-md-6">
                                    <input name='message' onKeyUp={keyHandler} className='chatinputbox' autoComplete="off" placeholder='Digite sua mensagem'></input>
                                </div>
                                {/*<div className="col-md-3">
                                <Select 
                                    placeholder='Enviar para todos'
                                    readOnly={false} 
                                    getOptionLabel={(option)=> option['nome'] }
                                    getOptionValue={(option)=> option._id ? option._id : option.value }
                                    onChange={value => this.setState({...this.state, privateMessageTo: value})} 
                                    //onBlur={() => this.setState({...this.state, privateMessageTo: value})} 
                                    menuPlacement = 'top'
                                    options={this.state.credores}
                                />
                                </div>*/}
                                <div className="col-md-1">
                                    <button className='btn btn-success' onClick={() => this.enviarMensagem()}>Enviar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </If>
            </div>
        );
    }
}

const mapStateToProps = state => ({ notify: state.notificacao.notify })
const mapDispatchToProps = dispatch => bindActionCreators({setChatNotifyRead}, dispatch)
export default connect(mapStateToProps, mapDispatchToProps)(Chat)