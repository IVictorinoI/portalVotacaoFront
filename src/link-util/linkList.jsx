import React from 'react'

export default props => {

    const renderRows = () => {
        const list = props.list || []
        return list.map(todo => (
            <tr key={todo._id}>
                <td>{todo.descricao}</td>
                <td><a href={todo.url} target="_blank">{todo.url}</a></td>
            </tr>
        ))
    }

    return (
        <table className='table table-hover'>
            <thead>
                <tr>
                    <th>Descrição</th>
                    <th>Link</th>
                </tr>
            </thead>
            <tbody>
                {renderRows()}
            </tbody>
        </table>
    )
}