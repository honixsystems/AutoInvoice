import * as XLSX from 'xlsx';

export const exportToCsv = async (rows: object[], headers?: string[]): Promise<Uint8Array> => {
  if (!rows || !rows.length) {
      throw new Error("No rows to export");
  }
  const separator: string = ",";

  const keys: string[]  = Object.keys(rows[0]);

  let columHearders: string[];

  if (headers) {
      columHearders = headers;
  } else {
      columHearders = keys;
  }

  const csvContent =
      columHearders.join(separator) +
      '\n' +
      rows.map(row => {
          return keys.map(k => {
              let cell = row[k] === null || row[k] === undefined ? '' : row[k];

              cell = cell instanceof Date 
                  ? cell.toLocaleString()
                  : cell.toString().replace(/"/g, '""');

              if (navigator.msSaveBlob) {
                  cell = cell.replace(/[^\x00-\x7F]/g, ""); //remove non-ascii characters
              }
              if (cell.search(/("|,|\n)/g) >= 0) {
                  cell = `"${cell}"`;
              }
              return cell;
          }).join(separator);
      }).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  return new Uint8Array(await blob.arrayBuffer());
}

export const exportToExcel = async (rows: Record<string, unknown>[], headers?: string[]): Promise<Uint8Array> => {
  if (!rows || !rows.length) {
    throw new Error("No rows to export");
  }

  const firstRow = rows[0];
  if (!firstRow) {
    throw new Error("First row is undefined");
  }

  const keys: string[] = Object.keys(firstRow);
  const columnHeaders: string[] = headers || keys;

  // Créer un nouveau workbook
  const wb = XLSX.utils.book_new();

  // Préparer les données pour Excel
  const excelData = rows.map(row => {
    return keys.map(k => {
      const cell = row[k];
      if (cell === null || cell === undefined) return '';
      if (cell instanceof Date) return cell.toLocaleString();
      return String(cell);
    });
  });

  // Ajouter les en-têtes et les données
  const ws = XLSX.utils.aoa_to_sheet([
    columnHeaders,
    ...excelData
  ]);

  // Ajouter la feuille au workbook
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  // Générer le fichier Excel
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Uint8Array(excelBuffer);
}