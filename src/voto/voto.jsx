import React, { Component } from 'react'
import axios from 'axios'

import List from './votoList'

export default class Voto extends Component {
    getUrl() {
        return window.Params.URL_API+'votos/?codigoAssembleia='+window.Params.codigoAssembleiaAtiva;
    }

    constructor(props){
        super(props);

        this.state = { list: [] }

        this.refresh();
    }

    refresh(description) {
        let search = description ? `&nomeCredor__regex=/${description}/` : ''

        axios.get(`${this.getUrl()}&sort=-ordem${search}`)
            .then(resp => this.setState({...this.state, list: resp.data}));
    }
    
    render() {
        const keyHandler = (e) => {
            if (e.key === 'Enter') {
                this.refresh(e.target.value);
            }
        }

        return (
            <div>
                <input id='description' className='form-control'
                    onKeyUp={keyHandler}
                    placeholder='Pesquise o credor'></input>
                <List list={this.state.list}/>
            </div>
        );
    }
}