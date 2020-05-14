import React, { Component } from 'react'
import axios from 'axios'

import List from './logAcessoList'

export default class LogAcesso extends Component {
    getUrl() {
        return window.Params.URL_API+'logsAcessos';
    }

    constructor(props){
        super(props);

        this.state = { list: [] }

        this.refresh();
    }

    refresh() {
        axios.get(`${this.getUrl()}?sort=-data`)
            .then(resp => this.setState({...this.state, list: resp.data}));
    }
    
    render() {
        return (
            <div>
                <List list={this.state.list}/>
            </div>
        );
    }
}