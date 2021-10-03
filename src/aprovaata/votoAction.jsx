import React from 'react'
import { toastr } from 'react-redux-toastr'
import axios from 'axios'
import './aprovaAta.css'
import Row from  '../common/layout/row'
import Grid from '../common/layout/grid'


export default props => {
    const getUrl = function() {
        return window.Params.URL_API+'aprovaAtas/';
    }

    const aprovarAta = function() {
        axios.post(`${getUrl()}aprovar`)
        .then(resp => {
            toastr.success('Sucesso', 'Você aprovou a ata')
            window.socketIo.emit('aprovarata')
        })
        .catch(e => {
            e.response.data.errors.forEach(error => toastr.error('Erro', error))
        })
    }

    return (
        <Row>
            <Grid cols="12">         
                <div className="box box-primary">
                    <div className="box-header with-border">
                        <h3 className="box-title">Você assina a ata?</h3>

                        <div className="box-tools pull-right">
                            <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i></button>
                        </div>
                    </div>
                    <div className="box-body chart-responsive box-botoes-aprovacao">
                        <button style={({ marginRight: '1rem' })} className='btn btn-success btn-lg' disabled={!props.podeAta} onClick={() => aprovarAta()}>Assinar ata</button>
                    </div>
                </div>
            </Grid>
        </Row>        
    )
}