import React, { Component } from 'react'

import Header from '../common/template/header'
import SideBar from '../common/template/sideBar'
import Footer from '../common/template/footer'
import Messages from '../common/msg/messages'

export default class App extends Component {
    render() {
        return (
            <div className='wrapper' style={{ height: '100vh', position: 'relative' }}>
                <Header />
                <SideBar />
                <div className='content-wrapper' 
                    style={{ height: '100vh', position: 'relative', }}> 
                    {this.props.children}
                </div>
                <Footer />
                <Messages />
            </div>
        )
    }
}