import assert from 'node:assert/strict';
import {getDocument} from 'pdfjs-dist/legacy/build/pdf.mjs';
import {parsePage} from '../dist/parser.js';
import {fixturePDF} from './fixture.mjs';
const task=getDocument({data:new Uint8Array(fixturePDF()),useSystemFonts:true});
try {
 const doc=await task.promise;
 const people=parsePage((await(await doc.getPage(1)).getTextContent()).items);
 assert.deepEqual(people.map(p=>p.name),['Person Alpha','Person Beta','Person Gamma']);
 assert.deepEqual(people.map(p=>p.entries.map(e=>e.raw)),[['2000','1700','frei','U'],['poker','office','17br','frei'],['frei','1930','sem','U']]);
 assert.deepEqual(people[0].entries.map(e=>e.date),['2026-11-01','2026-11-02','2026-11-03','2026-11-04']);
 console.log('Synthetic PDF: names, rotation, columns, dates and all cells verified.');
} finally {await task.destroy();}
