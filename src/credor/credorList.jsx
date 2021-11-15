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
                    <th style={({ width: '40%' })}>Nome</th>
                    <th style={({ width: '250px' })}>Classe</th>
                    <th style={({ width: '120px' })}>Cpf/Cnpj</th>
                    <th style={{ textAlign: 'right', width: '100px' }}>Crédito</th>
                    <th>Procurador</th>
                    <th style={({ width: '50px' })}>Votou</th>
                    <th style={({ width: '80px' })}>Confirmou</th>
                </tr>
            </thead>
            <tbody>
                {renderRows()}
                <tr key="total" className="info">
                    <td></td>
                    <td><b>Total</b></td>
                    <td></td>
                    <td></td>
                    <td style={{ textAlign: 'right' }}><b>{((props.list || []).map(p => p.valor).reduce((a, b) => a + b, 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</b></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>                
            </tbody>
        </table>
    )
}