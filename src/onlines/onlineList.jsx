import React from 'react'

export default props => {

    const renderRows = () => {
        const list = props.list || []
        return list.map(todo => (
            <tr key={todo.id}>
                <td>{todo.nome}</td>
                <td>
                    <button className='btn btn-danger' 
                        onClick={() => props.expulsar(todo)}>
                            Expulsar
                    </button>
                </td>
            </tr>
        ))
    }

    return (
        <table className='table table-hover'>
            <thead>
                <tr>
                    <th>Online agora</th>
                </tr>
            </thead>
            <tbody>
                {renderRows()}
            </tbody>
        </table>
    )
}