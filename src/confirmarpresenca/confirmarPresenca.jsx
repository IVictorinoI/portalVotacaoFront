import React, { Component } from 'react'
import axios from 'axios'

import { toastr } from 'react-redux-toastr'
import List from './confirmarPresencaList'
import Loading from '../common/components/Loading'
import If from '../common/operator/if'

export default class Credor extends Component {
    getUrl() {
        return window.Params.URL_API+'credores/?codigoAssembleia='+window.Params.codigoAssembleiaAtiva;
    }  

    constructor(props){
        super(props);

        this.state = { list: [], assembleia: {}, loading: false }

        this.confirmarPresenca = this.confirmarPresenca.bind(this)
    }

    componentDidMount() {
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
            _id: credor._id
        }

        axios.post(`${window.Params.URL_API}/votos/confirmar`, dto)
        .then(resp => {
            list.splice(idx, 1);
            this.setState({ list });

            if(next)
                next();
            
            toastr.success('Sucesso', 'Presença confirmada.')
            window.socketIo.emit('confirmouPresenca', credor)
        })
        .catch(e => {
            e.response.data.errors.forEach(error => toastr.error('Erro', error))
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
        this.setState({...this.state, loading: true})
        axios.get(`${this.getUrl()}&sort=-_id${search}`)
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
            <div className='conteudo-principal-com-rolagem'>
                <input id='description' className='form-control'
                    onKeyUp={keyHandler}
                    placeholder='Pesquise o credor'></input>
                
                <If test={!this.state.loading && !this.state.assembleia.podeConfirmar && !this.state.assembleia.podeVotar}>
                    <div className="alert alert-warning" role="alert">
                        <center>Previsão de inicio da confirmação de presença {this.getHoraInicio()}</center>
                    </div>
                </If>
                <If test={!this.state.loading && !this.podeConfirmarjaConfirmouTudo() && !this.state.assembleia.podeVotar}>
                    <div className="alert alert-success" role="alert">
                        <center>Você possui estes credores abaixo vinculados em seu nome. Caso discorde, favor contatar a Administração Judicial em um dos contatos enviados pelo e-mail</center>
                    </div>
                </If>

                <If test={!this.state.loading && this.podeConfirmarjaConfirmouTudo()}>
                    <div className="alert alert-warning" role="alert">
                        <center>Você já confirmou sua presença. Aguarde o início da AGC</center>
                    </div>
                </If>

                <If test={!this.state.loading && this.state.assembleia.podeVotar}>
                    <div className="alert alert-danger" role="alert">
                        <center>A votação já iniciou! Vote na aba 'Votar' ou acompanhe os votos na aba 'Votação em tempo real'</center>
                    </div>
                </If>
                <If test={this.state.loading}>
                    <center><Loading color="#3C8DBC" /></center>
                </If>
                <div style={{float:'right', margin:'5px'}}>
                    <button className='btn btn-success' disabled={!this.state.assembleia.podeConfirmar} onClick={() => this.confirmarPresencaTodos()}>Confirmar todos</button>
                </div>
                <If test={!this.state.loading}>
                    <List 
                        list={this.state.list}
                        assembleia={this.state.assembleia}
                        confirmarPresenca={this.confirmarPresenca}/>
                </If>
            </div>
        );
    }
}