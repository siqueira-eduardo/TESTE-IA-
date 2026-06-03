import React, { useState, useEffect } from 'react';
import { X, ExternalLink, DownloadCloud, AlertTriangle } from 'lucide-react';
import { CalendarEvent } from '../types';
import { initAuth, googleSignIn, logout } from '../lib/auth';
import { createSpreadsheet, appendEventsToSheet } from '../lib/sheets';
import { User } from 'firebase/auth';

interface SheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: CalendarEvent[];
}

export function SheetsSyncModal({ isOpen, onClose, events }: SheetsSyncModalProps) {
  const [needsAuth, setNeedsAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    
    const unsubscribe = initAuth(
      (u, t) => {
        setUser(u);
        setToken(t);
        setNeedsAuth(false);
      },
      () => {
        setNeedsAuth(true);
        setUser(null);
        setToken(null);
      }
    );
    
    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async () => {
    try {
      setSyncStatus('Autenticando...');
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setNeedsAuth(false);
        setSyncStatus(null);
      }
    } catch (err) {
      console.error('Login failed:', err);
      // We will show a warning if config is dummy because Firebase fails without real config
      setSyncStatus('Falha ao autenticar. Verifique as configurações do Firebase.');
    }
  };

  const handleSync = async () => {
    if (!token) return;
    
    setIsSyncing(true);
    setSyncStatus('Criando planilha e exportando dados...');
    setSpreadsheetUrl(null);
    
    try {
      const title = `Agenda Backup - ${new Date().toLocaleDateString()}`;
      const spreadsheetId = await createSpreadsheet(token, title);
      
      await appendEventsToSheet(token, spreadsheetId, events);
      
      setSpreadsheetUrl(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
      setSyncStatus('Sincronização concluída com sucesso!');
    } catch (error) {
      console.error(error);
      setSyncStatus('Ocorreu um erro ao sincronizar os dados.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in duration-200">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-emerald-600">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sheet"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/><line x1="9" x2="9" y1="9" y2="21"/><line x1="15" x2="15" y1="9" y2="21"/></svg>
            </span>
            Sincronizar com Google Sheets
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-6 text-sm">
            Exporte seus próximos e passados compromissos para sua conta do Google Drive como uma planilha do Google Sheets.
          </p>

          {!needsAuth && user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}`} className="w-10 h-10 border rounded-full bg-white" alt="Avatar do usuário" />
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold text-gray-800 text-sm truncate">{user.displayName || 'Usuário Conectado'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <button onClick={logout} className="text-xs text-gray-500 hover:text-red-500 transition-colors underline">Sair</button>
              </div>

              <button
                onClick={handleSync}
                disabled={isSyncing || events.length === 0}
                className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed font-medium shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <DownloadCloud size={18} />
                {isSyncing ? 'Sincronizando...' : 'Exportar Eventos'}
              </button>
              
              {events.length === 0 && (
                <p className="text-xs text-amber-600 text-center flex items-center justify-center gap-1">
                  <AlertTriangle size={12} /> Você não possui eventos para exportar.
                </p>
              )}

              {syncStatus && (
                <div className={`p-3 rounded-lg text-sm text-center ${spreadsheetUrl ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-600'}`}>
                   {syncStatus}
                </div>
              )}

              {spreadsheetUrl && (
                <a 
                  href={spreadsheetUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Abrir Planilha <ExternalLink size={16} />
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <button 
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm bg-white text-gray-700 font-medium relative overflow-hidden"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                <span>Fazer login no Google</span>
              </button>
              
              {syncStatus && (
                <div className="p-3 rounded-lg text-sm text-center bg-red-50 text-red-600 border border-red-100">
                   {syncStatus}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
