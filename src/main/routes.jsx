import React from 'react'
import { Router, Route, IndexRoute, Redirect, hashHistory } from 'react-router'

import App from './app'
import Dashboard from '../dashboard/dashboard'
import Assembleia from '../assembleia/assembleia'
import Classe from '../classe/classe'
import Credor from '../credor/credor'
import ConfirmarPresenca from '../confirmarpresenca/confirmarPresenca'
import Voto from '../voto/voto'
import Votar from '../votar/votar'
import Login from '../login/login'

export default props => (
    <Router history={hashHistory}>
        <Route path='/' component={App}>
            <IndexRoute component={Dashboard} />
            <Route path='assembleias' component={Assembleia} />
            <Route path='classes' component={Classe} />
            <Route path='credores' component={Credor} />
            <Route path='votos' component={Voto} />
            <Route path='confirmarPresenca' component={ConfirmarPresenca} />
            <Route path='votar' component={Votar} />
            <Route path='login' component={Login} />
        </Route>
        <Redirect from='*' to='/' />
    </Router>
)