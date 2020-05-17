import React, { Component } from 'react'
import axios from 'axios'
import If from '../common/operator/if'
import Loading from '../common/components/Loading'
import List from './credorList'

export default class Credor extends Component {
    getUrl() {
        return window.Params.URL_API+'credores/?codigoAssembleia='+window.Params.codigoAssembleiaAtiva;
    }

    constructor(props){
        super(props);

        this.state = { list: [], loading: false }

    }

    componentDidMount() {
        this.refresh();
    }

    refresh(description) {
        const search = description ? `&nome__regex=/${description}/` : ''
        this.setState({...this.state, loading: true})
        axios.get(`${this.getUrl()}&sort=-_id${search}`)
            .then(resp => this.setState({...this.state, list: resp.data, loading: false}));
    }
    
    render() {
        const keyHandler = (e) => {
            if (e.key === 'Enter') {
                this.refresh(e.target.value);
            }
        }

        return (
            <div>
                <If test={this.state.loading}>
                    <center><Loading color="#3C8DBC" /></center>
                </If>
                <If test={!this.state.loading}>
                    <div>
                        <input id='description' className='form-control'
                            onKeyUp={keyHandler}
                            placeholder='Pesquise o credor'></input>
                        <List style={({ marginButton: '5.5rem' })} list={this.state.list}/>
                    </div>
                </If>
            </div>
        );
    }
}