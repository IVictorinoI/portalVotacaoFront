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
            listTrabalhista: [], 
            listQuirografario: [], 
            listGarantiaReal: [], 
            listMeEpp: [], 
            loading: false,
            descricaoTrabalhista: "Trabalhistas",
            descricaoQuirografario: "Quirografários",
            descricaoGarantiaReal: "Garantia real",
            descricaoMeEpp: "Me/Epp Microempresa e empresa de pequeno porte",
            quantTrabalhista: 0,
            quantGarantiaReal: 0,
            quantQuirografario: 0,
            quantMeEpp: 0
        }

        window.socketIo.on('reprovouata', () => { this.refresh() })
        window.socketIo.on('aprovouata', () => { this.refresh() })
    }

    componentDidMount() {
        this.refresh();
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
                let descricaoTrabalhista = listTrabalhista[0] ? listTrabalhista[0].descricaoClasse : this.state.descricaoTrabalhista;
                let descricaoGarantiaReal = listGarantiaReal[0] ? listGarantiaReal[0].descricaoClasse : this.state.descricaoGarantiaReal;
                let descricaoQuirografario = listQuirografario[0] ? listQuirografario[0].descricaoClasse : this.state.descricaoQuirografario;
                let descricaoMeEpp = listMeEpp[0] ? listMeEpp[0].descricaoClasse : this.state.descricaoMeEpp;
                let quantTrabalhista = listTrabalhista.filter(p => p.aprovou).length;
                let quantGarantiaReal = listGarantiaReal.filter(p => p.aprovou).length;
                let quantQuirografario = listQuirografario.filter(p => p.aprovou).length;
                let quantMeEpp = listMeEpp.length;
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
                    loading: false
                })
            });
    }

    colorCardAprovacao(quant) {
        if(quant>=2)
            return "small-box bg-green"

        if(quant>=1)
            return "small-box bg-yellow"

        return "small-box bg-gray"

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
                                    <h3 className="box-title">Você aprova a ata?</h3>

                                    <div className="box-tools pull-right">
                                        <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i></button>
                                    </div>
                                </div>
                                <div className="box-body chart-responsive box-botoes-aprovacao">
                                    <button style={({ marginRight: '1rem' })} className='btn btn-success btn-lg' onClick={() => this.aprovarAta()}>Sim. Eu aprovo a ata</button>
                                    <button style={({ marginRight: '1rem' })} className='btn btn-danger btn-lg' onClick={() => this.naoAprovarAta()}>Não. Eu não aprovo a ata</button>
                                </div>
                            </div>
                            </Grid>
                        </Row>
                        <Row>
                            <div className="box-botoes-aprovacao">       

                            <Grid cols="12"> 
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Resultado de aprovadores da ata</h3>

                                    <div className="box-tools pull-right">
                                        <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i></button>
                                    </div>
                                </div>
                                <div className="box-body chart-responsive box-botoes-aprovacao">
                                <Grid cols="3">
                                    <div className={this.colorCardAprovacao(this.state.quantTrabalhista)}>
                                        <div className="inner">
                                        <h3>{this.state.quantTrabalhista}</h3>
                                        <p>{this.state.descricaoTrabalhista}</p>
                                        </div>
                                        <div className="icon">  
                                        <i className="ion ion-stats-bars"></i>
                                        </div>
                                    </div>
                                </Grid>
                                <Grid cols="3">                    
                                    <div className={this.colorCardAprovacao(this.state.quantQuirografario)}>
                                        <div className="inner">
                                        <h3>{this.state.quantQuirografario}</h3>
                                        <p>{this.state.descricaoQuirografario}</p>
                                        </div>
                                        <div className="icon">  
                                        <i className="ion ion-stats-bars"></i>
                                        </div>
                                    </div>
                                </Grid>
                                <Grid cols="3">                    
                                    <div className={this.colorCardAprovacao(this.state.quantGarantiaReal)}>
                                        <div className="inner">
                                        <h3>{this.state.quantGarantiaReal}</h3>
                                        <p>{this.state.descricaoGarantiaReal}</p>
                                        </div>
                                        <div className="icon">  
                                        <i className="ion ion-stats-bars"></i>
                                        </div>
                                    </div>
                                </Grid> 
                                <Grid cols="3">                    
                                    <div className={this.colorCardAprovacao(this.state.quantMeEpp)}>
                                        <div className="inner">
                                        <h3>{this.state.quantMeEpp}</h3>
                                        <p>{this.state.descricaoMeEpp}</p>
                                        </div>
                                        <div className="icon">  
                                        <i className="ion ion-stats-bars"></i>
                                        </div>
                                    </div>
                                </Grid>                                                                   
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