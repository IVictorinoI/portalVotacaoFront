import React from 'react'
import './aprovaAta.css'
import BoxResultadoQuant from './boxResultadoQuant'

export default props => {
    return (
        <div className="box box-primary">
            <div className="box-header with-border">
                <h3 className="box-title">Resultado de assinadores da ata</h3>

                <div className="box-tools pull-right">
                    <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i></button>
                </div>
            </div>
            <div className="box-body chart-responsive box-botoes-aprovacao">
            <BoxResultadoQuant 
                quantConf={props.quantConfTrabalhista}
                quant={props.quantTrabalhista}
                descricao={props.descricaoTrabalhista}
            />
            <BoxResultadoQuant 
                quantConf={props.quantConfGarantiaReal}
                quant={props.quantGarantiaReal}
                descricao={props.descricaoGarantiaReal}
            />
            <BoxResultadoQuant 
                quantConf={props.quantConfQuirografario}
                quant={props.quantQuirografario}
                descricao={props.descricaoQuirografario}
            />
            <BoxResultadoQuant 
                quantConf={props.quantConfMeEpp}
                quant={props.quantMeEpp}
                descricao={props.descricaoMeEpp}
            />
            </div>
        </div>
    )
}