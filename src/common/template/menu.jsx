import React from 'react'
import MenuItem from './menuItem'
import MenuTree from './menuTree'

export default props => (
    <ul className='sidebar-menu'>
        <MenuItem path='/' label='Dashboard' icon='dashboard' />
        {/*<MenuItem path='login' label='Login' icon='user' />*/}
        <MenuTree label='Consultas' icon='edit'> 
            {/*<MenuItem path='assembleias' label='Assembléias' icon='usd' />*/}
            {/*<MenuItem path='classes' label='Classes' icon='usd' />*/}
            <MenuItem path='credores' label='Credores' icon='drivers-license-o' />
            <MenuItem path='votos' label='Votos' icon='server' />
            <MenuItem path='online' label='Usuários online' icon='power-off' />
            <MenuItem path='logacesso' label='Logs de acesso' icon='info' />
        </MenuTree>
        <MenuItem path='confirmarPresenca' label='Confirmar presença' icon='check-square' />
        <MenuItem path='votar' label='Votar' icon='legal' />
        <MenuItem path='votacaoTempoReal' label='Votação em tempo real' icon='heartbeat' />
        <MenuItem path='chat' label='Chat' icon='comments' />
    </ul>
)