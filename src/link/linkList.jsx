import React from 'react'

export default props => {

    const renderRows = () => {
        const list = props.list || []
        return list.map(todo => (
            <tr key={todo._id}>
                <td>{todo.descricao}</td>
                <td><a href={todo.url} target="_blank">{todo.url}</a></td>
                <td>
                    <button className='btn btn-warning' onClick={() => props.edit(todo)}>
                        <i className='fa fa-edit'></i>
                    </button>
                    <button className='btn btn-danger' onClick={() => props.delete(todo)}>
                            <i className='fa fa-trash'></i>
                    </button>                    
                </td>         
            </tr>
        ))
    }

    return (
        <table className='table table-hover'>
            <thead>
                <tr>
                    <th>Descrição</th>
                    <th>Link</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                {renderRows()}
            </tbody>
        </table>
    )
}