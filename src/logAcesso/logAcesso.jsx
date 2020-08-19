import React, { Component } from 'react'
import axios from 'axios'
import Loading from '../common/components/Loading'
import If from '../common/operator/if'
import List from './logAcessoList'

export default class LogAcesso extends Component {
    getUrl() {
        return window.Params.URL_API+'logsAcessos';
    }

    constructor(props){
        super(props);

        this.state = { list: [], loading: false }

    }

    expulsarTodos(opc){
        window.socketIo.emit('expulsarTodos')
    }

    componentDidMount() {
        this.refresh();
    }

    refresh() {
        this.setState({...this.state, loading: true})
        axios.get(`${this.getUrl()}?codigoAssembleia=${window.Params.codigoAssembleiaAtiva}&sort=-data&limit=300`)
            .then(resp => this.setState({...this.state, list: resp.data, loading: false}));
    }
    
    render() {
        return (
            <div>
                <button className='btn btn-danger' onClick={() => this.expulsarTodos()}>Expulsar todos</button>
                <If test={this.state.loading}>
                    <center><Loading color="#3C8DBC" /></center>
                </If>                
                <If test={!this.state.loading}>
                    <List list={this.state.list}/>
                </If>
            </div>
        );
    }
}