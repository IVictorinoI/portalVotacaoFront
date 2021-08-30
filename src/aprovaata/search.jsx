import React from 'react'
import './aprovaAta.css'

export default props => {
    return (
        <div className="box box-primary">
            <div className="box-header with-border">
                <h3 className="box-title">Pesquisa</h3>
                <div className="box-tools pull-right">
                    <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i></button>
                </div>
            </div>
            <div className="box-body chart-responsive">
            <input id='description' className='form-control'
                onKeyUp={props.keyHandler}
                placeholder='Pesquise o credor'></input>
            </div>
        </div> 
    )
}