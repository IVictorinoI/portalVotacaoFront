import React, { Component } from 'react'
import './contato.css'

export default class Classe extends Component {

    constructor(props){
        super(props);

        this.state = { list: [], loading: false }
    }

    render() {
        return (
            <div className='conteudo-principal-com-rolagem'>
                <div className="login-logo contato-logo-style"><img src="./logo_login.png" alt="Votação gladius" width="256" height="115"></img></div>
                <div>
                    <p className="login-box-msg login-title-font">Entre em contato com a Administração Judicial através das vias abaixo: </p>
                    <center>
                        <table className="table-contacts-style">
                        <tr>
                            <td width="100"><b>Telefones:</b></td>
                            <td>(48) 3433-8525</td>
                        </tr>
                        <tr>
                            <td width="100"></td>
                            <td>(48) 9102-5411 – WhatsApp</td>
                        </tr>
                        <tr>
                            <td width="100"><b>E-mail:</b></td>
                            <td>atendimento@gladiusconsultoria.com.br</td>
                        </tr>
                        </table>
                    </center>                    
                </div>
            </div>
        );
    }
}