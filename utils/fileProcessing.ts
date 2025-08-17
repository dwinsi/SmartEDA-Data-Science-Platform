import * as Papa from 'papaparse';
import * as ExcelJS from 'exceljs';

export interface DatasetInfo {
  data: any[];
  columns: string[];
  shape: { rows: number; columns: number };
  dtypes: { [key: string]: string };
  missingValues: number;
}

/**
 * Parse CSV files using PapaParse (secure and fast)
 */
export const parseCSV = (file: File): Promise<DatasetInfo> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data as any[];
          const columns = results.meta.fields || [];
          
          // Calculate data types and missing values
          const dtypes: { [key: string]: string } = {};
          let missingValues = 0;
          
          columns.forEach(col => {
            const sampleValues = data.slice(0, 100).map(row => row[col]).filter(val => val !== null && val !== undefined && val !== '');
            if (sampleValues.length > 0) {
              const firstValue = sampleValues[0];
              dtypes[col] = typeof firstValue === 'number' ? 'numeric' : 'categorical';
            } else {
              dtypes[col] = 'categorical';
            }
            
            // Count missing values in this column
            missingValues += data.filter(row => 
              row[col] === null || row[col] === undefined || row[col] === ''
            ).length;
          });
          
          resolve({
            data,
            columns,
            shape: { rows: data.length, columns: columns.length },
            dtypes,
            missingValues
          });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

/**
 * Parse Excel files using ExcelJS (secure alternative to xlsx)
 */
export const parseExcel = async (file: File): Promise<DatasetInfo> => {
  try {
    const workbook = new ExcelJS.Workbook();
    const arrayBuffer = await file.arrayBuffer();
    await workbook.xlsx.load(arrayBuffer);
    
    // Get the first worksheet
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error('No worksheets found in the Excel file');
    }
    
    const data: any[] = [];
    const columns: string[] = [];
    
    // Get headers from first row
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      columns.push(cell.text || `Column_${colNumber}`);
    });
    
    // Process data rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row
      
      const rowData: any = {};
      row.eachCell((cell, colNumber) => {
        const columnName = columns[colNumber - 1];
        if (columnName) {
          // Handle different cell types
          let value = cell.value;
          if (cell.type === ExcelJS.ValueType.Number) {
            value = Number(value);
          } else if (cell.type === ExcelJS.ValueType.Date) {
            value = cell.value as Date;
          } else {
            value = cell.text || '';
          }
          rowData[columnName] = value;
        }
      });
      
      data.push(rowData);
    });
    
    // Calculate data types and missing values
    const dtypes: { [key: string]: string } = {};
    let missingValues = 0;
    
    columns.forEach(col => {
      const sampleValues = data.slice(0, 100).map(row => row[col]).filter(val => val !== null && val !== undefined && val !== '');
      if (sampleValues.length > 0) {
        const firstValue = sampleValues[0];
        dtypes[col] = typeof firstValue === 'number' ? 'numeric' : 'categorical';
      } else {
        dtypes[col] = 'categorical';
      }
      
      // Count missing values in this column
      missingValues += data.filter(row => 
        row[col] === null || row[col] === undefined || row[col] === ''
      ).length;
    });
    
    return {
      data,
      columns,
      shape: { rows: data.length, columns: columns.length },
      dtypes,
      missingValues
    };
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Generic file parser that routes to appropriate parser based on file type
 */
export const parseFile = async (file: File): Promise<DatasetInfo> => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  switch (fileExtension) {
    case 'csv':
      return parseCSV(file);
    case 'xlsx':
    case 'xls':
      return parseExcel(file);
    default:
      throw new Error(`Unsupported file type: ${fileExtension}. Please upload CSV or Excel files.`);
  }
};

/**
 * Calculate basic statistics for numeric columns
 */
export const calculateStatistics = (data: any[], column: string) => {
  const values = data.map(row => row[column]).filter(val => typeof val === 'number' && !isNaN(val));
  
  if (values.length === 0) return null;
  
  const sorted = values.sort((a, b) => a - b);
  const sum = values.reduce((acc, val) => acc + val, 0);
  const mean = sum / values.length;
  
  return {
    count: values.length,
    mean,
    median: sorted[Math.floor(sorted.length / 2)],
    min: sorted[0],
    max: sorted[sorted.length - 1],
    std: Math.sqrt(values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length)
  };
};

/**
 * Get unique values count for categorical columns
 */
export const getUniqueCount = (data: any[], column: string): number => {
  const values = data.map(row => row[column]).filter(val => val !== null && val !== undefined && val !== '');
  return new Set(values).size;
};

/**
 * Calculate correlation between two numeric columns
 */
export const calculateCorrelation = (data: any[], col1: string, col2: string): number => {
  const pairs = data
    .map(row => [row[col1], row[col2]])
    .filter(([a, b]) => typeof a === 'number' && typeof b === 'number' && !isNaN(a) && !isNaN(b));
  
  if (pairs.length < 2) return 0;
  
  const n = pairs.length;
  const sum1 = pairs.reduce((acc, [a]) => acc + a, 0);
  const sum2 = pairs.reduce((acc, [, b]) => acc + b, 0);
  const sum1Sq = pairs.reduce((acc, [a]) => acc + a * a, 0);
  const sum2Sq = pairs.reduce((acc, [, b]) => acc + b * b, 0);
  const pSum = pairs.reduce((acc, [a, b]) => acc + a * b, 0);
  
  const num = pSum - (sum1 * sum2 / n);
  const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));
  
  return den === 0 ? 0 : num / den;
};