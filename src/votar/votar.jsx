
import React, { Component } from 'react'
import axios from 'axios'

import { toastr } from 'react-redux-toastr'
import List from './votarList'
import Loading from '../common/components/Loading'
import If from '../common/operator/if'

import './votar.css'

export default class Credor extends Component {
    getUrl() {
        return window.Params.URL_API+'votos';
    }  

    constructor(props){
        super(props);

        this.state = { list: [], assembleia: {}, loading: false }

        this.votar = this.votar.bind(this)
        this.votarParaTodos = this.votarParaTodos.bind(this)
    }

    componentDidMount() {
        this.refresh();
        this.refreshAssembleia();
    }

    componentWillUnmount() {
        this.refreshAssembleia = () => {}
    }

    votar(todo, opc, next) {
        const { list } = this.state
        const dto = {
            _id: todo._id,
            tipo: opc
        }


        axios.put(`${this.getUrl()}/votar`, dto)
        .then(resp => {
            toastr.success('Sucesso', 'Seu voto foi computado, aguarde o resultado')
            list.find(p => p._id==todo._id).tipo = opc
            this.setState({ list });
            window.socketIo.emit('votou', todo)
            if(next)
                next();
        })
        .catch(e => {
            e.response.data.errors.forEach(error => toastr.error('Erro', error))
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
        this.setState({...this.state, loading: true})
        axios.get(`${this.getUrl()}?codigoAssembleia=${window.Params.codigoAssembleiaAtiva}&sort=-_id${search}`)
            .then(resp => this.setState({...this.state, list: resp.data, loading: false}));
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
                
                <br />
                <If test={!this.state.loading && !this.state.assembleia.podeVotar}>
                    <div className="alert alert-warning" role="alert">
                        <center>Aguarde o início da Assembleia</center>
                    </div>
                </If>
                <If test={!this.state.loading && this.state.assembleia.podeVotar}>
                    <div className="alert info-pergunta" role="alert">
                        <center>{this.state.assembleia.pergunta}</center>
                    </div>
                </If>
                <If test={this.state.loading}>
                    <center><Loading color="#3C8DBC" /></center>
                </If>
                <div style={{float:'right', margin:'5px'}}>
                    <button className='btn btn-success' disabled={!this.state.assembleia.podeVotar} onClick={() => this.votarParaTodos('S')}>Sim para todos</button>
                    <button className='btn btn-danger' disabled={!this.state.assembleia.podeVotar} onClick={() => this.votarParaTodos('N')}>Não para todos</button>
                    <button className='btn btn-warning' disabled={!this.state.assembleia.podeVotar} onClick={() => this.votarParaTodos('A')}>Abstenção para todos</button>
                </div>
                <If test={!this.state.loading}>
                    <List 
                        list={this.state.list}
                        assembleia={this.state.assembleia}
                        votar={this.votar}/>
                </If>
            </div>
        );
    }
}