import React from 'react'
import If from '../common/operator/if'
import { colorLine } from './aprovaAtaService.js'
import './aprovaAta.css'
import Row from  '../common/layout/row'
import Grid from '../common/layout/grid'

export default props => {
    return (
        <Row>
            <Grid cols="12">             
                <div className="box box-primary">
                    <div className="box-header with-border">
                        <h3 className="box-title">Secretário e empresa recuperanda</h3>

                        <div className="box-tools pull-right">
                            <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i></button>
                        </div>
                    </div>
                    <div className="box-body chart-responsive">
                        <table className='table table-hover'>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Assinou</th>
                                </tr>
                            </thead>
                            <tbody>
                            <If test={props.nomeSecretario}>
                                <tr key={props.nomeSecretario} className={colorLine(props.votoSecretario)}>
                                    <td>Secretário - {props.nomeSecretario}</td>
                                    <td>{props.votoSecretario ? 'Assinou' : 'Reprovou'}</td>
                                </tr>
                            </If>
                            <If test={props.nomeEmpresaRecuperanda}>
                                <tr key={props.nomeEmpresaRecuperanda} className={colorLine(props.votoEmpresaRecuperanda)}>
                                    <td>Recuperanda - {props.nomeEmpresaRecuperanda}</td>
                                    <td>{props.votoEmpresaRecuperanda ? 'Assinou' : 'Reprovou'}</td>
                                </tr>
                            </If>
                            </tbody>
                        </table>
                    </div>
                </div> 
            </Grid>
        </Row>          

    )
}