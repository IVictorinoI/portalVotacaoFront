import React, { Component } from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import MenuItem from './menuItem'
import MenuTree from './menuTree'
import If from '../operator/if'

class Menu extends Component {
    render() {
        const { tipo } = this.props.user
        const isTipoUsuarioGladius = tipo === 1;
        return (
            <ul className='sidebar-menu'>
                <MenuItem path='/' label='Início' icon='home' />
                {/*<MenuItem path='login' label='Login' icon='user' />*/}
                <MenuTree label='Consultas' icon='edit'> 
                    {/*<MenuItem path='assembleias' label='Assembléias' icon='usd' />*/}
                    {/*<MenuItem path='classes' label='Classes' icon='usd' />*/}
                    <MenuItem path='credores' label='Credores' icon='drivers-license-o' />
                    <MenuItem path='votos' label='Votos' icon='server' />
                    <If test={isTipoUsuarioGladius}>
                        <MenuItem path='online' label='Usuários online' icon='power-off' />
                    </If>
                    <If test={isTipoUsuarioGladius}>
                        <MenuItem path='logacesso' label='Logs de acesso' icon='info' />                        
                    </If>
                    <If test={isTipoUsuarioGladius}>
                        <MenuItem path='notificacoes' label='Notificações' icon='envelope' />
                    </If>
                    <If test={isTipoUsuarioGladius}>
                        <MenuItem path='links' label='Links' icon='external-link' />
                    </If>
                    
                </MenuTree>
                <MenuItem path='confirmarPresenca' label='Confirmar presença' icon='check-square' />
                <MenuItem path='votar' label='Votar' icon='legal' />
                <MenuItem path='votacaoTempoReal' label='Votação em tempo real' icon='heartbeat' />
                <MenuItem path='resultado' label='resultado' icon='line-chart' />
                <MenuItem path='chat' label='Chat' icon='comments' notifyCount={this.props.notify.notifyCount} />
                <MenuItem path='aprovaAta' label='Aprovação Ata' icon='legal' />
                <MenuItem path='contato' label='Contato' icon='phone' />
                <MenuItem path='links-uteis' label='Links úteis' icon='external-link' />
            </ul>
        )
    }
}

const mapStateToProps = state => ({ user: state.auth.user, notify: state.notificacao.notify })
export default connect(mapStateToProps)(Menu)