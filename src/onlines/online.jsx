import React, { Component } from 'react'
import axios from 'axios'

import List from './onlineList'
import Content from '../common/template/content'
import Row from  '../common/layout/row'
import Grid from '../common/layout/grid'

export default class Online extends Component {
    constructor(props){
        super(props);

        this.state = { list: [] }

        this.expulsar = this.expulsar.bind(this)

        this.connectedUsers = this.connectedUsers.bind(this)

        window.socketIo.on('connectedUsers', this.connectedUsers)   

        setTimeout(function(){
            window.socketIo.emit('getConnectedUsers')
        }, 500  );
        
    }

    expulsar(user) {
        window.socketIo.emit('expulsarId', user.id)
    }

    componentWillUnmount() {
        this.connectedUsers = () => {}
    }

    connectedUsers(data) {
        this.setState({ list: data});
    }
    
    render() {
        return (
            <div className='conteudo-principal-com-rolagem'>
                <Content>
                    <Row>
                        <Grid cols="12">  
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Usuários online</h3>

                                    <div className="box-tools pull-right">
                                        <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i></button>
                                    </div>
                                </div>
                                <div className="box-body chart-responsive">
                                    <List 
                                    list={this.state.list}
                                    expulsar={this.expulsar}/>
                                </div>
                            </div>                                    

                        </Grid>                       
                    </Row>
                </Content>
            </div>
        );
    }
}