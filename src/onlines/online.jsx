import React, { Component } from 'react'
import axios from 'axios'

import List from './onlineList'

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
            <div>
                <List 
                    list={this.state.list}
                    expulsar={this.expulsar}/>
            </div>
        );
    }
}