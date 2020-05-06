import React, { Component } from 'react'
import axios from 'axios'

import List from './votarList'
import If from '../common/operator/if'

export default class Credor extends Component {
    getUrl() {
        return window.Params.URL_API+'votos';
    }  

    constructor(props){
        super(props);

        this.state = { list: [], assembleia: {} }

        this.votar = this.votar.bind(this)
        this.votarParaTodos = this.votarParaTodos.bind(this)

        this.refresh();
        this.refreshAssembleia();
    }

    componentWillUnmount() {
        this.refreshAssembleia = () => {}
    }

    votar(todo, opc, next) {
        let { list } = this.state

        axios.put(`${this.getUrl()}/${todo._id}`, { ...todo, tipo: opc, sincronizado: false })
        .then(resp => {
            list.find(p => p._id==todo._id).tipo = opc
            this.setState({ list });
            if(next)
                next();
        })        
    }

    votarParaTodos(opc){
        this.votarProximo(opc);
    }
    votarProximo(opc) {
        let pendentes = this.state.list.filter((voto) => !voto.tipo)
        if(!pendentes[0])
            return;
        
        this.votar(pendentes[0], opc, () => this.votarProximo(opc));
    }

    refresh(description) {
        let search = description ? `&nomeCredor__regex=/${description}/` : ''

        let usuario = JSON.parse(localStorage.getItem('_application_user'));
        if(usuario.tipo !== 1){
            search += '&codigoProcurador='+usuario.codigoCredor
        }

        axios.get(`${this.getUrl()}?codigoAssembleia=${window.Params.codigoAssembleiaAtiva}&sort=-_id${search}`)
            .then(resp => this.setState({...this.state, list: resp.data}));
    }

    refreshAssembleia(){
        axios.get(window.Params.URL_API+'assembleias/?codigo='+window.Params.codigoAssembleiaAtiva)
            .then(resp => {
                this.setState({...this.state, assembleia: resp.data[0]})

                setTimeout(() => this.refreshAssembleia(), 5000);
            })
    }

    getHoraInicio() {
        if(!this.state.assembleia.inicioVotacao)
            return;

        let data = new Date(Date.parse(this.state.assembleia.inicioVotacao.substr(0,19)));
        
        return data.toLocaleString('pt-BR', {timeStyle:'medium'})
    }
    
    render() {
        const keyHandler = (e) => {
            if (e.key === 'Enter') {
                this.refresh(e.target.value);
            }
        }

        return (
            <div>
                <input id='description' className='form-control'
                    onKeyUp={keyHandler}
                    placeholder='Pesquise o credor'></input>
                <button className='btn btn-success' disabled={!this.state.assembleia.podeVotar} onClick={() => this.votarParaTodos('S')}>Sim para todos</button>
                <button className='btn btn-danger' disabled={!this.state.assembleia.podeVotar} onClick={() => this.votarParaTodos('N')}>Não para todos</button>
                <button className='btn btn-warning' disabled={!this.state.assembleia.podeVotar} onClick={() => this.votarParaTodos('A')}>Abstenção para todos</button>
                <br />
                <If test={!this.state.assembleia.podeVotar}>
                    <center style={{color:'rgb(4, 156, 245)'}}><h3>Previsão de inicio da votação {this.getHoraInicio()}</h3></center>
                </If>
                <List 
                    list={this.state.list}
                    assembleia={this.state.assembleia}
                    votar={this.votar}/>
            </div>
        );
    }
}