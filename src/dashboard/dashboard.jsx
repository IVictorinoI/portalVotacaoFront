import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { getSummary, getAssembleiaAtiva } from './dashboardActions'
import ContentHeader from '../common/template/contentHeader'
import Content from '../common/template/content'
import ValueBox from  '../common/widget/valueBox'
import Row from  '../common/layout/row'
import Grid from '../common/layout/grid'
import Chart from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'


class Dashboard extends Component {

    constructor(props) {
        super(props)

        this.refresh = this.refresh.bind(this)
        this.autoRefresh = this.autoRefresh.bind(this)
    }

    componentWillUnmount() {
        this.refresh = () => {}
        this.autoRefresh = () => {}
    }    

    componentWillMount() {
        this.props.getAssembleiaAtiva()    

        this.refresh()
        this.autoRefresh()
    }

    refresh() {
        this.props.getSummary()        
    }

    autoRefresh() {
        setTimeout(() => {
            this.refresh()
            this.autoRefresh()
        }, 2000)
    }

    refreshQuorumChartJs(){
        var ctx = document.getElementById('bar-chart-dashboard-quorum').getContext('2d');
        const classes = []
        const colors = []
        const borderColor = []
        const values = []
        const { quorum2 } = this.props.summary

        quorum2.forEach(todo => {
            if(todo.descricaoClasse === '.')
                return;
            if(!todo.valorEsperado)
                return;
                
            const percentual = (+(100 / todo.valorEsperado * todo.valorConfirmado) || 0).toFixed(6);

            if(percentual==0) {
                colors.push('rgba(255, 99, 132, 0.2)')
                borderColor.push('rgba(255, 99, 132, 1)')
            } else if(percentual<50) {
                colors.push('rgba(255, 206, 86, 0.2)')
                borderColor.push('rgba(255, 206, 86, 1)')
            } else { 
                colors.push('rgba(75, 192, 192, 0.2)')
                borderColor.push('rgba(75, 192, 192, 1)')
            }
            
            values.push(percentual)
            classes.push(todo.descricaoClasse)
        });

        var myChart = new Chart(ctx, {
            plugins: [ChartDataLabels],
            type: 'bar',
            data: {
                labels: classes,
                datasets: [{
                    label: '% dos presentes',
                    data: values,
                    backgroundColor: colors,
                    borderColor: borderColor,
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    datalabels: {
                        formatter: function(value, context) {
                            return (value * 1).toLocaleString('pt-BR', { style: 'decimal', currency: 'BRL', maximumFractionDigits:0 }) + '%';
                        }
                    }
                },
                animation: {
                    duration: 0
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            max: 100,
                            min: 0,
                            callback: function(value, index, values) {
                                return null/*value + ' %' */
                            }
                        }
                    }]
                }
            }
        });
    }   

    refreshVotosChartJs(){
        var ctx = document.getElementById('bar-chart-dashboard-votos').getContext('2d');
        const classes = []
        const colors = []
        const borderColor = []
        const values = []
        const { votos2 } = this.props.summary

        votos2.forEach(todo => {
            if(todo.descricaoClasse === '.')
                return;
            if(!todo.valorEsperado)
                return;
            
            const percentual = (+(100 / todo.valorEsperado * todo.valorConfirmado) || 0).toFixed(6);
            if(percentual==0) {
                colors.push('rgba(255, 99, 132, 0.2)')
                borderColor.push('rgba(255, 99, 132, 1)')
            } else if(percentual<50) {
                colors.push('rgba(255, 206, 86, 0.2)')
                borderColor.push('rgba(255, 206, 86, 1)')
            } else { 
                colors.push('rgba(75, 192, 192, 0.2)')
                borderColor.push('rgba(75, 192, 192, 1)')
            }
            
            values.push(percentual)
            classes.push(todo.descricaoClasse)
        });

        var myChart = new Chart(ctx, {
            plugins: [ChartDataLabels],
            type: 'bar',
            data: {
                labels: classes,
                datasets: [{
                    label: '% dos votos',
                    data: values,
                    backgroundColor: colors,
                    borderColor: borderColor,
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    datalabels: {
                        formatter: function(value, context) {
                            return (value * 1).toLocaleString('pt-BR', { style: 'decimal', currency: 'BRL', maximumFractionDigits:0 }) + '%';
                        }
                    }
                },

                animation: {
                    duration: 0
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            max: 100,
                            min: 0,
                            callback: function(value, index, values) {
                                return null//value + ' %' 
                            }
                        }
                    }]
                }
            }
        });
    }

    render() {
        const { quorum, votos, quorum2, votos2 } = this.props.summary
        const { assembleia } = this.props;

        setTimeout(() => {
            this.refreshQuorumChartJs()
            this.refreshVotosChartJs()
        }, 2000)        

        const renderQuorumRows = () => {
            const list = quorum2 || []
            return list.map(todo => {
                if(todo.descricaoClasse === '.')
                    return;


                let percentual = (+(100 / todo.valorEsperado * todo.valorConfirmado) || 0).toFixed(6);
                let cor = 'red';
                if(percentual==0)
                    cor = 'red';
                else if(percentual<50)
                    cor = 'yellow'
                else 
                    cor = 'green'

                return (<ValueBox key={todo.codigoClasse+'Q'} cols='12 3' color={cor} icon='bank'
                    valorConfirmado={`${todo.valorConfirmado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} 
                    infoValorConfirmado="Credores presentes"
                    valorEsperado={`${todo.valorEsperado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} 
                    infoValorEsperado="Credores sugeitos"
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
                else if(percentual<50)
                    cor = 'yellow'
                else 
                    cor = 'green'

                return (<ValueBox key={todo.codigoClasse+'V'} cols='12 3' color={cor} icon='bank'
                    valorConfirmado={`${todo.valorConfirmado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} 
                    infoValorConfirmado="Votos computados"
                    valorEsperado={`${todo.valorEsperado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} 
                    infoValorEsperado="Credores presentes"
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
            <div className='conteudo-principal-com-rolagem'>
                <ContentHeader 
                    title={`${assembleia.descricao}`} 
                    small={`${assembleia.assunto}`} 
                    inicioConfPres={`${formataHora(assembleia.inicioConfPres)}`} 
                    inicioVotacao={`${formataHora(assembleia.inicioVotacao)}`} 
                    />
                <Content>
                    <Row>
                        <Grid cols="12">
                        <div className="box box-primary">
                            <div className="box-header with-border">
                                <h3 className="box-title">Verificação do quorum</h3>

                                <div className="box-tools pull-right">
                                    <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i></button>
                                </div>
                            </div>
                            <div className="box-body chart-responsive">
                                <div className="chart">
                                    {renderQuorumRows()}
                                </div>
                            </div>
                        </div> 
                        </Grid>                       
                    </Row>
                    <Row>
                        <Grid cols="12">
                        <div className="box box-primary">
                            <div className="box-header with-border">
                                <h3 className="box-title">Verificação dos votos</h3>

                                <div className="box-tools pull-right">
                                    <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i></button>
                                </div>
                            </div>
                            <div className="box-body chart-responsive">
                                <div className="chart" >
                                {renderVotosRows()}
                                </div>
                            </div>
                        </div>
                        </Grid>
                    </Row>
                    <Row>
                        <Grid cols="6">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Gráfico de quorum</h3>

                                    <div className="box-tools pull-right">
                                        <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i></button>
                                    </div>
                                </div>
                                <div className="box-body chart-responsive">
                                    <canvas id="bar-chart-dashboard-quorum" width="400" height="400"></canvas>
                                </div>
                            </div>
                        </Grid>
                        <Grid cols="6">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Gráfico de votos</h3>

                                    <div className="box-tools pull-right">
                                        <button type="button" className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i></button>
                                    </div>
                                </div>
                                <div className="box-body chart-responsive">
                                    <canvas id="bar-chart-dashboard-votos" width="400" height="400"></canvas>
                                </div>
                            </div>
                        </Grid>                        
                    </Row>
                </Content> 
            </div>
        )
    }
}

const mapStateToProps = state => ({summary: state.dashboard.summary, assembleia: state.dashboard.assembleia})
const mapDispatchToProps = dispatch => bindActionCreators({ getSummary, getAssembleiaAtiva }, dispatch)
export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)