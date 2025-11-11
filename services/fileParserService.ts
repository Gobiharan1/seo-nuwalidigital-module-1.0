
import * as XLSX from 'xlsx';

export const parseKeywordFile = async (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const keywords: string[] = [];
        if (json.length > 1) {
          const header = json[0].map(h => String(h).toLowerCase());
          const kwIndex = header.findIndex(h => h.includes('keyword'));
          
          if (kwIndex !== -1) {
            for (let i = 1; i < json.length; i++) {
              if (json[i][kwIndex]) {
                keywords.push(String(json[i][kwIndex]));
              }
            }
          }
        }
        resolve(keywords);
      } catch (error) {
        console.error("Error parsing file:", error);
        reject("Could not parse the file. Please ensure it's a valid XLSX or CSV.");
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsBinaryString(file);
  });
};
   