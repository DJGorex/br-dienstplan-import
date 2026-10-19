// Entirely synthetic PDF: no real people or shifts are embedded.
export function fixturePDF() {
  const names = ['Person Alpha', 'Person Beta', 'Person Gamma'];
  const cells = [['2000', 'poker', 'frei'], ['1700', 'office', '1930'], ['frei', '17br', 'sem'], ['U', 'frei', 'U']];
  const text = (s, x, y, vertical = false) => `BT /F1 10 Tf ${vertical ? '0 1 -1 0' : '1 0 0 1'} ${x} ${y} Tm (${s}) Tj ET`;
  const commands = names.map((n, i) => text(n, 250 + i * 80, 660, true));
  for (let day = 0; day < 4; day++) {
    const y = 640 - day * 20;
    commands.push(text(['SO', 'MO', 'DI', 'MI'][day], 100, y), text(`${day + 1}. Nov. 26`, 130, y));
    cells[day].forEach((s, i) => commands.push(text(s, 240 + i * 80, y)));
  }
  const stream = commands.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`
  ];
  let pdf = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((object, i) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${i + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(o => String(o).padStart(10, '0') + ' 00000 n ').join('\n')}\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf);
}
