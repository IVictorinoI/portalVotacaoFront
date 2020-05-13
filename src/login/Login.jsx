import React, { Component } from 'react'
import axios from 'axios'
import If from '../common/operator/if'

export default class Classe extends Component {
    getUrl() {
        return window.Params.URL_API+'usuarios';
    }  

    constructor(props){
        super(props);

        this.state = { list: [], usuarioLogado: {} }
        
    }

    componentDidMount(){
        this.verificaUsuarioLogado();   
    }

    verificaUsuarioLogado(){
        let usuarioLocalStorage = localStorage.getItem('usuarioLogado');

        if(!usuarioLocalStorage)
            usuarioLocalStorage = '{}'

        let usuario = JSON.parse(usuarioLocalStorage) || {};
        this.setState({
            usuarioLogado: usuario
        });
    }

    refresh() {
        axios.get(`${this.getUrl()}?sort=-_id`)
            .then(resp => this.setState({...this.state, list: resp.data}));
    }

    login() {
        let usuario = document.getElementById('inputEmail3').value
        let senha = document.getElementById('inputPassword3').value
        const search = `&login=${usuario}&senha=${senha}`
        axios.get(`${this.getUrl()}?sort=-_id${search}`)
            .then(resp => {
                let achou = resp.data.length && resp.data[0]._id
                this.setState({erroLogin: !achou})
                if(achou){
                    this.setState({erroLogin: false})
                    localStorage.setItem('usuarioLogado', JSON.stringify(resp.data[0]));
                    window.socketIo.emit('setUser', resp.data[0])
                    this.verificaUsuarioLogado();
                }                    
            })                
    }

    sair() {
        localStorage.setItem('usuarioLogado', null);
        this.verificaUsuarioLogado();
    }
    
    render() {
        return (
            <div>
                <If test={this.state.usuarioLogado._id}>
                    <div style={({ width: '100%'})}>
                        <center>
                            <center><h2>Olá {this.state.usuarioLogado.nome}</h2></center>
                            <button className="btn btn-danger" onClick={() => this.sair()}>Sair</button>
                        </center>
                    </div>                    
                </If>
                <If test={this.state.erroLogin}>
                    <div style={({ width: '100%', color: 'red'})}>
                        <center><h2>Usuário/senha inválidos</h2></center>
                    </div>
                </If>                                
                <If test={!this.state.usuarioLogado._id}>
                    <center>
                        <div style={({ width: 'calc(100% - 80px)', heigth: '100%', marginTop: '50px', marginLeft: '50px' })}>
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label className="col-sm-2 control-label">Usuário</label>
                                    <div className="col-sm-10">
                                    <input className="form-control" id="inputEmail3" placeholder="Usuário" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="col-sm-2 control-label">Senha</label>
                                    <div className="col-sm-10">
                                    <input type="password" className="form-control" id="inputPassword3" placeholder="Senha" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <div className="col-sm-offset-2 col-sm-10">
                                    <button className="btn btn-success" onClick={() => this.login()}>Entrar</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </center>
                </If>
            </div>
        );
    }
}




/*

                <If test={this.state.usuarioLogado._id}>
                    <div style={({ width: '100%'})}>
                        <center><h2>Olá {this.state.usuarioLogado.nome}</h2></center>
                    </div>
                    <button className="btn btn-error" onClick={() => this.sair()}>Sair</button>
                </If>
                <If test={this.state.erroLogin}>
                    <div style={({ width: '100%'})}>
                        <center><h2>Usuário/senha inválidos</h2></center>
                    </div>
                </If>

*/