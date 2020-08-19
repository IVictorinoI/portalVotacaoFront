import '../common/template/dependencies'
import React, { Component } from 'react'
import axios from 'axios'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import App from './app'
import Auth from '../auth/auth'
import { validateToken } from '../auth/authActions'
import { toastr } from 'react-redux-toastr'

class AuthOrApp extends Component {
    componentWillMount() {
        if (this.props.auth.user) {
            this.props.validateToken(this.props.auth.user.token)
            var user = this.props.auth.user
            window.socketIo = io(window.Params.URL_API)

            window.socketIo.on('getUser', function(){
                window.socketIo.emit('setUser', user)
            })

            window.socketIo.on('derrubar', function(data){
                if(data.id === user.id){
                    alert(data.message);
                    localStorage.removeItem('_application_user')
                    location.reload()
                }
            })

            window.socketIo.on('expulsar', function(data){
                localStorage.removeItem('_application_user')
                window.location.href = "http://www.gladiusconsultoria.com.br/";
            })

            window.socketIo.on('usuarioOnline', function(data){
                if(data.id !== user.id)
                    toastr.success('Online', `${data.nome} acabou de entrar.`)
            })

            window.socketIo.on('confirmacaoPresenca', function(credor){
                if(user.tipo===1)
                    toastr.success('Confirmação', `${credor.nome} acabou confirmar presença.`)
            })

            window.socketIo.on('voto', function(voto){
                if(user.tipo===1)
                    toastr.success('Voto', `${voto.nomeCredor} acabou de votar.`)
            })
        }        
    }
    render() {
        const { user, validToken } = this.props.auth
        if (user && validToken) {
            
            let codigoAssembleiaAtiva = localStorage.getItem('codigoAssembleiaAtiva');
            if(codigoAssembleiaAtiva)
                window.Params.codigoAssembleiaAtiva = codigoAssembleiaAtiva

            axios.defaults.headers.common['authorization'] = user.token

            axios.get(`${window.Params.URL_API}/assembleias/?ativo=true`)
            .then(resp => {
                localStorage.setItem('codigoAssembleiaAtiva', resp.data[0].codigo);
            });

            return <App>{this.props.children}</App>
        } else if (!user && !validToken) {
            return <Auth />
        } else {
            return false
        }
    }
}
const mapStateToProps = state => ({ auth: state.auth })
const mapDispatchToProps = dispatch => bindActionCreators({ validateToken },
    dispatch)
export default connect(mapStateToProps, mapDispatchToProps)(AuthOrApp)
