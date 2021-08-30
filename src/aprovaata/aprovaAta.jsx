import React, { Component } from 'react'
import axios from 'axios'
import If from '../common/operator/if'
import Loading from '../common/components/Loading'
import List from './aprovaAtaList'
import Content from '../common/template/content'
import Row from  '../common/layout/row'
import Grid from '../common/layout/grid'
import './aprovaAta.css'
import { toastr } from 'react-redux-toastr'
import BoxResultadoQuant from './boxResultadoQuant'
import VotosAtaList from './votosAtaList'

export default class AprovaAta extends Component {
    getUrl() {
        return window.Params.URL_API+'aprovaAtas/';
    }

    aprovarAta() {
        axios.post(`${this.getUrl()}aprovar`)
        .then(resp => {
            toastr.success('Sucesso', 'Você aprovou a ata')
            window.socketIo.emit('aprovarata')
        })
        .catch(e => {
            e.response.data.errors.forEach(error => toastr.error('Erro', error))
        })
    }

    naoAprovarAta() {
        axios.post(`${this.getUrl()}reprovar`)
        .then(resp => {
            toastr.success('Sucesso', 'Você reprovou a ata')
            window.socketIo.emit('reprovarata')
        })
        .catch(e => {
            e.response.data.errors.forEach(error => toastr.error('Erro', error))
        })
    }

    constructor(props){
        super(props);

        this.state = { 
            assembleia: {},
            dashboard: {},
            listTrabalhista: [], 
            listQuirografario: [], 
            listGarantiaReal: [], 
            listMeEpp: [], 
            loading: false,
            descricaoTrabalhista: "Trabalhistas",
            descricaoQuirografario: "Quirografários",
            descricaoGarantiaReal: "Garantia real",
            descricaoMeEpp: "Me/Epp Microempresa e empresa de pequeno porte",
            nomeSecretario: "",
            nomeEmpresaRecuperanda: "",
            votoSecretario: null,
            votoEmpresaRecuperanda: null,
            quantTrabalhista: 0,
            quantGarantiaReal: 0,
            quantQuirografario: 0,
            quantMeEpp: 0,
            quantConfTrabalhista: 0,
            quantConfGarantiaReal: 0,
            quantConfQuirografario: 0,
            quantConfMeEpp: 0
        }

        window.socketIo.on('reprovouata', () => { this.refresh() })
        window.socketIo.on('aprovouata', () => { this.refresh() })
    }

    componentDidMount() {
        this.refresh();
        this.refreshAssembleia();
        this.refreshDashboard();
    }

    componentWillUnmount() {
        this.refreshAssembleia = () => {}
        this.refreshDashboard = () => {}
    }

