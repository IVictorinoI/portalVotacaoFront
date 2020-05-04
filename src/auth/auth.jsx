import './auth.css'
import React, { Component } from 'react'
import { reduxForm, Field } from 'redux-form'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { login, signup } from './authActions'
import Row from '../common/layout/row'
import Grid from '../common/layout/grid'
import If from '../common/operator/if'
import Messages from '../common/msg/messages'
import Input from '../common/form/inputAuth'
class Auth extends Component {
    constructor(props) {
        super(props)
        this.state = { loginMode: true }
    }
    changeMode() {
        this.setState({ loginMode: !this.state.loginMode })
    }
    onSubmit(values) {
        const { login, signup } = this.props
        this.state.loginMode ? login(values) : signup(values)
    }
    render() {
        //const { loginMode } = this.state
        const loginMode = true;
        const { handleSubmit } = this.props
        return (
            <div className="login-box">
                <div className="login-logo"> Votação</div>
                <div className="login-box-body">
                    <p className="login-box-msg">Bem vindo!</p>
                    <form onSubmit={handleSubmit(v => this.onSubmit(v))}>
                        <Field component={Input} type="input" name="nome"
                            placeholder="Nome" icon='user' hide={loginMode} />
                        <Field component={Input} type="input" name="login"
                            placeholder="Login" icon='user' />
                        <Field component={Input} type="email" name="email"
                            placeholder="E-mail" icon='envelope' hide={loginMode} />
                        <Field component={Input} type="password" name="senha"
                            placeholder="Senha" icon='lock' />
                        <Field component={Input} type="password" name="confirm_senha"
                            placeholder="Confirmar Senha" icon='lock' hide={loginMode} />
                        <Row>
                            <Grid cols="4">
                                <button type="submit"
                                    className="btn btn-primary btn-block btn-flat">
                                    {loginMode ? 'Entrar' : 'Registrar'}
                                </button>
                            </Grid>
                        </Row>
                    </form>
                    <br />
                    {/*<a onClick={() => this.changeMode()}>
                        {loginMode ? 'Novo usuário? Registrar aqui!' :
                            'Já é cadastrado? Entrar aqui!'}
                    </a>*/}
                </div>
                <Messages />
            </div>
        )
    }
}
Auth = reduxForm({ form: 'authForm' })(Auth)
const mapDispatchToProps = dispatch => bindActionCreators({ login, signup }, dispatch)
export default connect(null, mapDispatchToProps)(Auth)