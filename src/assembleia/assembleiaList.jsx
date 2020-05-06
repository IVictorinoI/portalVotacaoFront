import React from 'react'

export default props => {

    const renderRows = () => {
        const list = props.list || []
        return list.map(todo => (
            <tr key={todo._id}>
                <td>{todo.descricao}</td>
                <td>{todo.assunto}</td>
                <td>{todo.data}</td>
                <td>{todo.ativo ? 'Sim' : 'Não'}</td>
            </tr>
        ))
    }

    return (
        <table className='table table-hover'>
            <thead>
                <tr>
                    <th>Descrição</th>
                    <th>Assunto</th>
                    <th>Data</th>
                    <th>Ativa</th>
                </tr>
            </thead>
            <tbody>
                {renderRows()}
            </tbody>
        </table>
    )
}