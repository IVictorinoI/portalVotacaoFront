import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { getSummary, getAssembleiaAtiva } from './dashboardActions'
import ContentHeader from '../common/template/contentHeader'
import Content from '../common/template/content'
import ValueBox from  '../common/widget/valueBox'
import Row from  '../common/layout/row'


class Dashboard extends Component {

    componentWillMount() {
        this.props.getSummary()
        this.props.getAssembleiaAtiva()
    }    

    render() {
        const { quorum, votos, quorum2, votos2 } = this.props.summary
        const { assembleia } = this.props;



        const renderQuorumRows = () => {
            const list = quorum2 || []
            return list.map(todo => {
                if(todo.descricaoClasse === '.')
                    return;


                let percentual = (+(100 / todo.valorEsperado * todo.valorConfirmado) || 0).toFixed(6);
                let cor = 'red';
                if(percentual==0)
                    cor = 'red';
                else if(percentual<100)
                    cor = 'yellow'
                else 
                    cor = 'green'

                return (<ValueBox key={todo.codigoClasse+'Q'} cols='12 3' color={cor} icon='bank'
                    valorConfirmado={`${todo.valorConfirmado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} 
                    percentual={`${percentual.toLocaleString('pt-BR', { style: 'decimal', currency: 'BRL', maximumFractionDigits:0 })}%`} 
                    text={todo.descricaoClasse} />)
            })
        }

        const renderVotosRows = () => {
            const list = votos2 || []
            return list.map(todo => {
                if(todo.descricaoClasse === '.')
                    return;

                let percentual = (+(100 / todo.valorEsperado * todo.valorConfirmado) || 0).toFixed(6);
                let cor = 'red';
                if(percentual==0)
                    cor = 'red';
                else if(percentual<100)
                    cor = 'yellow'
                else 
                    cor = 'green'

                return (<ValueBox key={todo.codigoClasse+'V'} cols='12 3' color={cor} icon='bank'
                    valorConfirmado={`${todo.valorConfirmado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} 
                    percentual={`${percentual.toLocaleString('pt-BR', { style: 'decimal', currency: 'BRL', maximumFractionDigits:0 })}%`} 
                    text={todo.descricaoClasse} />)
            })
        }       

        const formataHora = (dataHora) => {
            if(!dataHora)
                return;

            let data = new Date(Date.parse(dataHora.substr(0,19)));            
            return data.toLocaleString('pt-BR', {timeStyle:'medium'})
        }

        return (
            <div> 
                <ContentHeader 
                    title={`${assembleia.descricao}`} 
                    small={`${assembleia.assunto}`} 
                    inicioConfPres={`${formataHora(assembleia.inicioConfPres)}`} 
                    inicioVotacao={`${formataHora(assembleia.inicioVotacao)}`} 
                    />
                <Content>
                    <Row>
                        <h3 style={({ marginLeft: '1.5rem' })}>Verificação do quorum</h3>
                    </Row>
                    <Row>
                        {renderQuorumRows()}
                    </Row>
                    <Row>
                        <h3 style={({ marginLeft: '1.5rem' })}>Verificação dos votos</h3>
                    </Row>
                    <Row>
                        {(renderVotosRows())}
                    </Row>
                </Content> 
            </div>
        )


    }
}

const mapStateToProps = state => ({summary: state.dashboard.summary, assembleia: state.dashboard.assembleia})
const mapDispatchToProps = dispatch => bindActionCreators({getSummary, getAssembleiaAtiva}, dispatch)
export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)