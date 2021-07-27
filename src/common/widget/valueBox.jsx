import React from 'react'
import Grid from '../layout/grid'
import ReactTooltip from 'react-tooltip';

export default props => (
    <Grid cols={props.cols}> 
        <div className={`small-box bg-${props.color}`}> 
            <div className='inner'> 
                <p>{props.text}</p>
                <h4 data-tip={props.infoValorEsperado}>{props.valorEsperado} <font size="1">{props.infoValorEsperado}</font></h4>
                <h4 data-tip={props.infoValorConfirmado}>{props.valorConfirmado} <font size="1">{props.infoValorConfirmado}</font></h4>
                <h4>{props.percentual}</h4>                
            </div> 
            <div className='icon'> 
                <i className={`fa fa-${props.icon}`}></i>
            </div> 
            <ReactTooltip />
        </div> 
    </Grid> 
)