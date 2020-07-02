import React from 'react'
import If from '../common/operator/if'

export default props => {

    const renderTime = (date) => {
        var data = new Date(date);

        var dataStr = data.toLocaleTimeString('pt-BR')
        
        return dataStr;
    }

    const renderRows = () => {
        const list = props.list || []
        return list.map(todo => (
            <tr key={todo._id}>
                <td>{todo.mensagem}</td>
                <td>{todo.tipo}</td>
                <td>{renderTime(todo.data)}</td>
                <td style={{textAlign:'right'}}>
                    <If test={todo.lido}>
                    <button className='btn btn-warning' 
                            onClick={() => props.marcarComoLido(todo, false)}>
                                Não lido
                        </button>
                    </If>
                    <If test={!todo.lido}>
                        <button className='btn btn-success' 
                            onClick={() => props.marcarComoLido(todo, true)}>
                                Lido
                        </button>
                    </If>
                    
                </td>
            </tr>
        ))
    }

    return (
        <table className='table table-hover'>
            <thead>
                <tr>
                    <th>Mensagem</th>
                    <th>Tipo</th>
                    <th>Hora</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {renderRows()}
            </tbody>
        </table>
    )
}