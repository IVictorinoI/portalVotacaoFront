import React, { Component } from 'react'
import axios from 'axios'
import If from '../common/operator/if'
import Loading from '../common/components/Loading'
import Content from '../common/template/content'
import './aprovaAta.css'
import VotosAtaList from './votosAtaList'
import SecretarioRecuperandaBox from './secretarioRecuperandaBox'
import Search from './search'
import VotoAction from './votoAction'
import ResultadoQuant from './resultadoQuant'

export default class AprovaAta extends Component {
    getUrl() {
        return window.Params.URL_API+'aprovaAtas/';
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
                        <VotoAction 
                            podeAta={this.state.assembleia.podeAta}
                        />
                        <ResultadoQuant 
                            quantConfTrabalhista={this.state.quantConfTrabalhista}
                            quantTrabalhista={this.state.quantTrabalhista}
                            descricaoTrabalhista={this.state.descricaoTrabalhista}
                            quantConfGarantiaReal={this.state.quantConfGarantiaReal}
                            quantGarantiaReal={this.state.quantGarantiaReal}
                            descricaoGarantiaReal={this.state.descricaoGarantiaReal}
                            quantConfQuirografario={this.state.quantConfQuirografario}
                            quantQuirografario={this.state.quantQuirografario}
                            descricaoQuirografario={this.state.descricaoQuirografario}
                            quantConfMeEpp={this.state.quantConfMeEpp}
                            quantMeEpp={this.state.quantMeEpp}
                            descricaoMeEpp={this.state.descricaoMeEpp}                            
                        />

                        <Search 
                            keyHandler={keyHandler}
                        />
                        <SecretarioRecuperandaBox 
                            nomeSecretario={this.state.nomeSecretario}
                            votoSecretario={this.state.votoSecretario}
                            nomeEmpresaRecuperanda={this.state.nomeEmpresaRecuperanda}
                            votoEmpresaRecuperanda={this.state.votoEmpresaRecuperanda}
                        />

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