    refresh(description) {
        const search = description ? `&nomeCredor__regex=/${description}/` : ''
        this.setState({...this.state, loading: true})
        axios.get(`${this.getUrl()}?codigoAssembleia=${window.Params.codigoAssembleiaAtiva}&sort=-_id${search}`)
            .then(resp => {
                let listTrabalhista = resp.data.filter(p => p.codigoClasse==1);                
                let listGarantiaReal = resp.data.filter(p => p.codigoClasse==2);
                let listQuirografario = resp.data.filter(p => p.codigoClasse==3);
                let listMeEpp = resp.data.filter(p => p.codigoClasse==4);
                let secretario = resp.data.filter(p => p.secretario)[0];
                let empresaRecuperanda = resp.data.filter(p => p.empresaRecuperanda)[0]
                let descricaoTrabalhista = listTrabalhista[0] ? listTrabalhista[0].descricaoClasse : this.state.descricaoTrabalhista;
                let descricaoGarantiaReal = listGarantiaReal[0] ? listGarantiaReal[0].descricaoClasse : this.state.descricaoGarantiaReal;
                let descricaoQuirografario = listQuirografario[0] ? listQuirografario[0].descricaoClasse : this.state.descricaoQuirografario;
                let descricaoMeEpp = listMeEpp[0] ? listMeEpp[0].descricaoClasse : this.state.descricaoMeEpp;
                let quantTrabalhista = listTrabalhista.filter(p => p.aprovou).length;
                let quantGarantiaReal = listGarantiaReal.filter(p => p.aprovou).length;
                let quantQuirografario = listQuirografario.filter(p => p.aprovou).length;
                let quantMeEpp = listMeEpp.length;
                let nomeSecretario = secretario ? secretario.nomeCredor : ''
                let votoSecretario = secretario ? secretario.aprovou : null
                let nomeEmpresaRecuperanda = empresaRecuperanda ? empresaRecuperanda.nomeCredor : ''                
                let votoEmpresaRecuperanda = empresaRecuperanda ? empresaRecuperanda.aprovou : null
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
                    quantTrabalhista,
                    quantGarantiaReal,
                    quantQuirografario,
                    quantMeEpp,                    
                    nomeSecretario,
                    votoSecretario,
                    nomeEmpresaRecuperanda,
                    votoEmpresaRecuperanda,
                    loading: false
                })
            });
    }

    refreshAssembleia(){
        axios.get(window.Params.URL_API+'assembleias/?codigo='+window.Params.codigoAssembleiaAtiva)
            .then(resp => {
                this.setState({...this.state, assembleia: resp.data[0]})

                setTimeout(() => this.refreshAssembleia(), 5000);
            })
    }

    refreshDashboard() {
        axios.get(window.Params.URL_API+'votos/dashboard/')
            .then(resp => {
                const dashboard = resp.data
                this.setState({...this.state, dashboard})

                if(!dashboard.resConfPres)
                    return

                const trabalhista = dashboard.resConfPres.filter(p => p.codigoClasse == 1)[0];
                const garantiaReal = dashboard.resConfPres.filter(p => p.codigoClasse == 2)[0];
                const quirografario = dashboard.resConfPres.filter(p => p.codigoClasse == 3)[0];
                const meEpp = dashboard.resConfPres.filter(p => p.codigoClasse == 4)[0];

                let quantConfTrabalhista = trabalhista ? trabalhista.quant : 0;
                let quantConfGarantiaReal = garantiaReal ? garantiaReal.quant : 0;
                let quantConfQuirografario = quirografario ? quirografario.quant : 0;
                let quantConfMeEpp = meEpp ? meEpp.quant : 0;

                this.setState({ ...this.state, quantConfTrabalhista, quantConfGarantiaReal, quantConfQuirografario, quantConfMeEpp})
            })
    }

    colorLine(aprovou) {
        if(aprovou)
            return 'success'

        return 'danger'
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
                                    <h3 className="box-title">Você assina a ata?</h3>

                                    <div className="box-tools pull-right">
                                        <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i></button>
                                    </div>
                                </div>
                                <div className="box-body chart-responsive box-botoes-aprovacao">
                                    <button style={({ marginRight: '1rem' })} className='btn btn-success btn-lg' disabled={!this.state.assembleia.podeAta} onClick={() => this.aprovarAta()}>Assinar ata</button>
                                    {/* <button style={({ marginRight: '1rem' })} className='btn btn-danger btn-lg' disabled={!this.state.assembleia.podeAta} onClick={() => this.naoAprovarAta()}>Não. Eu não aprovo a ata</button> */ }
                                </div>
                            </div>
                            </Grid>
                        </Row>
                        <Row>
                            <div className="box-botoes-aprovacao">       

                            <Grid cols="12"> 
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Resultado de assinadores da ata</h3>

                                    <div className="box-tools pull-right">
                                        <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i></button>
                                    </div>
                                </div>
                                <div className="box-body chart-responsive box-botoes-aprovacao">
                                <BoxResultadoQuant 
                                    quantConf={this.state.quantConfTrabalhista}
                                    quant={this.state.quantTrabalhista}
                                    descricao={this.state.descricaoTrabalhista}
                                />
                                <BoxResultadoQuant 
                                    quantConf={this.state.quantConfGarantiaReal}
                                    quant={this.state.quantGarantiaReal}
                                    descricao={this.state.descricaoGarantiaReal}
                                />
                                <BoxResultadoQuant 
                                    quantConf={this.state.quantConfQuirografario}
                                    quant={this.state.quantQuirografario}
                                    descricao={this.state.descricaoQuirografario}
                                />
                                <BoxResultadoQuant 
                                    quantConf={this.state.quantConfMeEpp}
                                    quant={this.state.quantMeEpp}
                                    descricao={this.state.descricaoMeEpp}
                                />
                                </div>
                            </div>
                            </Grid>
                            </div>
                        </Row> 
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
                        <Row>
                            <Grid cols="12">                
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Secretário e empresa recuperanda</h3>

                                    <div className="box-tools pull-right">
                                        <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i></button>
                                    </div>
                                </div>
                                <div className="box-body chart-responsive">
                                    <table className='table table-hover'>
                                        <thead>
                                            <tr>
                                                <th>Nome</th>
                                                <th>Assinou</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        <If test={this.state.nomeSecretario}>
                                            <tr key={this.state.nomeSecretario} className={this.colorLine(this.state.votoSecretario)}>
                                                <td>Secretário - {this.state.nomeSecretario}</td>
                                                <td>{this.state.votoSecretario ? 'Assinou' : 'Reprovou'}</td>
                                            </tr>
                                        </If>
                                        <If test={this.state.nomeEmpresaRecuperanda}>
                                            <tr key={this.state.nomeEmpresaRecuperanda} className={this.colorLine(this.state.votoEmpresaRecuperanda)}>
                                                <td>Recuperanda - {this.state.nomeEmpresaRecuperanda}</td>
                                                <td>{this.state.votoEmpresaRecuperanda ? 'Assinou' : 'Reprovou'}</td>
                                            </tr>
                                        </If>
                                        </tbody>
                                    </table>
                                </div>
                            </div> 
                            </Grid>                       
                        </Row>                                                  
                         
                        <VotosAtaList 
                            list={this.state.listTrabalhista}
                            descricao={this.state.descricaoTrabalhista}
                        />
                        
                        <VotosAtaList 
                            list={this.state.listGarantiaReal}
                            descricao={this.state.descricaoGarantiaReal}
                        />

                        <VotosAtaList 
                            list={this.state.listQuirografario}
                            descricao={this.state.descricaoQuirografario}
                        />

                        <VotosAtaList 
                            list={this.state.listMeEpp}
                            descricao={this.state.descricaoMeEpp}
                        />
                    </div>
                </If>
                </Content>
            </div>
        );
    }
}