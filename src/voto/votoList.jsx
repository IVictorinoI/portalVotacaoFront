import React from 'react'

export default props => {

    const renderTime = (date) => {
        return date.substr(11, 8);
    }

    const renderVoto = (opc) => {
        if(opc === 'S')
            return 'Sim'
        if(opc === 'N')
            return 'Não'
        if(opc === 'A')
            return 'Abstenção';

        return null;
    }

    const renderRows = () => {
        const list = props.list || []
        return list.map(todo => (
            <tr key={todo._id}>
                <td>{todo.nomeCredor}</td>
                <td style={{ textAlign: 'right' }}>{todo.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td style={{ textAlign: 'right' }}>{todo.percentualClasse.toLocaleString('pt-BR', { style: 'decimal', minimumFractionDigits: 4, maximumFractionDigits: 6 })}</td>
                <td>{todo.descricaoClasse}</td>
                <td>{renderVoto(todo.tipo)}</td>
                <td>{renderTime(todo.data)}</td>
                <td>{todo.nomeProcurador}</td>
            </tr>
        ))
    }

    return (
        <table className='table'>
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Valor</th>
                    <th>Percentual</th>
                    <th>Classe</th>
                    <th>Voto</th>
                    <th>Horário</th>
                    <th>Procurador</th>
                </tr>
            </thead>
            <tbody>
                {renderRows()}
            </tbody>
        </table>
    )
}