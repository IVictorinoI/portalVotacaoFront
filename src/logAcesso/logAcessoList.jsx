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
            <tr key={todo._id} className={classNameRow(todo.tipo)}>
                <td>{todo.nome}</td>
                <td>{renderTime(todo.data)}</td>
                <td>{todo.tipo == 0 ? 'Login' : 'Logout'}</td>
            </tr>
        ))
    }

    const classNameRow = (tipo) => {
        if(tipo === 0)
            return 'success'
        if(tipo === 1)
            return 'danger'

        return '';
    }

    return (
        <table className='table table-hover'>
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Hora</th>
                    <th>Operação</th>
                </tr>
            </thead>
            <tbody>
                {renderRows()}
            </tbody>
        </table>
    )
}