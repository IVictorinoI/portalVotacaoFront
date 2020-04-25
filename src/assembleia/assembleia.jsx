import React, { Component } from 'react'
import axios from 'axios'

import List from './assembleiaList'

export default class Assembleia extends Component {
    getUrl() {
        return window.Params.URL_API+'assembleias?param=true';
    }

    constructor(props){
        super(props);

        this.state = { list: [] }

        this.refresh();
    }

    refresh(description) {
        const search = description ? `&descricao__regex=/${description}/` : ''

        axios.get(`${this.getUrl()}&sort=-ativo${search}`)
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
                    placeholder='Pesquise a assembléia'></input>
                <List list={this.state.list}/>
            </div>
        );
    }
}