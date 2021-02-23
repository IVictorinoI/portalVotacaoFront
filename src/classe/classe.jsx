import React, { Component } from 'react'
import axios from 'axios'
import If from '../common/operator/if'
import Loading from '../common/components/Loading'
import List from './classeList'

export default class Classe extends Component {
    getUrl() {
        return window.Params.URL_API+'classes';
    }

    constructor(props){
        super(props);

        this.state = { list: [], loading: false }
    }

    componentDidMount() {
        this.refresh();
    }

    refresh() {
        this.setState({...this.state, loading: true})
        axios.get(`${this.getUrl()}?sort=-_id`)
            .then(resp => this.setState({...this.state, list: resp.data, loading: false}));
    }
    
    render() {
        return (
            <div className='conteudo-principal-com-rolagem'>
                <If test={this.state.loading}>
                    <center><Loading color="#3C8DBC" /></center>
                </If>
                <List list={this.state.list}/>
            </div>
        );
    }
}