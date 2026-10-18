const user = { id: 'usuario-falso', nome: 'Procurador Sintetico', login: 'fixture', codigoCredor: 90, codigoAssembleia: 5, codigo: 90, tipo: 0, token: 'token-sintetico-sem-validade' };
const admin = { ...user, id: 'admin-falso', nome: 'Admin Sintetico', tipo: 1 };
const proprio = { ...user, id: 'credor-falso', codigoCredor: 101 };
const assembleia = { codigo: 5, descricao: 'AGC Sintetica', assunto: 'Teste isolado', ativo: true,
  pergunta: 'Aprova o plano sintetico?', podeConfirmar: true, podeVotar: true, podeAta: true,
  inicioConfPres: '2026-10-18T09:00:00.000Z', inicioVotacao: '2026-10-18T10:00:00.000Z' };
const credores = ['Ana Fixture', 'Bia Fixture', 'Caio Fixture'].map((nome, i) => ({
  _id: 'credor-' + i, codigo: 101 + i, codigoAssembleia: 5, nome, valor: 1000 + i,
  codigoClasse: i === 2 ? 4 : 1, descricaoClasse: i === 2 ? 'Me/Epp' : 'Trabalhistas',
  codigoProcurador: 90, nomeProcurador: user.nome, cpfCnpj: '00000000000', confirmouPresenca: false
}));
const resultado = [1, 2, 3, 4].map(codigoClasse => ({ _id: 'resultado-' + codigoClasse, codigoClasse,
  descricaoClasse: 'Classe ' + codigoClasse, tipoResultado: 'Q', valorCredito: 1000, quantCredores: 3,
  valorSim: 600, valorNao: 300, valorAbs: 100, quantSim: 2, quantNao: 1, quantAbs: 0,
  percValorSim: 66.666666, percValorNao: 33.333333, percQuantSim: 66.666666, percQuantNao: 33.333333,
  valorSubTotalSim: 600, valorSubTotalNao: 300, percSubTotalSim: 66.666666, percSubTotalNao: 33.333333, valorTotalGeral: 1000 }));
function vote(credor) { return { ...credor, _id: 'voto-' + credor._id, nomeCredor: credor.nome, tipo: '', ordem: 0, percentualClasse: 33.333333, data: '2026-10-18T10:12:34.000Z' }; }
const outraAssembleia = { ...assembleia, codigo: 6, descricao: 'Outra AGC Sintetica' };
module.exports = { user, admin, proprio, assembleia, outraAssembleia, credores, resultado, vote };
