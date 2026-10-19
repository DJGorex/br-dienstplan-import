import {test} from 'node:test';import assert from 'node:assert/strict';import {classify,parseDate,mergePages} from '../dist/parser.js';import {createICS,berlinUTC} from '../dist/calendar.js';
test('Datumswerte und Kürzel',()=>{assert.equal(parseDate('SO 1. Nov. 26'),'2026-11-01');assert.equal(parseDate('31. Feb. 26'),null);assert.equal(parseDate('1. März 2027'),'2027-03-01');assert.deepEqual(classify('17br'),{kind:'timed',time:'17:00',label:'Dienst · br'});assert.equal(classify('1930').time,'19:30');assert.equal(classify('U').label,'Urlaub');assert.equal(classify('poker').kind,'allDay');assert.equal(classify('2460').kind,'allDay')});
test('Berlin-Zeitzone mit Sommer-/Winterzeit',()=>{assert.equal(berlinUTC('2026-11-01','20:00').toISOString(),'2026-11-01T19:00:00.000Z');assert.equal(berlinUTC('2026-07-01','20:00').toISOString(),'2026-07-01T18:00:00.000Z')});
test('ICS: Nachtwechsel, Ganztag, Escaping, Faltung, stabile UID',()=>{const e=[{date:'2026-11-30',raw:'2000'},{date:'2026-11-30',raw:'office'}];const a=createICS('Name, Test; Ä'.repeat(12),e,8);assert.match(a,/DTSTART:20261130T190000Z/);assert.match(a,/DTEND:20261201T030000Z/);assert.match(a,/DTEND;VALUE=DATE:20261201/);assert.match(a,/Name\\, Test\\;/);for(const l of a.split('\r\n'))assert.ok(Buffer.byteLength(l)<=75);assert.equal(a.match(/UID:.+/)[0],createICS('Name, Test; Ä'.repeat(12),e,8).match(/UID:.+/)[0]);assert.ok(!createICS('A',[e[0]],0).includes('DTEND:'));assert.ok(a.endsWith('\r\n'))});
test('Widersprüchliche Mehrseitenpläne werden abgewiesen',()=>{assert.throws(()=>mergePages([[{name:'A',entries:[{date:'2026-11-01',raw:'2000'}]}],[{name:'A',entries:[{date:'2026-11-01',raw:'1700'}]}]]),/Widersprüchliche/)});

test('ICS-Titel verwenden Casino statt des ausgewählten Namens',()=>{const ics=createICS('Person Beispiel',[{date:'2026-11-01',raw:'2000'},{date:'2026-11-02',raw:'17br'},{date:'2026-11-03',raw:'office'},{date:'2026-11-04',raw:'U'}],0);const titles=ics.split('\r\n').filter(l=>l.startsWith('SUMMARY:'));assert.deepEqual(titles,['SUMMARY:Dienst · Casino','SUMMARY:BR · Casino','SUMMARY:OFFICE · Casino','SUMMARY:U · Casino']);});

test('Kürzel werden originalgetreu groß und ohne Dienst-Präfix exportiert',()=>{const codes=['poker','PoKeR','office','sem','br','17br','19:30br','sondercode'];const ics=createICS('Person Beispiel',codes.map((raw,i)=>({date:'2026-11-'+String(i+1).padStart(2,'0'),raw})),0);assert.deepEqual(ics.split('\r\n').filter(l=>l.startsWith('SUMMARY:')),['SUMMARY:POKER · Casino','SUMMARY:POKER · Casino','SUMMARY:OFFICE · Casino','SUMMARY:SEM · Casino','SUMMARY:BR · Casino','SUMMARY:BR · Casino','SUMMARY:BR · Casino','SUMMARY:SONDERCODE · Casino']);assert.match(ics,/DTSTART:20261106T160000Z/);assert.match(ics,/DTSTART:20261107T183000Z/);});


test('Originalbezeichnungen bleiben unverändert, ohne Casino-Zusatz und mit denselben Zeiten/UIDs',()=>{
 const entries=['1900','17br','poker','frei','U','a,b;test'].map((raw,i)=>({date:'2026-11-'+String(i+1).padStart(2,'0'),raw}));
 const normal=createICS('Person Beispiel',entries,8);
 const original=createICS('Person Beispiel',entries,8,{originalTitles:true});
 const values=(ics,prefix)=>ics.split('\r\n').filter(l=>l.startsWith(prefix));
 assert.deepEqual(values(original,'SUMMARY:'),['SUMMARY:1900','SUMMARY:17br','SUMMARY:poker','SUMMARY:frei','SUMMARY:U','SUMMARY:a\\,b\\;test']);
 for(const prefix of ['DTSTART','DTEND','UID:'])assert.deepEqual(values(original,prefix),values(normal,prefix));
 assert.deepEqual(values(createICS('Person Beispiel',entries,8,{originalTitles:false}),'SUMMARY:'),values(normal,'SUMMARY:'));
});
