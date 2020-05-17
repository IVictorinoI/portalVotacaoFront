import React, { Component } from 'react'
import axios from 'axios'

import If from '../common/operator/if'
import List from './votoList'
import Loading from '../common/components/Loading'
import './voto.css'

export default class Voto extends Component {
    getUrl() {
        return window.Params.URL_API+'votos/?codigoAssembleia='+window.Params.codigoAssembleiaAtiva;
    }

    constructor(props){
        super(props);

        this.state = { list: [], loading: false }        
    }

    componentDidMount() {
        this.refresh();
    }

    refresh(description) {
        let search = description ? `&nomeCredor__regex=/${description}/` : ''
        this.setState({...this.state, loading: true})
        axios.get(`${this.getUrl()}&sort=-ordem${search}`)
            .then(resp => {
                this.setState({...this.state, list: resp.data, loading: false})
            });
    }
    
    render() {
        const keyHandler = (e) => {
            if (e.key === 'Enter') {
                this.refresh(e.target.value);
            }
        }

        return (
            <div>
                <If test={!this.state.loading && !this.state.list.length}>                    
                    <div className='container-msg'><p>Nenhum voto computado até o momento. Aqui você poderá acompanhar os votos de todos os credores</p></div>                    
                </If>
                <If test={this.state.loading}>
                    <center><Loading color="#3C8DBC" /></center>
                </If>
                <If test={this.state.list.length}>
                    <div>
                        <input id='description' className='form-control'
                            onKeyUp={keyHandler}
                            placeholder='Pesquise o credor'></input>
                        <List list={this.state.list}/>
                    </div>
                </If>
            </div>
        );
    }
}