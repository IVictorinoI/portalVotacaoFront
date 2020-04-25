import React, { Component } from 'react'
import axios from 'axios'

import List from './classeList'

export default class Classe extends Component {
    getUrl() {
        return window.Params.URL_API+'classes';
    }

    constructor(props){
        super(props);

        this.state = { list: [] }

        this.refresh();
    }

    refresh() {
        axios.get(`${this.getUrl()}?sort=-_id`)
            .then(resp => this.setState({...this.state, list: resp.data}));
    }
    
    render() {
        return (
            <div>
                <List list={this.state.list}/>
            </div>
        );
    }
}