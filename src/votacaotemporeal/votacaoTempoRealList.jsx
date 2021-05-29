import React from 'react'
import { convertStringToTime } from '../common/util/dateTimeConversor'

export default props => {
    const renderVoto = (opc) => {
        if(opc === 'S')
            return 'Sim'
        if(opc === 'N')
            return 'Não'
        if(opc === 'A')
            return 'Abstenção';

        return null;
    }

    const classNameRow = (opc) => {
        if(opc === 'S')
            return 'success'
        if(opc === 'N')
            return 'danger'
        if(opc === 'A')
            return 'active';

        return '';
    }

    const renderRows = () => {
        const list = props.list || []
        return list.map(todo => (
            <tr key={todo._id} className={classNameRow(todo.tipo)}>
                <td scope="row">{todo.nomeCredor}</td>
                <td style={{ textAlign: 'right' }}>{todo.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td style={{ textAlign: 'right' }}>{todo.percentualClasse.toLocaleString('pt-BR', { style: 'decimal', minimumFractionDigits: 4, maximumFractionDigits: 6 })}</td>
                <td>{todo.descricaoClasse}</td>
                <td>{renderVoto(todo.tipo)}</td>
                <td>{convertStringToTime(todo.data)}</td>
                <td>{todo.nomeProcurador}</td>
            </tr>
        ))
    }

    return (
        <table className='table table-hover'>
            <thead>
                <tr>
                    <th scope="col">Nome</th>
                    <th scope="col">Valor</th>
                    <th scope="col">Percentual</th>
                    <th scope="col">Classe</th>
                    <th scope="col">Voto</th>
                    <th scope="col">Horário</th>
                    <th scope="col">Procurador</th>
                </tr>
            </thead>
            <tbody>
                {renderRows()}
            </tbody>
        </table>
    )
}