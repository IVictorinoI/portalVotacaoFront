import React, { Component } from 'react'
import axios from 'axios'
import If from '../common/operator/if'
import Loading from '../common/components/Loading'
import List from './linkList'
import Content from '../common/template/content'
import Row from  '../common/layout/row'
import Grid from '../common/layout/grid'

export default class Link extends Component {
    getUrl() {
        return window.Params.URL_API+'links';
    }

    constructor(props){
        super(props);

        this.state = { list: [], editing: {}, loading: false }

        this.handleChangeDescricao = this.handleChangeDescricao.bind(this)
        this.handleChangeUrl = this.handleChangeUrl.bind(this)
        this.edit = this.edit.bind(this)
        this.delete = this.delete.bind(this)
    }

    componentDidMount() {
        this.refresh();
    }

    refresh() {
        this.setState({...this.state, loading: true})
        axios.get(`${this.getUrl()}?sort=-_id`)
            .then(resp => this.setState({...this.state, list: resp.data, loading: false}));
    }

    salvar() {
        const { editing } = this.state

        const method = editing._id ? 'put' : 'post'

        const id = editing._id ? editing._id : ''

        editing._id = id ? id : null

        const emptyEditing = { descricao: '', url: '', _id: ''}

        axios[method](`${this.getUrl()}/`+id, editing)
        .then(resp => {
            this.setState({ editing: emptyEditing })
            this.refresh()
        })
        .catch(e => {
            this.setState({ editing: emptyEditing })
            this.refresh()
        })        
    }

    edit(editing) {
        this.setState({ editing })
    }

    delete(editing) {
        axios['delete'](`${this.getUrl()}/`+editing._id)
        .then(resp => {
            this.refresh()
        })
        .catch(e => {
            this.refresh()
        })  
    }
    
    handleChangeDescricao(event) {
        const editing = {
            ...this.state.editing,
            descricao: event.target.value
        }
        this.setState({ editing });
    }

    handleChangeUrl(event) {
        const editing = {
            ...this.state.editing,
            url: event.target.value
        }
        this.setState({ editing });
    }
    
    render() {
        return (
            <div className='conteudo-principal-com-rolagem'>
                <Content>
                    <Row>
                        <Grid cols="12">  
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Links de acesso externo</h3>

                                    <div className="box-tools pull-right">
                                        <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i></button>
                                    </div>
                                </div>
                                <div className="box-body chart-responsive">
                                    <Row>
                                        <Grid cols="3">
                                            <input id='name' type="text" className='form-control' placeholder='Descrição' style={({ marginBottom: '1rem', marginLeft: '5px' })} value={this.state.editing.descricao} onChange={this.handleChangeDescricao}></input>
                                        </Grid>      
                                        <Grid cols="10">
                                            <input id='oab' type="text" className='form-control' placeholder='URL' style={({ marginBottom: '1rem', marginLeft: '5px' })} value={this.state.editing.url} onChange={this.handleChangeUrl}></input>
                                            
                                        </Grid>      
                                        <Grid cols="12">
                                            <button className='btn btn-success' onClick={() => this.salvar()}>Salvar</button>
                                        </Grid>      
                                    </Row>
                                    <If test={this.state.loading}>
                                        <center><Loading color="#3C8DBC" /></center>
                                    </If>                
                                    <If test={!this.state.loading}>
                                        <List list={this.state.list} edit={this.edit} delete={this.delete}/>
                                    </If>
                                </div>
                            </div> 
                        </Grid>                       
                    </Row>                        

                </Content>
            </div>
        );
    }
}