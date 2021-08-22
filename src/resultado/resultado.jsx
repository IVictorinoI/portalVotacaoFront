import React, { Component } from 'react'
import axios from 'axios'
import If from '../common/operator/if'
import Loading from '../common/components/Loading'
import List from './resultadoList'
import Row from  '../common/layout/row'
import Grid from '../common/layout/grid'
import './resultado.css'
import Content from '../common/template/content'
import ResultadoBox from './resultadoBox'

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

        this.state = { list: [], firstItem: {}, assembleia: {}, loading: false }
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

        axios.get(`${window.Params.URL_API}/assembleias/?ativo=true`)
            .then(resp => {
                this.setState({...this.state, assembleia: resp.data[0] || {}})
            });            
    }
    
    render() {
        return (
            <div className='conteudo-principal-com-rolagem'>
                <Content>
                <If test={this.state.loading}>
                    <center><Loading color="#3C8DBC" /></center>
                </If>
                <If test={this.state.list && this.state.list.length}>
                    <Row>
                        <Grid cols="12">                
                        <div className="box box-primary">
                            <div className="box-header with-border">
                                <h3 className="box-title">Pergunta</h3>

                                <div className="box-tools pull-right">
                                    <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i></button>
                                </div>
                            </div>
                            <div className="box-body chart-responsive">
                                <center><h2>{this.state.assembleia.pergunta}</h2></center>
                            </div>
                        </div> 
                        </Grid>                       
                    </Row>   
                </If>             
                <If test={this.state.firstItem.tipoResultado!="V"}>
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
                </If>
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
                                            <ResultadoBox 
                                                yellow={this.state.firstItem.valorSubTotalSim > this.state.firstItem.valorSubTotalNao} 
                                                value={this.formataValor(this.state.firstItem.valorSubTotalSim)}
                                                text="Sim"                                                
                                            />
                                        </Grid>
                                        <Grid cols="4">                    
                                            <ResultadoBox 
                                                yellow={this.state.firstItem.valorSubTotalNao > this.state.firstItem.valorSubTotalSim} 
                                                value={this.formataValor(this.state.firstItem.valorSubTotalNao)}
                                                text="Não"                                                
                                            />
                                        </Grid>
                                        </div>
                                    </Row>
                                    <Row>
                                        <div className="box-totalgeral">                  
                                        <Grid cols="4">
                                            <ResultadoBox 
                                                yellow={this.state.firstItem.percSubTotalSim > this.state.firstItem.percSubTotalNao} 
                                                value={this.formataPerc(this.state.firstItem.percSubTotalSim)}
                                                perc={true}
                                                text="Sim"                                                
                                            />
                                        </Grid>
                                        <Grid cols="4">                    
                                            <ResultadoBox 
                                                yellow={this.state.firstItem.percSubTotalNao > this.state.firstItem.percSubTotalSim} 
                                                value={this.formataPerc(this.state.firstItem.percSubTotalNao)}
                                                perc={true}
                                                text="Não"                                                
                                            />
                                        </Grid>
                                        </div>
                                    </Row>  
                                    <Row>
                                        <div className="box-totalgeral">    
                                            <Grid cols="4">  
                                                <ResultadoBox 
                                                    yellow={true} 
                                                    value={this.formataValor(this.state.firstItem.valorTotalGeral)}
                                                    text="Total geral"                                                
                                                />
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