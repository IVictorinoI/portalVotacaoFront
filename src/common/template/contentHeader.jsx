import React from 'react'

export default props => (
    <section className='content-header'>
        <div className="divline">
            <center>
                <h2>{props.title}</h2>
                <h4>{props.small}</h4>
            </center>
        </div>
        <div className="divright">

            <div className="card">
            <ul className="list-group list-group-flush">
                <li className="list-group-item carditem"><b>Previsão de início</b></li>
                <li className="list-group-item carditem">Credenciamento <b>{props.inicioConfPres}</b></li>
                <li className="list-group-item carditem">Início da Assembéia <b>{props.inicioVotacao}</b></li>
            </ul>
        </div>

        </div>
    </section>
)



{/*<section className='content-header'>
<h1>{props.title}</h1><h4>{props.small}</h4>
<div className="divred">tste</div>

</section>*/}