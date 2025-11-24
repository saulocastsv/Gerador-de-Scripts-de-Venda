import React, { useState, useEffect, useRef } from 'react';
import { ScriptContent, GeneratedScript, LoadingState } from './types';
import { TEMPLATES, APP_NAME } from './constants';
import { generateScript } from './services/geminiService';
import { Button } from './components/Button';
import { HistorySidebar } from './components/HistorySidebar';
import { 
  Sparkles, 
  Copy, 
  Check, 
  History, 
  ArrowRight, 
  FileText, 
  Download,
  Lightbulb,
  MessageSquare,
  Send,
  Clock,
  AlertCircle,
  LayoutTemplate
} from 'lucide-react';

export default function App() {
  // State
  const [niche, setNiche] = useState('');
  const [objective, setObjective] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [currentScript, setCurrentScript] = useState<ScriptContent | null>(null);
  const [history, setHistory] = useState<GeneratedScript[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Refs for auto-scrolling
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('sellscript_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save history
  const saveToHistory = (script: GeneratedScript) => {
    const newHistory = [script, ...history];
    setHistory(newHistory);
    localStorage.setItem('sellscript_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('sellscript_history');
  };

  const handleGenerate = async () => {
    if (!niche || !objective) return;

    setLoadingState(LoadingState.GENERATING);
    setCurrentScript(null);

    try {
      const scriptContent = await generateScript(niche, objective);
      
      const newScript: GeneratedScript = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        niche,
        objective,
        content: scriptContent
      };

      setCurrentScript(scriptContent);
      saveToHistory(newScript);
      setLoadingState(LoadingState.SUCCESS);
      
      // Scroll to results after a short delay for render
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      
    } catch (error) {
      console.error(error);
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleSelectHistory = (item: GeneratedScript) => {
    setNiche(item.niche);
    setObjective(item.objective);
    setCurrentScript(item.content);
    setLoadingState(LoadingState.SUCCESS);
    setIsHistoryOpen(false);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleCopyAll = () => {
    if (!currentScript) return;

    const allText = [
      currentScript.strategy_note ? `--- ESTRATÉGIA ---\n${currentScript.strategy_note}\n` : '',
      `--- MENSAGEM INICIAL ---\n${currentScript.initial_message}`,
      `--- FOLLOW-UP 1 ---\n${currentScript.follow_up_1}`,
      `--- FOLLOW-UP 2 ---\n${currentScript.follow_up_2}`,
      `--- FOLLOW-UP FINAL ---\n${currentScript.follow_up_final}`,
      `--- CTA SUGERIDO ---\n${currentScript.recommended_cta}`
    ].filter(Boolean).join('\n\n');

    handleCopy(allText, 'ALL');
  };

  const handleExportPDF = () => {
    window.print();
  };

  const renderScriptCard = (title: string, content: string, sectionKey: string, icon: React.ReactNode, delay: number) => (
    <div 
      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 fill-mode-forwards opacity-0 break-inside-avoid"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-50 rounded-lg text-gray-700">
            {icon}
          </div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <button 
          onClick={() => handleCopy(content, sectionKey)}
          className="text-gray-400 hover:text-gray-900 transition-colors p-2 rounded-md hover:bg-gray-100 no-print"
          title="Copiar texto"
        >
          {copiedSection === sectionKey ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
      <div className="relative group">
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 whitespace-pre-wrap leading-relaxed text-sm">{content}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 no-print">
        <div className="max-w-5xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white shadow-lg shadow-gray-900/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight">{APP_NAME}</span>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => setIsHistoryOpen(true)}
            className="text-gray-600 font-medium"
            icon={<History className="w-4 h-4" />}
          >
            Histórico
          </Button>
        </div>
      </header>

      <HistorySidebar 
        history={history}
        isOpen={isHistoryOpen}
        setIsOpen={setIsHistoryOpen}
        onSelect={handleSelectHistory}
        onClear={clearHistory}
      />

      <main className="max-w-3xl mx-auto px-4 py-12">
        
        {/* Input Section */}
        <section className="space-y-8 no-print">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Scripts de vendas que <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">convertem de verdade.</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Gere sequências de prospecção personalizadas em segundos. 
              Focado em conversão, sem bloqueio criativo.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
            <div className="space-y-6">
              <div>
                <label htmlFor="niche" className="block text-sm font-medium text-gray-700 mb-2">
                  Qual o seu nicho de atuação?
                </label>
                <input
                  type="text"
                  id="niche"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="Ex: Imobiliária de alto padrão, SaaS B2B, Agência de Marketing..."
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm py-3 px-4 bg-gray-50 border hover:bg-white transition-colors"
                />
              </div>

              <div>
                <label htmlFor="objective" className="block text-sm font-medium text-gray-700 mb-2">
                  Qual o objetivo da abordagem?
                </label>
                <textarea
                  id="objective"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Ex: Reativar lead que parou de responder, Agendar reunião de demonstração..."
                  rows={3}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm py-3 px-4 bg-gray-50 border hover:bg-white transition-colors resize-none"
                />
              </div>

              {/* Templates */}
              <div className="pt-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <LayoutTemplate className="w-3 h-3" />
                  Ou escolha um modelo rápido:
                </p>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setNiche(t.niche);
                        setObjective(t.objective);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                        niche === t.niche && objective === t.objective
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <Button 
                  onClick={handleGenerate} 
                  isLoading={loadingState === LoadingState.GENERATING}
                  disabled={!niche || !objective}
                  className="w-full h-12 text-base shadow-lg shadow-gray-900/10"
                  icon={<Sparkles className="w-4 h-4" />}
                >
                  {loadingState === LoadingState.GENERATING ? 'Gerando Estratégia...' : 'Gerar Script de Vendas'}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Error Message */}
        {loadingState === LoadingState.ERROR && (
          <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-3 text-sm animate-in fade-in border border-red-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>Ocorreu um erro ao gerar o script. Por favor, verifique sua conexão e tente novamente.</p>
          </div>
        )}

        {/* Results Section */}
        {currentScript && (
          <div ref={resultsRef} className="mt-16 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-4 mb-8 no-print">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">Sua Estratégia</span>
              <div className="h-px bg-