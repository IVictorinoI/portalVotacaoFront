const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = require('./original.cjs').verifyOriginal();
const babel = require(path.join(root, 'node_modules/babel-core'));
// Somente duas fontes puras conhecidas; nenhum import da aplicação ou backend.
function pure(relative) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  const transformed = babel.transform(source, { babelrc: false, presets: [require.resolve(path.join(root, 'node_modules/babel-preset-es2015'))] }).code;
  const exports = {};
  vm.runInNewContext(transformed, { exports }, { timeout: 1000, filename: relative });
  return exports;
}
const { convertStringToTime } = pure('src/common/util/dateTimeConversor.js');
const { colorCardAprovacao, colorLine } = pure('src/aprovaata/aprovaAtaService.js');
test('data historica: sentinela omitida e hora recortada sem converter fuso', () => {
  assert.equal(convertStringToTime('1899-12-30T00:00:00.000Z'), undefined);
  assert.equal(convertStringToTime('2026-10-18T10:12:34.000Z'), '10:12:34');
  assert.equal(convertStringToTime('2026-10-18T10:12:34-03:00'), '10:12:34');
});
test('diagnostico D3: regra original de cor nao representa quorum percentual', () => {
  assert.equal(colorCardAprovacao(0, 3), 'small-box bg-gray');
  assert.equal(colorCardAprovacao(1, 3), 'small-box bg-yellow');
  assert.equal(colorCardAprovacao(2, 100), 'small-box bg-green');
  assert.equal(colorCardAprovacao(1, 1), 'small-box bg-green');
  assert.equal(colorCardAprovacao(0, 0), 'small-box bg-green');
  assert.equal(colorLine(true), 'success'); assert.equal(colorLine(false), 'danger');
});
