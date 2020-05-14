import React, { Component } from 'react'
import axios from 'axios'

import { toastr } from 'react-redux-toastr'
import List from './confirmarPresencaList'
import If from '../common/operator/if'

export default class Credor extends Component {
    getUrl() {
        return window.Params.URL_API+'credores/?codigoAssembleia='+window.Params.codigoAssembleiaAtiva;
    }  

    constructor(props){
        super(props);

        this.state = { list: [], assembleia: {} }

        this.confirmarPresenca = this.confirmarPresenca.bind(this)

        this.refresh();
        this.refreshAssembleia();
    }

    componentWillUnmount() {
        this.refreshAssembleia = () => {}
    }

    confirmarPresenca(credor, next) {
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
                if(next)
                    next();
                
                toastr.success('Sucesso', 'Presença confirmada.')
            })
        }) 


    }

    confirmarPresencaTodos() {
        this.confirmarPresencaProximo();
    }

    confirmarPresencaProximo() {
        if(!this.state.list[0])
            return;
        
        this.confirmarPresenca(this.state.list[0], () => this.confirmarPresencaProximo());
    }

    refresh(description) {
        let search = description ? `&nome__regex=/${description}/` : ''

        search += '&confirmouPresenca__ne=true'

        let usuario = JSON.parse(localStorage.getItem('_application_user'));
        if(usuario.tipo !== 1){
            search += '&codigoProcurador='+usuario.codigoCredor
        }

        axios.get(`${this.getUrl()}&sort=-_id${search}`)
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
        if(!this.state.assembleia.inicioConfPres)
            return;

        let data = new Date(Date.parse(this.state.assembleia.inicioConfPres.substr(0,19)));
        
        return data.toLocaleString('pt-BR', {timeStyle:'medium'})
    }

    podeConfirmarjaConfirmouTudo() {
        return this.state.assembleia.podeConfirmar && this.state.list && this.state.list.length === 0
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
                
                <button className='btn btn-success' disabled={!this.state.assembleia.podeConfirmar} onClick={() => this.confirmarPresencaTodos()}>Confirmar todos</button>
                <br />
                <If test={!this.state.assembleia.podeConfirmar && !this.state.assembleia.podeVotar}>
                    <center style={{color:'rgb(4, 156, 245)'}}><h3>Previsão de inicio da confirmação de presença {this.getHoraInicio()}</h3></center>
                </If>
                <If test={!this.podeConfirmarjaConfirmouTudo() && !this.state.assembleia.podeVotar}>
                    <center style={{color:'rgb(4, 156, 245)'}}><h3>Você possui estes credores abaixo vinculados em seu nome. Caso discorde, favor contatar a Administração Judicial em um dos contatos enviados pelo e-mail</h3></center>
                </If>

                <If test={this.podeConfirmarjaConfirmouTudo()}>
                    <center style={{color:'rgb(4, 156, 245)'}}><h3>Você já confirmou sua presença. Aguarde o início da AGC</h3></center>
                </If>

                <If test={this.state.assembleia.podeVotar}>
                    <center style={{color:'rgb(4, 156, 245)'}}><h3>A votação já iniciou! Vote na aba 'Votar' ou acompanhe os votos na aba 'Votação em tempo real'</h3></center>
                </If>

                <List 
                    list={this.state.list}
                    assembleia={this.state.assembleia}
                    confirmarPresenca={this.confirmarPresenca}/>
            </div>
        );
    }
}