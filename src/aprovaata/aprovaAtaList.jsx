import React from 'react'

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
                <td>{todo.nomeCredor}</td>
                <td>{renderTime(todo.data)}</td>
                <td>{todo.aprovou ? 'Aprovou' : 'Reprovou'}</td>
            </tr>
        ))
    }

    return (
        <table className='table table-hover'>
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Data</th>
                    <th>Aprovou</th>
                </tr>
            </thead>
            <tbody>
                {renderRows()}
            </tbody>
        </table>
    )

}