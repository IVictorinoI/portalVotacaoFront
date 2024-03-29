import React from 'react'

export default props => {

    const formataValor = valor => {
        return (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }

    const formataPerc = perc => {
        return (perc || 0).toLocaleString('pt-BR', { style: 'decimal', minimumFractionDigits: 4, maximumFractionDigits: 6 }) + "%"
    }

    const formataQuant = quant => {
        return quant
    }

    const deveRetornarApenasValor = todo => {
        return (todo.tipoResultado === 'V' && (todo.codigoClasse == 1 || todo.codigoClasse == 4))
    }

    const deveRetornarApenasQuant = todo => {
        return (todo.tipoResultado !== 'V' && (todo.codigoClasse == 1 || todo.codigoClasse == 4))
    }

    const renderValorSim = todo => {
        if(deveRetornarApenasValor(todo))
            return formataValor(todo.valorSim)

        if(deveRetornarApenasQuant(todo))
            return formataQuant(todo.quantSim)

        return <div><div>{formataValor(todo.valorSim)}</div><div>{formataQuant(todo.quantSim)}</div></div>
    }

    const renderValorNao = todo => {
        if(deveRetornarApenasValor(todo))
            return formataValor(todo.valorNao)

        if(deveRetornarApenasQuant(todo))
            return formataQuant(todo.quantNao)

        return <div><div>{formataValor(todo.valorNao)}</div><div>{formataQuant(todo.quantNao)}</div></div>
    }

    const renderValorAbs = todo => {
        if(deveRetornarApenasValor(todo))
            return formataValor(todo.valorAbs)

        if(deveRetornarApenasQuant(todo))
            return formataQuant(todo.quantAbs)

        return <div><div>{formataValor(todo.valorAbs)}</div><div>{formataQuant(todo.quantAbs)}</div></div>
    }

    const renderPercSim = todo => {
        if(deveRetornarApenasValor(todo))
            return formataPerc(todo.percValorSim)

        if(deveRetornarApenasQuant(todo))
            return formataPerc(todo.percQuantSim)

        return <div><div>{formataPerc(todo.percValorSim)}</div><div>{formataPerc(todo.percQuantSim)}</div></div>
    }

    const renderPercNao = todo => {
        if(deveRetornarApenasValor(todo))
            return formataPerc(todo.percValorNao)

        if(deveRetornarApenasQuant(todo))
            return formataPerc(todo.percQuantNao)

        return <div><div>{formataPerc(todo.percValorNao)}</div><div>{formataPerc(todo.percQuantNao)}</div></div>
    }

    const renderRows = () => {
        const list = props.list || []
        return list.map(todo => (
            <tr key={todo._id}>
                <td>{todo.descricaoClasse}</td>
                <td style={{ textAlign: 'right' }}>{formataValor(todo.valorCredito)}</td>
                <td style={{ textAlign: 'right' }}>{formataQuant(todo.quantCredores)}</td>
                <td style={{ textAlign: 'right' }}>{renderValorSim(todo)}</td>
                <td style={{ textAlign: 'right' }}>{renderValorNao(todo)}</td>
                <td style={{ textAlign: 'right' }}>{renderValorAbs(todo)}</td>
                <td style={{ textAlign: 'right', backgroundColor: todo.percValorSim>todo.percValorNao ? '#f39c12' : null }}>{renderPercSim(todo)}</td>
                <td style={{ textAlign: 'right', backgroundColor: todo.percValorNao>todo.percValorSim ? '#f39c12' : null }}>{renderPercNao(todo)}</td>
            </tr>
        ))
    }

    return (
        <table className='table table-hover'>
            <thead>
                <tr>
                    <th>Classe</th>
                    <th style={{ textAlign: 'right' }}>Valor crédito</th>
                    <th style={{ textAlign: 'right' }}>Credores</th>
                    <th style={{ textAlign: 'right' }}>Valor Sim</th>
                    <th style={{ textAlign: 'right' }}>Valor Não</th>
                    <th style={{ textAlign: 'right' }}>Valor Abs</th>
                    <th style={{ textAlign: 'right' }}>SIM (%)</th>
                    <th style={{ textAlign: 'right' }}>NÃO (%)</th>
                </tr>
            </thead>
            <tbody>
                
                {renderRows()}
            </tbody>
        </table>
        
    )
}