import React, { Component } from 'react'
import { toastr } from 'react-redux-toastr'
import axios from 'axios'
import If from '../common/operator/if'
import Loading from '../common/components/Loading'
import List from './notificacaoList'
import Content from '../common/template/content'
import Row from  '../common/layout/row'
import Grid from '../common/layout/grid'

export default class Notificacao extends Component {
    getUrl() {
        return window.Params.URL_API+'notificacoes';
    }

    constructor(props){
        super(props);

        this.state = { list: [], loading: false, apenasNaoLidos: true }

        this.marcarComoLido = this.marcarComoLido.bind(this)
        this.handleCheckApenasNaoLidos = this.handleCheckApenasNaoLidos.bind(this)
    }

    componentDidMount() {
        this.refresh();
    }

    marcarComoLido(todo, lido, next) {
        const { list } = this.state
        const dto = {
            lido: lido
        }


        axios.put(`${this.getUrl()}/${todo._id}`, dto)
        .then(resp => {
            list.find(p => p._id==todo._id).lido = lido
            this.setState({ list });
            if(next)
                next();
        })
        .catch(e => {
            e.response.data.errors.forEach(error => toastr.error('Erro', error))
        })
    }

    marcarComoLidoTodos() {
        this.marcarComoLidoProximo();
    }

    marcarComoLidoProximo() {
        let pendentes = this.state.list.filter((notif) => !notif.lido)
        if(!pendentes[0])
            return;
        
        this.marcarComoLido(pendentes[0], true, () => this.marcarComoLidoProximo());
    }

    refresh(description) {
        let search = description ? `&mensagem__regex=/${description}/` : ''
        if(this.state.apenasNaoLidos)
            search += '&lido=false'


        this.setState({...this.state, loading: true})
        axios.get(`${this.getUrl()}?sort=-_id${search}`)
            .then(resp => this.setState({...this.state, list: resp.data, loading: false}));
    }

    handleCheckApenasNaoLidos(e) {
        this.setState({...this.state, apenasNaoLidos: e.target.checked});
        setTimeout(() => {
            this.refresh();
        }, 150)        
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
                    <Row>
                        <Grid cols="12">  
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Notificações</h3>

                                    <div className="box-tools pull-right">
                                        <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i></button>
                                    </div>
                                </div>
                                <div className="box-body chart-responsive">
                                    <input id='description' className='form-control'
                                                onKeyUp={keyHandler}
                                                placeholder='Pesquise a notificação'></input>
                                    <input style={{margin:'5px'}} type="checkbox" checked={this.state.apenasNaoLidos} onChange={this.handleCheckApenasNaoLidos}></input> Apenas não lidos
                                    <div style={{float:'right', margin:'5px'}}>
                                        <button className='btn btn-success' onClick={() => this.marcarComoLidoTodos()}>Ler todos</button>
                                    </div>
                                    <List 
                                        list={this.state.list}
                                        marcarComoLido={this.marcarComoLido}/>
                                </div>
                            </div>
                        </Grid>                       
                    </Row>
                </Content>
            </div>
        );
    }
}