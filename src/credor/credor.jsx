import React, { Component } from 'react'
import axios from 'axios'

import List from './credorList'

export default class Credor extends Component {
    getUrl() {
        return window.Params.URL_API+'credores/?codigoAssembleia='+window.Params.codigoAssembleiaAtiva;
    }

    constructor(props){
        super(props);

        this.state = { list: [] }

        this.refresh();
    }

    refresh(description) {
        const search = description ? `&nome__regex=/${description}/` : ''

        axios.get(`${this.getUrl()}&sort=-_id${search}`)
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
                <List style={({ marginButton: '5.5rem' })} list={this.state.list}/>
            </div>
        );
    }
}