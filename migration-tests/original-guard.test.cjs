const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {reference,entries,verifyOriginal}=require('./original.cjs');
function copy(){const root=fs.mkdtempSync(path.join(__dirname,'.original-guard-'));for(const entry of entries()){const target=path.join(root,entry.name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(reference,entry.name),target);}return root;}
test('baseline aceita somente conteúdo original por blob, independente da raiz migrada',()=>{assert.equal(verifyOriginal(),reference);});
test('baseline rejeita fonte alterado mesmo se metadata/nomes permanecerem originais',()=>{const root=copy();fs.appendFileSync(path.join(root,'src/index.jsx'),'\n// alteração sintética');assert.throws(()=>verifyOriginal(root),/Referência original alterada: src\/index.jsx/);});
test('baseline rejeita fonte adicional inserido fora da árvore original',()=>{const root=copy();fs.writeFileSync(path.join(root,'src/injetado.js'),'throw new Error("sintético");');assert.throws(()=>verifyOriginal(root),/Arquivo adicional na referência original/);});
