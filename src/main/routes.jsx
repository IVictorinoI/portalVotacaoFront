import React from 'react'
import { Router, Route, IndexRoute, Redirect, hashHistory } from 'react-router'

import AuthOrApp from './authOrApp'
import App from './app'
import Dashboard from '../dashboard/dashboard'
import Assembleia from '../assembleia/assembleia'
import Classe from '../classe/classe'
import Credor from '../credor/credor'
import ConfirmarPresenca from '../confirmarpresenca/confirmarPresenca'
import VotacaoTempoReal from '../votacaotemporeal/votacaoTempoReal'
import Voto from '../voto/voto'
import Votar from '../votar/votar'
import Login from '../login/login'
import Chat from '../chat/chat'
import Online from '../onlines/online'

export default props => (
    <Router history={hashHistory}>
        <Route path='/' component={AuthOrApp}>
            <IndexRoute component={Dashboard} />
            <Route path='assembleias' component={Assembleia} />
            <Route path='classes' component={Classe} />
            <Route path='credores' component={Credor} />
            <Route path='votos' component={Voto} />
            <Route path='confirmarPresenca' component={ConfirmarPresenca} />
            <Route path='votar' component={Votar} />
            <Route path='login' component={Login} />
            <Route path='votacaoTempoReal' component={VotacaoTempoReal} />
            <Route path='chat' component={Chat} />
            <Route path='online' component={Online} />
        </Route>
        <Redirect from='*' to='/' />
    </Router>
)