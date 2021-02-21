import React, { Component } from 'react'
import axios from 'axios'
import If from '../common/operator/if'
import Loading from '../common/components/Loading'
import List from './assembleiaList'

export default class Assembleia extends Component {
    getUrl() {
        return window.Params.URL_API+'assembleias?param=true';
    }

    constructor(props){
        super(props);

        this.state = { list: [], loading: false }
    }

    componentDidMount() {
        this.refresh();
    }

    refresh(description) {
        const search = description ? `&descricao__regex=/${description}/` : ''
        this.setState({...this.state, loading: true})
        axios.get(`${this.getUrl()}&sort=-ativo${search}`)
            .then(resp => this.setState({...this.state, list: resp.data, loading: false}));
    }
    
    render() {
        const keyHandler = (e) => {
            if (e.key === 'Enter') {
                this.refresh(e.target.value);
            }
        }

        return (
            <div className='conteudo-principal-com-rolagem'>
                <If test={this.state.loading}>
                    <center><Loading color="#3C8DBC" /></center>
                </If>
                <If test={!this.state.loading}>
                    <input id='description' className='form-control'
                        onKeyUp={keyHandler}
                        placeholder='Pesquise a assembléia'></input>
                    <List list={this.state.list}/>
                </If>
            </div>
        );
    }
}