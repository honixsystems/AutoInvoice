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