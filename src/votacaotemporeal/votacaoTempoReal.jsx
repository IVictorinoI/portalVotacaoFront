import React, { Component } from 'react'
import axios from 'axios'
import If from '../common/operator/if'

import List from './votacaoTempoRealList'

import Content from '../common/template/content'
import Row from  '../common/layout/row'
import Grid from '../common/layout/grid'

export default class VotacaoTempoReal extends Component {
    getUrl() {
        return window.Params.URL_API+'votos/?codigoAssembleia='+window.Params.codigoAssembleiaAtiva;
    }

    constructor(props){
        super(props);

        this.state = { list: [], ultimaOrdem: 0, assembleia: {} }

        this.refresh();
        this.loadAssembleia();
    }

    componentWillUnmount() {
        this.refresh = () => {}
    }

    loadAssembleia(){
        axios.get(window.Params.URL_API+'assembleias/?codigo='+window.Params.codigoAssembleiaAtiva)
            .then(resp => {
                this.setState({...this.state, assembleia: resp.data[0]})
            })
    }

    refresh() {
        var ultimaOrdem = this.state.ultimaOrdem

        axios.get(`${this.getUrl()}&ordem__gt=${ultimaOrdem}&sort=-ordem`)
            .then(resp => {
                const listaAtual = this.state.list
                const novosRegistros = resp.data.filter(p => {
                    return !listaAtual.filter(q => q._id === p._id).length
                });
                
                Array.prototype.push.apply(novosRegistros, listaAtual)

                this.setState({...this.state, list: novosRegistros})

                if(resp.data && resp.data.length){
                    listaAtual.forEach((dto) => {
                        if(dto.ordem>ultimaOrdem)
                          ultimaOrdem=dto.ordem
                    });
                    this.setState({ ...this.state, ultimaOrdem: ultimaOrdem});
                }

                setTimeout(() => {
                    this.refresh()
                }, 3000);
            });
    }
    
    render() {
        return (
            <div className='conteudo-principal-com-rolagem'>
                <Content>
                    <If test={this.state.assembleia.podeVotar}>
                        <div className="alert alert-success" role="success">
                            <center>{this.state.assembleia.pergunta}</center>
                        </div>                
                    </If>
                    <Row>
                        <Grid cols="12">  
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Votos</h3>

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
                </Content>
            </div>
        );
    }
}