import React, { Component } from 'react'
import axios from 'axios'

import List from './votacaoTempoRealList'

export default class VotacaoTempoReal extends Component {
    getUrl() {
        return window.Params.URL_API+'votos/?codigoAssembleia='+window.Params.codigoAssembleiaAtiva;
    }

    constructor(props){
        super(props);

        this.state = { list: [], ultimaOrdem: 0 }

        this.refresh();
    }

    componentWillUnmount() {
        this.refresh = () => {}
    }

    refresh() {
        var ultimaOrdem = this.state.ultimaOrdem

        axios.get(`${this.getUrl()}&ordem__gt=${ultimaOrdem}&sort=-ordem`)
            .then(resp => {
                const listaAtual = this.state.list
                const novosRegistros = resp.data;
                
                Array.prototype.push.apply(novosRegistros, listaAtual)

                this.setState({...this.state, list: novosRegistros})

                if(resp.data && resp.data.length){
                    listaAtual.forEach((dto) => {
                        if(dto.ordem>ultimaOrdem)
                          ultimaOrdem=dto.ordem
                    });
                    this.setState({ ...this.state, ultimaOrdem: ultimaOrdem});
                }

                setTimeout(() => {
                    this.refresh()
                }, 3000);
            });
    }
    
    render() {
        return (
            <div className='conteudo-principal-com-rolagem'>
                <List list={this.state.list}/>
            </div>
        );
    }
}