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

        this.state = { list: [], loading: false }
    }

    componentDidMount() {
        this.refresh();
    }

    refresh() {
        this.setState({...this.state, loading: true})
        axios.get(`${this.getUrl()}?sort=-_id`)
            .then(resp => this.setState({...this.state, list: resp.data, loading: false}));
    }
    
    render() {
        return (
            <div className='conteudo-principal-com-rolagem'>
                <Content>
                    <Row>
                        <Grid cols="12">  
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Links úteis</h3>

                                    <div className="box-tools pull-right">
                                        <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i></button>
                                    </div>
                                </div>
                                <div className="box-body chart-responsive">
                                    <If test={this.state.loading}>
                                        <center><Loading color="#3C8DBC" /></center>
                                    </If>                
                                    <If test={!this.state.loading}>
                                        <List list={this.state.list}/>
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