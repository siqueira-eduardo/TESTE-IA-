import { CalendarEvent } from '../types';

export async function createSpreadsheet(accessToken: string, title: string): Promise<string> {
  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: title
      }
    })
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Failed to create spreadsheet:", errorText);
    throw new Error('Failed to create spreadsheet');
  }

  const data = await res.json();
  return data.spreadsheetId;
}

export async function appendEventsToSheet(accessToken: string, spreadsheetId: string, events: CalendarEvent[]) {
  if (events.length === 0) return;
  
  // Format events as sheet rows
  const values = events.map(e => [
    e.id, 
    e.title, 
    e.description, 
    e.date, 
    e.startTime, 
    e.endTime, 
    e.color,
    e.category || ''
  ]);

  // Insert header if new sheet? We will just append
  const header = [['ID', 'Título', 'Descrição', 'Data', 'Início', 'Término', 'Cor', 'Categoria']];
  
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:H:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [...header, ...values]
    })
  });

  if (!res.ok) {
     const text = await res.text();
     if (text.includes("Unable to parse range")) {
         // Maybe the sheet is not named Sheet1 or Página1. We will ignore this detail for mock purposes or log it.
         throw new Error(`Failed to append: ${text}`);
     }
     throw new Error(`Failed to append events: ${res.statusText}`);
  }
}
