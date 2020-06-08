import React, { Component } from 'react'
import axios from 'axios'
import If from '../common/operator/if'
import Loading from '../common/components/Loading'
import List from './credorList'

export default class Credor extends Component {
    getUrl() {
        return window.Params.URL_API+'credores/?codigoAssembleia='+window.Params.codigoAssembleiaAtiva;
    }

    getVotosUrl() {
        return window.Params.URL_API+'votos/?codigoAssembleia='+window.Params.codigoAssembleiaAtiva;
    }

    constructor(props){
        super(props);

        this.connectedUsers = this.connectedUsers.bind(this)
        this.marcaOnlines = this.marcaOnlines.bind(this)

        this.state = { 
            listTrabalhista: [], 
            listQuirografario: [], 
            listGarantiaReal: [], 
            listMeEpp: [], 
            listVotos: [],
            listConnectedUsers: [],
            loading: false }

    }

    componentDidMount() {
        this.refresh();

        window.socketIo.on('connectedUsers', this.connectedUsers)   

        setTimeout(function(){
            window.socketIo.emit('getConnectedUsers')        
        }, 500);        
    }

    connectedUsers(data) {
        this.setState({ listConnectedUsers: data});

        this.marcaOnlines();
    }

    refresh(description) {
        const search = description ? `&nome__regex=/${description}/` : ''
        this.setState({...this.state, loading: true})
        axios.get(`${this.getUrl()}&sort=-_id${search}`)
            .then(resp => {
                let listTrabalhista = resp.data.filter(p => p.codigoClasse==1);                
                let listGarantiaReal = resp.data.filter(p => p.codigoClasse==2);
                let listQuirografario = resp.data.filter(p => p.codigoClasse==3);
                let listMeEpp = resp.data.filter(p => p.codigoClasse==4);
                this.setState({...this.state, listTrabalhista, listQuirografario, listGarantiaReal, listMeEpp, loading: false})

                this.verificaVotos(description);
            });
    }

    verificaVotos(description) {
        const search = description ? `&nomeCredor__regex=/${description}/` : ''
        //this.setState({...this.state, loading: true})
        axios.get(`${this.getVotosUrl()}&sort=-_id${search}`)
            .then(resp => {
                let listVotos = resp.data;
                this.setState({...this.state, listVotos})

                this.marcaVotantesEConfirmados();
            });
    }

    marcaVotantesEConfirmados() {
        const setaVotouConfirmou = (credor) => {
            credor.confirmou = this.confirmou(credor)
            credor.votou = this.votou(credor)
        }

        let {listTrabalhista, listQuirografario, listGarantiaReal, listMeEpp} = this.state

        listTrabalhista.forEach(p => setaVotouConfirmou(p));
        listQuirografario.forEach(p => setaVotouConfirmou(p));
        listGarantiaReal.forEach(p => setaVotouConfirmou(p));
        listMeEpp.forEach(p => setaVotouConfirmou(p));
        
        this.setState({...this.state, listTrabalhista, listQuirografario, listGarantiaReal, listMeEpp})
    }

    confirmou(credor) {
        return !!this.state.listVotos.find(p => p.codigo===credor.codigo);
    }

    votou(credor) {
        return !!this.state.listVotos.find(p => p.codigo===credor.codigo && p.tipo!=="");
    }

    marcaOnlines() {
        const setaOnline = (credor) => {
            credor.online = this.online(credor)
        }

        let {listTrabalhista, listQuirografario, listGarantiaReal, listMeEpp} = this.state

        listTrabalhista.forEach(p => setaOnline(p));
        listQuirografario.forEach(p => setaOnline(p));
        listGarantiaReal.forEach(p => setaOnline(p));
        listMeEpp.forEach(p => setaOnline(p));
        
        this.setState({...this.state, listTrabalhista, listQuirografario, listGarantiaReal, listMeEpp})
    }

    online(credor){
        return !!this.state.listConnectedUsers.find(p => p.codigoCredor===credor.codigo);
    }
    
    render() {
        const keyHandler = (e) => {
            if (e.key === 'Enter') {
                this.refresh(e.target.value);
            }
        }

        return (
            <div>
                <If test={this.state.loading}>
                    <center><Loading color="#3C8DBC" /></center>
                </If>
                <If test={!this.state.loading}>
                    <div>
                        <input id='description' className='form-control'
                            onKeyUp={keyHandler}
                            placeholder='Pesquise o credor'></input>
                        
                        <If test={this.state.listTrabalhista.length}>
                            <div>
                                <h1>Trabalhistas</h1>
                                <List style={({ marginButton: '5.5rem' })} list={this.state.listTrabalhista}/>
                            </div>
                        </If>
                        

                        <If test={this.state.listGarantiaReal.length}>
                            <div>
                                <h1>Garantia real</h1>
                                <List style={({ marginButton: '5.5rem' })} list={this.state.listGarantiaReal}/>
                            </div>
                        </If>


                        <If test={this.state.listQuirografario.length}>
                            <div>
                                <h1>Quirografários</h1>
                                <List style={({ marginButton: '5.5rem' })} list={this.state.listQuirografario}/>                        
                            </div>
                        </If>

                        <If test={this.state.listMeEpp.length}>
                            <div>
                                <h1>Me/Epp Microempresa e empresa de pequeno porte</h1>
                                <List style={({ marginButton: '5.5rem' })} list={this.state.listMeEpp}/>
                            </div>
                        </If>
                    </div>
                </If>
            </div>
        );
    }
}