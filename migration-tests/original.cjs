const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const repository = path.resolve(__dirname, '..');
const original = '41478a83b74a8d27c7058a1d79b2ed1deab271c3';
const reference = path.join(__dirname, '.original');
const scope = ['src','public','package.json','package-lock.json','webpack.config.js','Procfile'];
function entries(){
 return execFileSync('git',['ls-tree','-rz',original,'--',...scope],{cwd:repository,maxBuffer:8*1024*1024}).toString('utf8').split('\0').filter(Boolean).map(line=>{
  const [header,name]=line.split('\t');const [mode,type,oid]=header.split(' ');
  if(mode!=='100644'||type!=='blob'||!name||name.includes('..')||path.isAbsolute(name))throw new Error('Referência contém entrada não suportada.');
  return {name,oid};
 });
}
function verifyOriginal(directory=reference){
 const root=path.resolve(directory);if(fs.lstatSync(root).isSymbolicLink())throw new Error('Link na referência original.');for(const name of ['src','public'])if(fs.lstatSync(path.join(root,name)).isSymbolicLink())throw new Error('Link na referência original.');const expected=entries();if(!expected.length)throw new Error('Referência original indisponível.');
 const names=new Set(expected.map(entry=>entry.name));
 for(const {name,oid} of expected){
  const target=path.resolve(root,name);if(!target.startsWith(root+path.sep)||!fs.lstatSync(target).isFile()||fs.lstatSync(target).isSymbolicLink())throw new Error('Entrada original inválida: '+name);
  const contents=fs.readFileSync(target);const hash=crypto.createHash('sha1').update('blob '+contents.length+'\0').update(contents).digest('hex');
  if(hash!==oid)throw new Error('Referência original alterada: '+name);
 }
 function scan(relative){for(const item of fs.readdirSync(path.join(root,relative),{withFileTypes:true})){const name=relative+'/'+item.name;if(item.isSymbolicLink())throw new Error('Link na referência original.');if(item.isDirectory())scan(name);else if(!names.has(name))throw new Error('Arquivo adicional na referência original: '+name);}}
 scan('src');scan('public');return root;
}
function prepareOriginal(){
 if(fs.existsSync(reference))return verifyOriginal();
 const staging=fs.mkdtempSync(path.join(__dirname,'.original-preparing-'));const archive=path.join(staging,'reference.tar');
 execFileSync('git',['-c','core.autocrlf=false','-c','core.eol=lf','archive','--format=tar','--output='+archive,original,...scope],{cwd:repository});
 execFileSync('tar',['-xf',archive,'-C',staging],{stdio:'pipe'});fs.unlinkSync(archive);
 verifyOriginal(staging);fs.renameSync(staging,reference);return verifyOriginal();
}
module.exports={original,reference,repository,entries,verifyOriginal,prepareOriginal};
if(require.main===module){const root=process.argv.includes('--prepare')?prepareOriginal():verifyOriginal();console.log('Frontend original verificado: '+original+' ('+entries().length+' arquivos) em '+path.relative(repository,root));}
