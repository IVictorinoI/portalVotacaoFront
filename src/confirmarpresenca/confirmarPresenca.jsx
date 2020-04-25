import React, { Component } from 'react'
import axios from 'axios'

import List from './confirmarPresencaList'

export default class Credor extends Component {
    getUrl() {
        return window.Params.URL_API+'credores/?codigoAssembleia='+window.Params.codigoAssembleiaAtiva;
    }  

    constructor(props){
        super(props);

        this.state = { list: [] }

        this.confirmarPresenca = this.confirmarPresenca.bind(this)

        this.refresh();
    }

    confirmarPresenca(credor) {
        var list = this.state.list;
        var idx = list.indexOf(credor)
        var dto = {
            codigo: credor.codigo,
            codigoAssembleia:credor.codigoAssembleia,            
            valor:credor.valor,
            nomeCredor:credor.nome,
            descricaoClasse:credor.descricaoClasse,
            codigoProcurador: credor.codigoProcurador,
            nomeProcurador:credor.nomeProcurador,
            sincronizado:false,
            data:new Date(),
            tipo:'',
        }

        axios.post(`${window.Params.URL_API}/votos`, dto)
        .then(resp => {
            list.splice(idx, 1);
            this.setState({ list });

            axios.put(`${window.Params.URL_API}/credores/${credor._id}`, { ...credor, confirmouPresenca: true })
            .then(resp => {
                this.setState({ list });
            })
        }) 


    }

    confirmarPresencaTodos() {
        
    }

    refresh(description) {
        let search = description ? `&nome__regex=/${description}/` : ''

        search += '&confirmouPresenca__ne=true'

        let usuarioLocalStorage = localStorage.getItem('usuarioLogado');
        let usuario = JSON.parse(usuarioLocalStorage) || {};
        if(usuario.tipo !== 1){
            search += '&codigoProcurador='+usuario.codigoCredor
        }

        axios.get(`${this.getUrl()}&sort=-_id${search}`)
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
                <button className='btn btn-success' onClick={() => props.confirmarPresencaTodos()}>Confirmar todos</button>
                <List 
                    list={this.state.list}
                    confirmarPresenca={this.confirmarPresenca}/>
            </div>
        );
    }
}