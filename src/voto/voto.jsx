import React, { Component } from 'react'
import axios from 'axios'

import If from '../common/operator/if'
import List from './votoList'
import Loading from '../common/components/Loading'
import './voto.css'
import Content from '../common/template/content'
import Row from  '../common/layout/row'
import Grid from '../common/layout/grid'

export default class Voto extends Component {
    getUrl() {
        return window.Params.URL_API+'votos/?codigoAssembleia='+window.Params.codigoAssembleiaAtiva;
    }

    constructor(props){
        super(props);

        this.state = { list: [], loading: false }        
    }

    componentDidMount() {
        this.refresh();
    }

    refresh(description) {
        let search = description ? `&nomeCredor__regex=/${description}/` : ''
        this.setState({...this.state, loading: true})
        axios.get(`${this.getUrl()}&sort=-ordem${search}`)
            .then(resp => {
                this.setState({...this.state, list: resp.data, loading: false})
            });
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
                    <If test={!this.state.loading && !this.state.list.length}>                    
                        <div className='container-msg'><p>Nenhum voto computado até o momento. Aqui você poderá acompanhar os votos de todos os credores</p></div>                    
                    </If>
                    <If test={this.state.loading}>
                        <center><Loading color="#3C8DBC" /></center>
                    </If>
                    <If test={this.state.list.length}>
                        <div>
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
                                            <input id='description' className='form-control'
                                                onKeyUp={keyHandler}
                                                placeholder='Pesquise o credor'></input>
                                            <List list={this.state.list}/>
                                        </div>
                                    </div>                                    
 
                                </Grid>                       
                            </Row>  
                        </div>   
                    </If>
                </Content>
            </div>
        );
    }
}