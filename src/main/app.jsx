import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import Header from '../common/template/header'
import SideBar from '../common/template/sideBar'
import Footer from '../common/template/footer'
import Messages from '../common/msg/messages'
import { getChatNontifications } from '../notificacao/notificacaoActions'
class App extends Component {

    constructor(props) {
        super(props);

        this.notifyLoader()
    }

    notifyLoader() {
        setTimeout(() => {
            this.props.getChatNontifications(this.props.notify.lastRead)
            this.notifyLoader();
        }, 5000)
    }

    componentWillUnmount() {
        this.notifyLoader = () => {}
    }

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

const mapStateToProps = state => ({ notify: state.notificacao.notify })
const mapDispatchToProps = dispatch => bindActionCreators({getChatNontifications}, dispatch)
export default connect(mapStateToProps, mapDispatchToProps)(App)