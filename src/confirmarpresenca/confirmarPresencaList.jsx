import React from 'react'

export default props => {
    const renderRows = () => {
        const list = props.list || []
        return list.map(todo => (
            <tr key={todo._id}>
                <td>{todo.nome}</td>
                <td>{todo.descricaoClasse}</td>
                <td>{todo.cpfCnpj}</td>
                <td style={{ textAlign: 'right' }}>{todo.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td>{todo.nomeProcurador}</td>
                <td>
                    <button className='btn btn-success' 
                        disabled={!props.assembleia.podeConfirmar}
                        onClick={() => props.confirmarPresenca(todo)}>
                            Confirmar
                    </button>
                </td>
            </tr>
        ))
    }

    return (
        <table className='table table-hover'>
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Classe</th>
                    <th>Cpf/Cnpj</th>
                    <th>Crédito</th>
                    <th>Procurador</th>
                    <th>Confirmar</th>
                </tr>
            </thead>
            <tbody>
                {renderRows()}
            </tbody>
        </table>
    )
}