const { test: base, expect } = require('@playwright/test');
const f = require('./fixtures.cjs');
const test = base.extend({
  baseline: async ({ page, context, baseURL }, use) => {
    const state = { user: structuredClone(f.user), assembleia: structuredClone(f.assembleia),
      credores: structuredClone(f.credores), votos: [], atas: [], resultado: structuredClone(f.resultado),
      requests: [], unexpected: [], errors: [], failPresence: null, failVote: null, loginError: false, validToken: true };
    page.on('pageerror', e => state.errors.push(e.message));
    await context.routeWebSocket('**/*', socket => { state.unexpected.push('WebSocket real'); socket.close(); });
    await context.route('**/*', async route => {
      const req = route.request(); const url = new URL(req.url());
      if (url.origin === baseURL && req.resourceType() !== 'xhr' && req.resourceType() !== 'fetch') return route.continue();
      // CSS remoto do AdminLTE e conhecido: responder vazio localmente, nunca visitar Google.
      if (url.origin === 'https://fonts.googleapis.com' && url.pathname === '/css') return route.fulfill({ status: 200, contentType: 'text/css', body: '' });
      const allowed = url.origin === 'https://gladius-portalvotacao-back.herokuapp.com';
      if (!allowed) { state.unexpected.push(req.method() + ' ' + url.origin + url.pathname); return route.abort(); }
      const pathname = url.pathname.replace(/\/{2,}/g, '/').replace(/\/$/, '');
      const entry = { method: req.method(), rawPath: url.pathname, path: pathname, query: Object.fromEntries(url.searchParams),
        body: req.postData() ? req.postDataJSON() : null, auth: req.headers().authorization };
      state.requests.push(entry);
      const json = (body, status = 200) => route.fulfill({ status, contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'authorization,content-type' }, body: JSON.stringify(body) });
      if (req.method() === 'OPTIONS') return json({});
      if (pathname === '/oapi/validateToken') return json({ valid: state.validToken });
      if (pathname === '/oapi/login') return state.loginError ? json({ errors: ['Login sintetico invalido'] }, 400) : json(state.user);
      if (req.method() === 'GET') {
        const q = entry.query;
        if (pathname === '/api/assembleias') return json([state.assembleia]);
        if (pathname === '/api/votos/dashboard') return json({ quorum: {}, votos: {}, quorum2: [], votos2: [], resConfPres: [1,2,3,4].map(codigoClasse => ({ codigoClasse, quant: 3 })) });
        if (pathname === '/api/credores') {
          let list = state.credores.filter(x => !q.codigoAssembleia || x.codigoAssembleia == q.codigoAssembleia);
          if (q.confirmouPresenca__ne) list = list.filter(x => !x.confirmouPresenca);
          if (q.codigoProcurador) list = list.filter(x => x.codigoProcurador == q.codigoProcurador);
          if (q.nome__regex) list = list.filter(x => new RegExp(q.nome__regex.slice(1, -1), 'i').test(x.nome));
          return json(list);
        }
        if (pathname === '/api/votos') return json(state.votos.filter(x => (!q.codigoAssembleia || x.codigoAssembleia == q.codigoAssembleia) && (!q.codigoProcurador || x.codigoProcurador == q.codigoProcurador) && (!q.nomeCredor__regex || new RegExp(q.nomeCredor__regex.slice(1,-1), 'i').test(x.nomeCredor))));
        if (pathname === '/api/resultados') return json(state.resultado);
        if (pathname === '/api/aprovaAtas') return json(state.atas);
        if (pathname === '/api/chats') return json([]);
      }
      if (pathname === '/api/votos/confirmar' && req.method() === 'POST') {
        if (state.delayPresence) await new Promise(resolve => setTimeout(resolve, state.delayPresence));
        if (entry.body._id === state.failPresence) return json({ errors: ['Presenca recusada no teste'] }, 500);
        const credor = state.credores.find(x => x._id === entry.body._id);
        if (!credor) throw Error('Fixture de credor ausente');
        credor.confirmouPresenca = true; const voto = f.vote(credor); state.votos.push(voto); return json(voto);
      }
      if (pathname === '/api/votos/votar' && req.method() === 'PUT') {
        if (entry.body._id === state.failVote) return json({ errors: ['Voto recusado no teste'] }, 500);
        const voto = state.votos.find(x => x._id === entry.body._id);
        if (!voto) throw Error('Fixture de voto ausente');
        Object.assign(voto, { tipo: entry.body.tipo, ordem: 1 }); return json(voto);
      }
      if (pathname === '/api/aprovaAtas/aprovar' && req.method() === 'POST') return json({ Ok: true });
      if (pathname === '/api/logsAcessos/register' && req.method() === 'POST') return json({ ok: true });
      state.unexpected.push(entry.method + ' ' + pathname); return route.abort();
    });
    state.open = async (hash, session = state.user) => {
      await context.addInitScript(({ user }) => {
        window.__events = [];
        if (!sessionStorage.getItem('__baseline_seeded')) {
          if (user) localStorage.setItem('_application_user', JSON.stringify(user));
          else localStorage.removeItem('_application_user');
          sessionStorage.setItem('__baseline_seeded', '1');
        }
        localStorage.setItem('codigoAssembleiaAtiva', String(user?.codigoAssembleia || 5));
      }, { user: session });
      await page.goto('/#/' + hash);
    };
    await use(state);
    expect(state.unexpected, 'Toda rede deve ser local estática ou HTTP simulado conhecido').toEqual([]);
  }
});
module.exports = { test, expect, f };
