const INITIAL_STATE = {
    summary: {
        quorum: {
            trabalhista: {
                valorEsperado: 0,
                valorConfirmado: 0
            },
            garantiaReal: {
                valorEsperado: 0,
                valorConfirmado: 0
            },
            quirografario: {
                valorEsperado: 0,
                valorConfirmado: 0
            },
            microEmpresa: {
                valorEsperado: 0,
                valorConfirmado: 0
            },
        },
        votos: {
            trabalhista: {
                valorEsperado: 0,
                valorConfirmado: 0
            },
            quirografario: {
                valorEsperado: 0,
                valorConfirmado: 0
            },
            garantiaReal: {
                valorEsperado: 0,
                valorConfirmado: 0
            },
            microEmpresa: {
                valorEsperado: 0,
                valorConfirmado: 0
            },
        }
    }, 
    assembleia: {}
}

export default function(state = INITIAL_STATE, action) {
    switch (action.type) {
        case 'DASHBOARD_ATUALIZADO':
            return { ...state, summary: action.payload.data }
        case 'ASSEMBLEIA_ATIVA_ATUALIZADA':
            window.Params.codigoAssembleiaAtiva = action.payload.data[0].codigo
            return { ...state, assembleia: action.payload.data[0] }
        default:
            return state
    }
}

