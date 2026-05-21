import { Readable } from 'stream';
import csv from 'csv-parser';
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

const parseCsv = (buffer) =>
  new Promise((resolve, reject) => {
    const values = [];
    Readable.from(buffer.toString('utf-8'))
      .pipe(csv())
      .on('data', (row) => {
        values.push(Object.values(row).join(' '));
      })
      .on('end', () => resolve(values.join('\n')))
      .on('error', (error) => reject(error));
  });

export const extractText = async (buffer, mimetype, filename) => {
  const ext = filename.split('.').pop()?.toLowerCase();

  if (mimetype === 'application/pdf' || ext === 'pdf') {
    const parser = new PDFParse({ data: buffer });
    try {
      const parsed = await parser.getText();
      return parsed.text || '';
    } finally {
      await parser.destroy();
    }
  }
  if (ext === 'docx') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  }
  if (ext === 'txt' || mimetype === 'text/plain') {
    return buffer.toString('utf-8');
  }
  if (ext === 'csv') {
    return parseCsv(buffer);
  }

  throw new Error(`Unsupported file type: .${ext}`);
};
