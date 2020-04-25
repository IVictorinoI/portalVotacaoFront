import React, { Component } from 'react'
import axios from 'axios'

import List from './votarList'

export default class Credor extends Component {
    getUrl() {
        return window.Params.URL_API+'votos';
    }  

    constructor(props){
        super(props);

        this.state = { list: [] }

        this.votar = this.votar.bind(this)
        this.votarParaTodos = this.votarParaTodos.bind(this)

        this.refresh();
    }

    votar(todo, opc) {
        let { list } = this.state

        axios.put(`${this.getUrl()}/${todo._id}`, { ...todo, tipo: opc, sincronizado: false })
        .then(resp => {
            list.find(p => p._id==todo._id).tipo = opc
            this.setState({ list });
        })        
    }

    votarParaTodos(opc){

    }

    refresh(description) {
        let search = description ? `&nomeCredor__regex=/${description}/` : ''

        let usuarioLocalStorage = localStorage.getItem('usuarioLogado');
        let usuario = JSON.parse(usuarioLocalStorage) || {};
        if(usuario.tipo !== 1){
            search += '&codigoProcurador='+usuario.codigoCredor
        }

        axios.get(`${this.getUrl()}?codigoAssembleia=${window.Params.codigoAssembleiaAtiva}&sort=-_id${search}`)
            .then(resp => this.setState({...this.state, list: resp.data}));
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
                <button className='btn btn-success' onClick={() => props.votarParaTodos('S')}>Sim para todos</button>
                <button className='btn btn-danger' onClick={() => props.votarParaTodos('N')}>Não para todos</button>
                <button className='btn btn-warning' onClick={() => props.votarParaTodos('A')}>Abstenção para todos</button>
                <List 
                    list={this.state.list}
                    votar={this.votar}/>
            </div>
        );
    }
}