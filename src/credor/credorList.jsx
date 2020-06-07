import React from 'react'
import './credor.css'

export default props => {


    const classNameRow = (credor) => {
        if(credor.votou)
            return 'info'
        if(credor.confirmou)
            return 'success'

        return 'active';
    }

    const renderRows = () => {
        const list = props.list || []
        
        return list.map(todo => (
            <tr key={todo._id} className={classNameRow(todo)}>
                <td>{todo.online ? <div className='bola'></div> : <div></div>}</td>
                <td>{todo.nome}</td>
                <td>{todo.descricaoClasse}</td>
                <td>{todo.cpfCnpj}</td>
                <td style={{ textAlign: 'right' }}>{todo.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td>{todo.nomeProcurador}</td>
                <td>{todo.votou ? "Sim" : "Não"}</td>
                <td>{todo.confirmou ? "Sim" : "Não"}</td>
            </tr>
        ))
    }

    return (
        <table className='table table-hover'>
            <thead>
                <tr>
                    <th></th>
                    <th>Nome</th>
                    <th>Classe</th>
                    <th>Cpf/Cnpj</th>
                    <th>Crédito</th>
                    <th>Procurador</th>
                    <th>Votou</th>
                    <th>Confirmou</th>
                </tr>
            </thead>
            <tbody>
                {renderRows()}
            </tbody>
        </table>
    )
}