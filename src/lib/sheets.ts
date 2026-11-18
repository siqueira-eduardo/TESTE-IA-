import { CalendarEvent } from '../types';

const SHEET_NAME = 'Eventos';

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
      },
      // Nome fixo da aba: o padrão varia com o idioma da conta (Sheet1, Planilha1...).
      sheets: [{ properties: { title: SHEET_NAME } }]
    })
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Failed to create spreadsheet:", errorText);
    throw new Error(`Falha ao criar a planilha (HTTP ${res.status})`);
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

  // Planilha nova: cabeçalho seguido dos eventos.
  const header = [['ID', 'Título', 'Descrição', 'Data', 'Início', 'Término', 'Cor', 'Categoria']];
  
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(`${SHEET_NAME}!A1`)}:append?valueInputOption=RAW`, {
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
    console.error('Failed to append events:', text);
    throw new Error(`Falha ao exportar os eventos (HTTP ${res.status})`);
  }
}
