import React, { Component } from 'react'
import axios from 'axios'

import List from './onlineList'

export default class Online extends Component {
    constructor(props){
        super(props);

        this.state = { list: [] }

        this.connectedUsers = this.connectedUsers.bind(this)

        window.socketIo.on('connectedUsers', this.connectedUsers)   

        setTimeout(function(){
            window.socketIo.emit('getConnectedUsers')        
        }, 500  );
        
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
                <List list={this.state.list}/>
            </div>
        );
    }
}