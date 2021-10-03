import React from 'react'
import { convertStringToTime } from '../common/util/dateTimeConversor'
import { colorLine } from './aprovaAtaService.js'

export default props => {
    const renderRows = () => {
        const list = props.list || []
        
        return list.map(todo => (
            <tr key={todo._id}  className={colorLine(todo.aprovou)}>
                <td>{todo.nomeCredor}</td>
                <td>{todo.nomeProcurador}</td>
                <td>{convertStringToTime(todo.data)}</td>
                <td>{todo.aprovou ? 'Assinou' : 'Reprovou'}</td>
            </tr>
        ))
    }   

    return (
        <table className='table table-hover'>
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Procurador</th>
                    <th>Hora</th>
                    <th>Assinou</th>
                </tr>
            </thead>
            <tbody>
                {renderRows()}
            </tbody>
        </table>
    )

}