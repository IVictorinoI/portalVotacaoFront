import React, { Component } from 'react'
import axios from 'axios'
import If from '../common/operator/if'
import Loading from '../common/components/Loading'
import List from './resultadoList'
import Row from  '../common/layout/row'
import Grid from '../common/layout/grid'
import './resultado.css'
import Content from '../common/template/content'

export default class Resultado extends Component {
    getUrl() {
        return window.Params.URL_API+'resultados/?codigoAssembleia='+window.Params.codigoAssembleiaAtiva;
    }

    formataValor(valor) {
        return (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }

    formataPerc(perc) {
        return (perc || 0).toLocaleString('pt-BR', { style: 'decimal', minimumFractionDigits: 4, maximumFractionDigits: 6 })
    }

    constructor(props){
        super(props);

        this.state = { list: [], firstItem: {}, loading: false }
    }

    componentDidMount() {
        this.refresh();
    }

    refresh() {
        this.setState({...this.state, loading: true})
        axios.get(`${this.getUrl()}&sort=codigoClasse`)
            .then(resp => {
                this.setState({...this.state, list: resp.data, firstItem: resp.data[0] || {}, loading: false})
            });
    }
    
    render() {
        return (
            <div className='conteudo-principal-com-rolagem'>
                <Content>
                <If test={this.state.loading}>
                    <center><Loading color="#3C8DBC" /></center>
                </If>
                <Row>
                    <Grid cols="12">                
                    <div className="box box-primary">
                        <div className="box-header with-border">
                            <h3 className="box-title">Resultado</h3>

                            <div className="box-tools pull-right">
                                <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i></button>
                            </div>
                        </div>
                        <div className="box-body chart-responsive">
                            <List list={this.state.list}/>
                        </div>
                    </div> 
                    </Grid>                       
                </Row>
                <If test={this.state.firstItem.tipoResultado=="V"}>
                    <Row>
                        <Grid cols="12">                
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Subtotal</h3>

                                    <div className="box-tools pull-right">
                                        <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i></button>
                                    </div>
                                </div>
                                <div className="box-body chart-responsive">
                                
                                    <Row>
                                        <div className="box-totalgeral">                   
                                        <Grid cols="4">
                                                <div className={this.state.firstItem.valorSubTotalSim > this.state.firstItem.valorSubTotalNao ? "small-box bg-yellow" : "small-box bg-gray-ligh"}>
                                                    <div className="inner">
                                                    <h3>{this.formataValor(this.state.firstItem.valorSubTotalSim)}</h3>
                                                    <p>Sim</p>
                                                    </div>
                                                    <div className="icon">  
                                                    <i className="ion ion-stats-bars"></i>
                                                    </div>
                                                </div>
                                        </Grid>
                                        <Grid cols="4">                    
                                                <div className={this.state.firstItem.valorSubTotalNao > this.state.firstItem.valorSubTotalSim ? "small-box bg-yellow" : "small-box bg-gray-light"}>
                                                    <div className="inner">
                                                    <h3>{this.formataValor(this.state.firstItem.valorSubTotalNao)}</h3>
                                                    <p>Não</p>
                                                    </div>
                                                    <div className="icon">  
                                                    <i className="ion ion-stats-bars"></i>
                                                    </div>
                                                </div>
                                        </Grid>
                                        </div>
                                    </Row>
                                    <Row>
                                        <div className="box-totalgeral">                  
                                        <Grid cols="4">
                                                <div className={this.state.firstItem.percSubTotalSim > this.state.firstItem.percSubTotalNao ? "small-box bg-yellow" : "small-box bg-gray-light"}>
                                                    <div className="inner">
                                                    <h3>{this.formataPerc(this.state.firstItem.percSubTotalSim)}<sup style={({fontSize: "20px"})}>%</sup></h3>
                                                    <p>Sim</p>
                                                    </div>
                                                    <div className="icon">  
                                                    <i className="ion ion-stats-bars"></i>
                                                    </div>
                                                </div>
                                        </Grid>
                                        <Grid cols="4">                    
                                                <div className={this.state.firstItem.percSubTotalNao > this.state.firstItem.percSubTotalSim ? "small-box bg-yellow" : "small-box bg-gray-light"}>
                                                    <div className="inner">
                                                    <h3>{this.formataPerc(this.state.firstItem.percSubTotalNao)}<sup style={({fontSize: "20px"})}>%</sup></h3>
                                                    <p>Não</p>
                                                    </div>
                                                    <div className="icon">  
                                                    <i className="ion ion-stats-bars"></i>
                                                    </div>
                                                </div>
                                        </Grid>
                                        </div>
                                    </Row>  
                                    <Row>
                                        <div className="box-totalgeral">    
                                            <Grid cols="4">   
                                                <div className="small-box bg-yellow">
                                                    <div className="inner">
                                                    <h3>{this.formataValor(this.state.firstItem.valorTotalGeral)}</h3>
                                                    <p>Total geral</p>
                                                    </div>
                                                    <div className="icon">  
                                                    <i className="ion ion-stats-bars"></i>
                                                    </div>
                                                </div>
                                            </Grid>
                                        </div>
                                    </Row>                                
                                </div>
                            </div> 
                        </Grid>                       
                    </Row> 
                </If>                                 
                
   
                </Content>           
            </div>
        );
    }
}