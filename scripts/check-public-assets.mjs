import {readdir,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
async function files(dir){return(await Promise.all((await readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?files(dir+'/'+e.name):[dir+'/'+e.name]))).flat();}
const assets=await files('dist');
assert.ok(!assets.some(f=>/\.(pdf|ics)$/i.test(f)),'PDF/ICS files must never be published.');
const manifest=JSON.parse(await readFile('dist/manifest.webmanifest','utf8'));
assert.equal(manifest.scope,'./');assert.equal(manifest.start_url,'./');
assert.ok((await readFile('dist/sw.js','utf8')).includes("const ASSETS="));
console.log('Publishable static app verified; no PDF or ICS files included.');
