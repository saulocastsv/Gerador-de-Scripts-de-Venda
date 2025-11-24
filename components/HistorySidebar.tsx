import React from 'react';
import { GeneratedScript } from '../types';
import { Clock, ChevronRight, Trash2, X } from 'lucide-react';

interface HistorySidebarProps {
  history: GeneratedScript[];
  onSelect: (script: GeneratedScript) => void;
  onClear: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  history, 
  onSelect, 
  onClear,
  isOpen,
  setIsOpen
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`
        fixed top-0 right-0 h-full w-80 bg-white border-l border-gray-200 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              Histórico
            </h2>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {history.length === 0 ? (
              <div className="text-center text-gray-400 py-10 text-sm">
                Nenhum script gerado ainda.
              </div>
            ) : (
              history.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className="w-full text-left group relative bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-900 hover:shadow-sm transition-all duration-200"
                >
                  <div className="text-xs font-semibold text-gray-900 mb-1 truncate pr-4">
                    {item.niche}
                  </div>
                  <div className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {item.objective}
                  </div>
                  <div className="mt-2 text-[10px] text-gray-400 flex justify-between items-center">
                    <span>{new Date(item.timestamp).toLocaleDateString('pt-BR')}</span>
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-900" />
                  </div>
                </button>
              ))
            )}
          </div>

          {history.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <button 
                onClick={() => {
                  if(window.confirm('Tem certeza que deseja limpar o histórico?')) {
                    onClear();
                  }
                }}
                className="w-full flex items-center justify-center gap-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 py-2 px-4 rounded-md transition-colors font-medium"
              >
                <Trash2 className="w-3 h-3" />
                Limpar Histórico
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};