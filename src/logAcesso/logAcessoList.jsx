import React from 'react'
import { convertStringToTime } from '../common/util/dateTimeConversor'

export default props => {
    const renderRows = () => {
        const list = props.list || []
        return list.map(todo => (
            <tr key={todo._id} className={classNameRow(todo.tipo)}>
                <td>{todo.nome}</td>
                <td>{convertStringToTime(todo.data)}</td>
                <td>{convertStringToTime(todo.dataUltimoAcesso)}</td>
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
                    <th>Hora login</th>
                    <th>Ultimo acesso</th>
                    <th>Operação</th>
                </tr>
            </thead>
            <tbody>
                {renderRows()}
            </tbody>
        </table>
    )
}