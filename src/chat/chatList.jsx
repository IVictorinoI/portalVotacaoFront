import './chat.css'
import React from 'react'
import If from '../common/operator/if'

export default props => {

    const renderTime = (date) => {
        var data = new Date(date);

        var dataStr = data.toLocaleTimeString('pt-BR')
        
        return dataStr;
    }

    const renderRows = () => {
        const usuario = JSON.parse(localStorage.getItem('_application_user'))
        const list = props.list || []
        return list.map(todo => (
            <div className="chatdiv" key={todo._id}>
                <If test={todo.idUsuario==usuario.id}>
                    <div className="response">
                        <div> 
                            <strong>{todo.nomeCredor}</strong> {renderTime(todo.data)}
                            <p>{todo.msg}</p>
                        </div>
                    </div>
                </If>
                <If test={todo.idUsuario!=usuario.id}>
                    <div className="request">
                        <div> 
                            <strong>{todo.nomeCredor}</strong> {renderTime(todo.data)}
                            <p>{todo.msg}</p>
                        </div>
                    </div>
                </If>
            </div>
        ))
    }

    return (
        <div className="container-chat">
            <div className="chatBox" id="chatBox">
                    {renderRows()}                    
            </div>
        </div>
    )
}