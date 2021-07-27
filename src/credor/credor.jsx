import React, { Component } from 'react'
import axios from 'axios'
import If from '../common/operator/if'
import Loading from '../common/components/Loading'
import List from './credorList'
import Content from '../common/template/content'
import Row from  '../common/layout/row'
import Grid from '../common/layout/grid'

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
            loading: false,
            descricaoTrabalhista: "Trabalhistas",
            descricaoQuirografario: "Quirografários",
            descricaoGarantiaReal: "Garantia real",
            descricaoMeEpp: "Me/Epp Microempresa e empresa de pequeno porte",
        }

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

    sortCredores(a, b) {
        if (a.nome.toLowerCase() > b.nome.toLowerCase()) {
          return 1;
        }
        if (a.nome.toLowerCase() < b.nome.toLowerCase()) {
          return -1;
        }
        return 0;
    }

    refresh(description) {
        const search = description ? `&nome__regex=/${description}/` : ''
        this.setState({...this.state, loading: true})
        axios.get(`${this.getUrl()}&sort=-_id${search}`)
            .then(resp => {
                let listTrabalhista = resp.data.filter(p => p.codigoClasse==1).sort(this.sortCredores);                
                let listGarantiaReal = resp.data.filter(p => p.codigoClasse==2).sort(this.sortCredores);
                let listQuirografario = resp.data.filter(p => p.codigoClasse==3).sort(this.sortCredores);
                let listMeEpp = resp.data.filter(p => p.codigoClasse==4);
                let descricaoTrabalhista = listTrabalhista[0] ? listTrabalhista[0].descricaoClasse : this.state.descricaoTrabalhista;
                let descricaoGarantiaReal = listGarantiaReal[0] ? listGarantiaReal[0].descricaoClasse : this.state.descricaoGarantiaReal;
                let descricaoQuirografario = listQuirografario[0] ? listQuirografario[0].descricaoClasse : this.state.descricaoQuirografario;
                let descricaoMeEpp = listMeEpp[0] ? listMeEpp[0].descricaoClasse : this.state.descricaoMeEpp;
                this.setState({
                    ...this.state, 
                    listTrabalhista, 
                    listQuirografario, 
                    listGarantiaReal, 
                    listMeEpp, 
                    descricaoTrabalhista,
                    descricaoGarantiaReal,
                    descricaoQuirografario,
                    descricaoMeEpp,
                    loading: false
                })

                this.verificaVotos(description);
                this.verificaProcuradores();
            });
    }

    verificaProcuradores() {
        const setaProcuradorVazio = (credor) => {
            if(credor.nome == credor.nomeProcurador)
                credor.nomeProcurador=''
        }

        let {listTrabalhista, listQuirografario, listGarantiaReal, listMeEpp} = this.state

        listTrabalhista.forEach(p => setaProcuradorVazio(p));
        listQuirografario.forEach(p => setaProcuradorVazio(p));
        listGarantiaReal.forEach(p => setaProcuradorVazio(p));
        listMeEpp.forEach(p => setaProcuradorVazio(p));
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
            <div className='conteudo-principal-com-rolagem'>
                <Content>
                <If test={this.state.loading}>
                    <center><Loading color="#3C8DBC" /></center>
                </If>
                <If test={!this.state.loading}>
                    <div>
                            <Row>
                                <Grid cols="12">                
                                <div className="box box-primary">
                                    <div className="box-header with-border">
                                        <h3 className="box-title">Pesquisa</h3>

                                        <div className="box-tools pull-right">
                                            <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i></button>
                                        </div>
                                    </div>
                                    <div className="box-body chart-responsive">
                                    <input id='description' className='form-control'
                                        onKeyUp={keyHandler}
                                        placeholder='Pesquise o credor'></input>
                                    </div>
                                </div> 
                                </Grid>                       
                            </Row>                            
                        
                        <If test={this.state.listTrabalhista.length}>
                            <Row>
                                <Grid cols="12">                
                                <div className="box box-primary">
                                    <div className="box-header with-border">
                                        <h3 className="box-title">{this.state.descricaoTrabalhista}</h3>

                                        <div className="box-tools pull-right">
                                            <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i></button>
                                        </div>
                                    </div>
                                    <div className="box-body chart-responsive">
                                    <List style={({ marginButton: '5.5rem' })} list={this.state.listTrabalhista}/>
                                    </div>
                                </div> 
                                </Grid>                       
                            </Row>
                        </If>
                        

                        <If test={this.state.listGarantiaReal.length}>
                            <Row>
                                <Grid cols="12">                
                                <div className="box box-primary">
                                    <div className="box-header with-border">
                                        <h3 className="box-title">{this.state.descricaoGarantiaReal}</h3>

                                        <div className="box-tools pull-right">
                                            <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i></button>
                                        </div>
                                    </div>
                                    <div className="box-body chart-responsive">
                                    <List style={({ marginButton: '5.5rem' })} list={this.state.listGarantiaReal}/>
                                    </div>
                                </div> 
                                </Grid>                       
                            </Row>                            
                        </If>


                        <If test={this.state.listQuirografario.length}>
                            <Row>
                                <Grid cols="12">                
                                <div className="box box-primary">
                                    <div className="box-header with-border">
                                        <h3 className="box-title">{this.state.descricaoQuirografario}</h3>

                                        <div className="box-tools pull-right">
                                            <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i></button>
                                        </div>
                                    </div>
                                    <div className="box-body chart-responsive">
                                    <List style={({ marginButton: '5.5rem' })} list={this.state.listQuirografario}/>
                                    </div>
                                </div> 
                                </Grid>                       
                            </Row>                              
                        </If>

                        <If test={this.state.listMeEpp.length}>
                            <Row>
                                <Grid cols="12">                
                                <div className="box box-primary">
                                    <div className="box-header with-border">
                                        <h3 className="box-title">{this.state.descricaoMeEpp}</h3>

                                        <div className="box-tools pull-right">
                                            <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i></button>
                                        </div>
                                    </div>
                                    <div className="box-body chart-responsive">
                                    <List style={({ marginButton: '5.5rem' })} list={this.state.listMeEpp}/>
                                    </div>
                                </div> 
                                </Grid>                       
                            </Row>                               
                        </If>
                    </div>
                </If>
                </Content>
            </div>
        );
    }
}