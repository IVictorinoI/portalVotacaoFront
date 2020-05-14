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
        const { quorum, votos } = this.props.summary
        const { assembleia } = this.props;

        const formataHora = (dataHora) => {
            if(!dataHora)
                return;

            let data = new Date(Date.parse(dataHora.substr(0,19)));            
            return data.toLocaleString('pt-BR', {timeStyle:'medium'})
        }

        return (
            <div> 
                <ContentHeader 
                    title={`${assembleia.assunto}`} 
                    small={`${assembleia.descricao}`} 
                    inicioConfPres={`${formataHora(assembleia.inicioConfPres)}`} 
                    inicioVotacao={`${formataHora(assembleia.inicioVotacao)}`} 
                    />
                <Content>
                    <Row>
                        <h3 style={({ marginLeft: '1.5rem' })}>Verificação do quorum</h3>
                    </Row>
                    <Row> 
                        <ValueBox cols='12 3' color='green' icon='bank'
                            //valorEsperado={`${quorum.trabalhista.valorEsperado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} 
                            valorConfirmado={`${quorum.trabalhista.valorConfirmado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} 
                            percentual={`${(100 / quorum.trabalhista.valorEsperado * quorum.trabalhista.valorConfirmado).toLocaleString('pt-BR', { style: 'decimal', currency: 'BRL', maximumFractionDigits:0 })}%`} 
                            text='Trabalhista' />
                        <ValueBox cols='12 3' color='red' icon='credit-card'
                            //valorEsperado={`${quorum.garantiaReal.valorEsperado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} 
                            valorConfirmado={`${quorum.garantiaReal.valorConfirmado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} 
                            percentual={`${(100 / quorum.garantiaReal.valorEsperado * quorum.garantiaReal.valorConfirmado).toLocaleString('pt-BR', { style: 'decimal', currency: 'BRL', maximumFractionDigits:0 })}%`} 
                            text='Garantia real' />
                        <ValueBox cols='12 3' color='blue' icon='money'
                            //valorEsperado={`${quorum.quirografario.valorEsperado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} 
                            valorConfirmado={`${quorum.quirografario.valorConfirmado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} 
                            percentual={`${(100 / quorum.quirografario.valorEsperado * quorum.quirografario.valorConfirmado).toLocaleString('pt-BR', { style: 'decimal', currency: 'BRL', maximumFractionDigits:0 })}%`} 
                            text='Quirografário' />
                        <ValueBox cols='12 3' color='yellow' icon='money'
                            //valorEsperado={`${quorum.microEmpresa.valorEsperado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} 
                            valorConfirmado={`${quorum.microEmpresa.valorConfirmado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} 
                            percentual={`${(100 / quorum.microEmpresa.valorConfirmado * quorum.microEmpresa.valorConfirmado).toLocaleString('pt-BR', { style: 'decimal', currency: 'BRL', maximumFractionDigits:0 })}%`} 
                            text='ME/EPP' />
                    </Row> 
                    <Row>
                        <h3 style={({ marginLeft: '1.5rem' })}>Verificação dos votos</h3>
                    </Row>
                    <Row> 
                        <ValueBox cols='12 3' color='green' icon='bank'
                            //valorEsperado={`${votos.trabalhista.valorEsperado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} 
                            valorConfirmado={`${votos.trabalhista.valorConfirmado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} 
                            percentual={`${(100 / votos.trabalhista.valorEsperado * votos.trabalhista.valorConfirmado).toLocaleString('pt-BR', { style: 'decimal', currency: 'BRL', maximumFractionDigits:0 })}%`} 
                            text='Trabalhista' />
                        <ValueBox cols='12 3' color='red' icon='credit-card'
                            //valorEsperado={`${votos.garantiaReal.valorEsperado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} 
                            valorConfirmado={`${votos.garantiaReal.valorConfirmado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} 
                            percentual={`${(100 / votos.garantiaReal.valorEsperado * votos.garantiaReal.valorConfirmado).toLocaleString('pt-BR', { style: 'decimal', currency: 'BRL', maximumFractionDigits:0 })}%`} 
                            text='Garantia real' />
                        <ValueBox cols='12 3' color='blue' icon='money'
                            //valorEsperado={`${votos.quirografario.valorEsperado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} 
                            valorConfirmado={`${votos.quirografario.valorConfirmado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} 
                            percentual={`${(100 / votos.quirografario.valorEsperado * votos.quirografario.valorConfirmado).toLocaleString('pt-BR', { style: 'decimal', currency: 'BRL', maximumFractionDigits:0 })}%`} 
                            text='Quirografário' />
                        <ValueBox cols='12 3' color='yellow' icon='money'
                            //valorEsperado={`${votos.microEmpresa.valorEsperado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} 
                            valorConfirmado={`${votos.microEmpresa.valorConfirmado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} 
                            percentual={`${(100 / votos.microEmpresa.valorEsperado * votos.microEmpresa.valorConfirmado).toLocaleString('pt-BR', { style: 'decimal', currency: 'BRL', maximumFractionDigits:0 })}%`} 
                            text='ME/EPP' />
                    </Row> 
                </Content> 
            </div>
        )


    }
}

const mapStateToProps = state => ({summary: state.dashboard.summary, assembleia: state.dashboard.assembleia})
const mapDispatchToProps = dispatch => bindActionCreators({getSummary, getAssembleiaAtiva}, dispatch)
export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)