import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fixturePDF} from './fixture.mjs';
const base=process.env.TEST_BASE_URL||'http://localhost:4173/';
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_CHANNEL?{channel:process.env.PLAYWRIGHT_CHROMIUM_CHANNEL}:{})});
try {
 const context=await browser.newContext({acceptDownloads:true});const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));const requests=[];page.on('request',r=>requests.push({url:r.url(),method:r.method()}));
 const importPDF=async()=>{await page.setInputFiles('#pdf-file',{name:'synthetic-duty-plan.pdf',mimeType:'application/pdf',buffer:fixturePDF()});await page.waitForSelector('#plan-panel:not([hidden])');};
 await page.goto(base);await importPDF();assert.equal(await page.locator('#person option').count(),4);
 assert.equal(await page.locator('.brand-sub').count(),0);assert.equal(await page.locator('#share').count(),0);assert.equal(await page.locator('.export-note').count(),0);
 assert.equal(await page.locator('#download').getAttribute('class'),'primary');assert.equal(await page.locator('#duration').inputValue(),'0');
 await page.selectOption('#person','0');assert.ok(await page.locator('#download').isEnabled());
 assert.equal(await page.locator('.shift').count(),2);await page.getByLabel('Urlaub mitnehmen',{exact:true}).check();
 assert.equal(await page.locator('.shift').count(),3);assert.ok((await page.locator('#rows').innerText()).includes('Urlaub'));assert.ok(!(await page.locator('#rows').innerText()).includes('Frei'));
 const vacationDownload=page.waitForEvent('download');await page.click('#download');const vacationFile=await vacationDownload;const vacationICS=await readFile(await vacationFile.path(),'utf8');
 assert.ok(vacationICS.includes('SUMMARY:U · Casino'));assert.ok(!vacationICS.includes('SUMMARY:Frei'));
 assert.ok(!vacationICS.includes('DTEND:'));await page.locator('#absence').uncheck();
 await page.selectOption('#duration','8');assert.ok(await page.locator('#download').isEnabled());
 assert.equal(await page.locator('.shift').count(),2);await page.locator('.shift input').first().uncheck();assert.match(await page.locator('#count').innerText(),/1 Eintr/);
 await page.selectOption('#person','1');assert.ok((await page.locator('#rows').innerText()).includes('17br'));
 const dl=page.waitForEvent('download');await page.click('#download');const file=await dl;const content=await readFile(await file.path(),'utf8');
 assert.ok(content.startsWith('BEGIN:VCALENDAR'));assert.ok(content.includes('Person Beta'));assert.ok(!content.includes('Person Alpha'));assert.ok(content.includes('SUMMARY:BR · Casino'));assert.ok(content.includes('SUMMARY:POKER · Casino'));assert.ok(!content.includes('SUMMARY:Dienst · br · Person Beta'));
 await page.click('#reset');assert.equal(await page.locator('#person option').count(),1);assert.equal(await page.locator('.shift').count(),0);assert.equal(await page.locator('#duration').inputValue(),'0');
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);
 await context.setOffline(true);await page.reload();await importPDF();await page.selectOption('#person','2');await page.selectOption('#duration','0');assert.ok(await page.locator('#download').isEnabled());
 assert.equal(await page.evaluate(()=>localStorage.length),0);assert.equal(await page.evaluate(async()=>(await indexedDB.databases()).length),0);
 const cache=await page.evaluate(async()=>{let urls=[];for(const k of await caches.keys()){const c=await caches.open(k);urls.push(...(await c.keys()).map(r=>r.url))}return urls});
 assert.ok(!cache.some(u=>/\.pdf$|\.ics$/.test(u)));assert.ok(requests.every(r=>r.method==='GET'&&r.url.startsWith(base)));
 for(const width of [390,320]){await page.setViewportSize({width,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await page.click('#reset');assert.deepEqual(errors,[]);
 console.log('Browser: import, selection, ICS export, reset, offline, privacy and mobile layouts verified.');
} finally {await browser.close();}
