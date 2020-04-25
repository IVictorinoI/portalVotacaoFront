import React from 'react'
import If from '../common/operator/if'

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

    const renderRows = () => {
        const list = props.list || []
        return list.map(todo => (
            <tr key={todo._id}>
                <td>{todo.nomeCredor}</td>
                <td>{todo.descricaoClasse}</td>
                <td>{todo.cpfCnpj}</td>
                <td style={{ textAlign: 'right' }}>{todo.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td>{todo.nomeProcurador}</td>
                <td>
                    <If test={todo.tipo}>
                        <td>{renderVoto(todo.tipo)}</td>
                    </If>
                    <If test={!todo.tipo}>
                        <button className='btn btn-success' onClick={() => props.votar(todo, 'S')}>Sim</button>
                    </If>
                    <If test={!todo.tipo}>
                        <button className='btn btn-danger' onClick={() => props.votar(todo, 'N')}>Não</button>
                    </If>
                    <If test={!todo.tipo}>
                        <button className='btn btn-warning' onClick={() => props.votar(todo, 'A')}>Abstenção</button>
                    </If>
                    
                </td>
            </tr>
        ))
    }

    return (
        <table className='table'>
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Classe</th>
                    <th>Cpf/Cnpj</th>
                    <th>Crédito</th>
                    <th>Procurador</th>
                    <th>Voto</th>
                </tr>
            </thead>
            <tbody>
                {renderRows()}
            </tbody>
        </table>
    )
}