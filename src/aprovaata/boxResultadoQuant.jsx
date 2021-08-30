import React from 'react'
import If from '../common/operator/if'
import Grid from '../common/layout/grid'
import { colorCardAprovacao } from './aprovaAtaService.js'
import './aprovaAta.css'

export default props => {
    return (
            <If test={props.quantConf}>
                <Grid cols="3">
                    <div className={colorCardAprovacao(props.quant, props.quantConf)}>
                        <div className="inner">
                        <h3>{props.quant}</h3>
                        <span>de {props.quantConf} dos credores presentes</span>
                        <p>{props.descricao}</p>
                        </div>
                        <div className="icon">  
                        <i className="ion ion-stats-bars"></i>
                        </div>
                    </div>
                </Grid>
            </If>
    )
}