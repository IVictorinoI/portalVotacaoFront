import React from 'react'
import './auth.css'

export default props => {
    return (
        <div>
            <p className="login-box-msg login-title-font">Caso não consiga acessar o sistema, entre em contato com a Administração Judicial através das vias abaixo: </p>
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
    )
}