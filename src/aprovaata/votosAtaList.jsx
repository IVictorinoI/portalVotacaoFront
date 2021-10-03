import React from 'react'
import If from '../common/operator/if'
import Row from  '../common/layout/row'
import Grid from '../common/layout/grid'
import List from './aprovaAtaList'
import './aprovaAta.css'

export default props => {
    return (
        <If test={props.list.length}>
            <Row>
                <Grid cols="12">                
                <div className="box box-primary">
                    <div className="box-header with-border">
                        <h3 className="box-title">{props.descricao}</h3>

                        <div className="box-tools pull-right">
                            <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i></button>
                        </div>
                    </div>
                    <div className="box-body chart-responsive">
                    <List style={({ marginButton: '5.5rem' })} list={props.list}/>
                    </div>
                </div> 
                </Grid>                       
            </Row>
        </If>
    )
}