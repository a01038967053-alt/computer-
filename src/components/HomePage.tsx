import React, { useState, useRef, useEffect } from 'react';
import { 
  Cpu, 
  Zap, 
  Award, 
  Scale, 
  ChevronRight, 
  ArrowRight, 
  Flame, 
  Activity,
  Database,
  HardDrive,
  Box,
  Power,
  Sparkles,
  Send,
  MessageSquare,
  Bot,
  User,
  RotateCcw,
  Snowflake,
  Check,
  ClipboardList,
  ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { COMPONENTS_DATA } from '../data';
import { ComponentSpec, ComponentCategory, ChatMessage } from '../types';

interface HomePageProps {
  setView: (view: 'home' | 'compare' | 'estimate') => void;
  setCategory: (category: ComponentCategory) => void;
  setSelectedLeft: (spec: ComponentSpec) => void;
  setSelectedRight: (spec: ComponentSpec) => void;
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  chatInput: string;
  setChatInput: React.Dispatch<React.SetStateAction<string>>;
  estimate: Record<ComponentCategory, ComponentSpec | null>;
  addToEstimate: (cat: ComponentCategory, comp: ComponentSpec) => void;
  removeFromEstimate: (cat: ComponentCategory) => void;
  onOpenPriceCompare?: (part: ComponentSpec) => void;
}

export default function HomePage({
  setView,
  setCategory,
  setSelectedLeft,
  setSelectedRight,
  chatMessages: messages,
  setChatMessages: setMessages,
  chatInput: input,
  setChatInput: setInput,
  estimate,
  addToEstimate,
  removeFromEstimate,
  onOpenPriceCompare
}: HomePageProps) {
  
  // Chat state managed by parent to prevent automatic reset on navigation
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);


  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' })
      .format(price)
      .replace('₩', '') + '원';
  };

  const handleStartMatchup = (leftId: string, rightId: string, cat: ComponentCategory) => {
    const left = COMPONENTS_DATA.find(c => c.id === leftId);
    const right = COMPONENTS_DATA.find(c => c.id === rightId);
    if (left && right) {
      setSelectedLeft(left);
      setSelectedRight(right);
      setCategory(cat);
      setView('compare');
    }
  };

  const handleComparePartDirectly = (partId: string) => {
    const part = COMPONENTS_DATA.find(c => c.id === partId);
    if (!part) return;

    // Find another popular item in the same category as opponent
    const opponent = COMPONENTS_DATA.find(
      c => c.category === part.category && c.id !== part.id
    ) || part;

    setSelectedLeft(part);
    setSelectedRight(opponent);
    setCategory(part.category);
    setView('compare');
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        throw new Error('AI 서버 응답에 실패했습니다.');
      }

      const data = await response.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.responseText || '추천 결과를 생성하지 못했습니다.',
        recommendedParts: data.recommendedParts,
        suggestedComparisons: data.suggestedComparisons
      }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ **AI 어드바이저와 연결하지 못했습니다.**\n\n*오류 메시지: ${err.message || '알 수 없는 에러'}*\n\n*힌트: 상단 우측 'Settings > Secrets' 메뉴에 'GEMINI_API_KEY'가 바르게 등록되어 있는지 꼭 확인해 주시기 바랍니다.*`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: 'assistant',
        content: `대화 내용이 초기화되었습니다. 다시 무엇이든 물어보세요! 😊`
      }
    ]);
  };

  // Safe inline markdown rendering for React 19 compatibility
  const renderMarkdownText = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Check for bullet list item
      const bulletMatch = line.match(/^(\s*)[-*]\s+(.*)$/);
      if (bulletMatch) {
        return (
          <li key={index} className="ml-4 list-disc text-slate-300 text-sm leading-relaxed mb-1.5">
            {parseInlineBold(bulletMatch[2])}
          </li>
        );
      }

      // Check for headers
      const h3Match = line.match(/^###\s+(.*)$/);
      if (h3Match) {
        return (
          <h4 key={index} className="text-sm font-bold text-blue-400 mt-4 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {parseInlineBold(h3Match[1])}
          </h4>
        );
      }

      const h2Match = line.match(/^##\s+(.*)$/);
      if (h2Match) {
        return (
          <h3 key={index} className="text-base font-extrabold text-white mt-5 mb-3 border-b border-slate-800/60 pb-1.5">
            {parseInlineBold(h2Match[1])}
          </h3>
        );
      }

      if (line.trim() === '') {
        return <div key={index} className="h-2" />;
      }

      return (
        <p key={index} className="text-sm text-slate-300 leading-relaxed mb-2">
          {parseInlineBold(line)}
        </p>
      );
    });
  };

  const parseInlineBold = (rawText: string) => {
    const parts = rawText.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-bold text-blue-300 bg-blue-950/20 px-1 py-0.5 rounded border border-blue-900/20">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const presetChips = [
    { label: "📄 문서작업 & 롤 사양 가성비 본체 추천", query: "평소에 문서작업이랑 사양 낮은 롤 같은 게임만 하는데 여기에 맞는 가성비 좋은 컴퓨터를 추천해줘." },
    { label: "🎮 4K 고사양 게이밍 풀세팅 최적화 조합", query: "배틀그라운드나 스팀 고사양 게임을 쾌적하게 즐길 수 있는 하이엔드 게이밍 컴퓨터 스펙을 추천해줘." },
    { label: "💻 개발 코딩 & 멀티태스킹 쾌적한 조합", query: "프로그래밍 개발 및 도커, 가상머신 구동을 원활히 할 수 있는 멀티코어 성능 위주의 견적을 추천해줘." }
  ];

  return (
    <div className="space-y-12 pb-12 animate-fade-in">
      
      {/* Hero Section & Centralized AI Hub */}
      <section className="py-2 sm:py-6 max-w-4xl mx-auto space-y-6">
        
        {/* Dynamic Header */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-gradient-to-r from-blue-950/40 to-indigo-950/40 text-blue-400 border border-blue-900/40"
          >
            <Activity className="w-3.5 h-3.5 animate-pulse text-blue-500" />
            INTELLIGENT SITE-CONTROL AI PLATFORM
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent italic">COM SPEC AI ADVISOR</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            원하는 사양 조건을 이야기하면 사이트 하드웨어 사양을 동적 대조하여 딱 알맞은 최적 매치업 조합을 추천합니다.
          </p>
        </div>

        {/* AI Chat Console Panel - Glowing Glassy Layout */}
        <div className="relative overflow-hidden rounded-2xl bg-[#121215]/90 border border-slate-800 shadow-2xl flex flex-col h-[520px]">
          
          {/* Console Header */}
          <div className="px-5 py-3.5 bg-[#17171c] border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-200 tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                지능형 컴퓨터 추천 AI ADVISOR 콘솔
              </span>
            </div>
            <button
              onClick={handleClearHistory}
              title="대화 초기화"
              className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>초기화</span>
            </button>
          </div>

          {/* Chat Messages Viewport */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start gap-3.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border ${
                    msg.role === 'user' 
                      ? 'bg-blue-900/30 border-blue-800 text-blue-400' 
                      : 'bg-indigo-950/50 border-indigo-900/50 text-indigo-400'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4.5 h-4.5" />}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600/10 text-slate-200 border border-blue-500/20'
                      : 'bg-[#18181f]/80 text-slate-300 border border-slate-850'
                  }`}>
                    {/* Render Content */}
                    <div className="space-y-1">
                      {renderMarkdownText(msg.content)}
                    </div>

                    {/* Grounded Recommended Parts Section */}
                    {msg.recommendedParts && msg.recommendedParts.length > 0 && (() => {
                      const validParts = msg.recommendedParts
                        .map(itemRec => COMPONENTS_DATA.find(c => c.id === itemRec.id))
                        .filter((spec): spec is NonNullable<typeof spec> => !!spec);
                      
                      const totalSum = validParts.reduce((sum, spec) => sum + spec.price, 0);
                      
                      const handleAddAllToEstimate = () => {
                        validParts.forEach(spec => {
                          addToEstimate(spec.category, spec);
                        });
                        setView('estimate');
                      };

                      return (
                        <div className="mt-4 pt-3 border-t border-slate-850 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0F0F12]/80 border border-blue-900/30 rounded-xl p-3.5 shadow-inner">
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest flex items-center gap-1">
                                <Cpu className="w-3 h-3 animate-pulse text-blue-400" />
                                AI 추천 견적 합계 금액
                              </p>
                              <div className="text-base sm:text-lg font-black text-white flex items-baseline gap-1">
                                <span className="text-slate-400 text-xs font-medium">총합</span>
                                <span className="text-blue-400 font-mono font-extrabold">{formatPrice(totalSum)}</span>
                                <span className="text-[10px] text-slate-500 font-bold ml-1">({validParts.length}개 품목)</span>
                              </div>
                            </div>
                            <button
                              onClick={handleAddAllToEstimate}
                              className="px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white text-xs font-black rounded-lg transition-all shadow-md hover:shadow-indigo-500/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                            >
                              <ClipboardList className="w-3.5 h-3.5" />
                              <span>전체 부품 견적 담기 & 이동</span>
                            </button>
                          </div>

                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pl-0.5">
                            <Cpu className="w-3.5 h-3.5 text-blue-400" />
                            AI 큐레이팅 추천 스펙 제품 구성원
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {msg.recommendedParts.map((itemRec) => {
                              const spec = COMPONENTS_DATA.find(c => c.id === itemRec.id);
                              if (!spec) return null;
                              const isAdded = estimate[spec.category]?.id === spec.id;
                              return (
                                <div 
                                  key={itemRec.id}
                                  className="p-3 rounded-lg bg-[#0F0F12] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-2"
                                >
                                  <div>
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">
                                        {spec.category}
                                      </span>
                                      <span className="text-xs font-mono font-extrabold text-blue-400">
                                        {formatPrice(spec.price)}
                                      </span>
                                    </div>
                                    <h5 className="text-xs font-bold text-white mt-1.5 truncate">
                                      {spec.name}
                                    </h5>
                                    <p className="text-[10px] text-slate-500 leading-normal mt-1">
                                      {itemRec.reason}
                                    </p>
                                  </div>
                                  <div className="flex gap-1.5 mt-1">
                                    <button
                                      onClick={() => handleComparePartDirectly(spec.id)}
                                      className="flex-1 py-1.5 bg-blue-950/20 hover:bg-blue-900/40 border border-blue-900/30 hover:border-blue-700/50 rounded-md text-[10px] font-bold text-blue-300 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
                                      title="이 부품을 비교 대상에 등록합니다."
                                    >
                                      <Scale className="w-3 h-3" />
                                      <span>비교하기</span>
                                    </button>
                                    {onOpenPriceCompare && (
                                      <button
                                        onClick={() => onOpenPriceCompare(spec)}
                                        className="px-2 py-1.5 bg-indigo-950/30 hover:bg-indigo-900/40 border border-indigo-900/30 hover:border-indigo-700/50 rounded-md text-[10px] font-bold text-indigo-300 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
                                        title="실시간 판매처 최저가 비교"
                                      >
                                        <ShoppingCart className="w-3 h-3" />
                                        <span>최저가</span>
                                      </button>
                                    )}
                                    <button
                                      onClick={() => {
                                        if (isAdded) {
                                          removeFromEstimate(spec.category);
                                        } else {
                                          addToEstimate(spec.category, spec);
                                        }
                                      }}
                                      className={`flex-1 py-1.5 border rounded-md text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                        isAdded
                                          ? 'bg-emerald-600/20 hover:bg-rose-950/20 text-emerald-400 hover:text-rose-400 border-emerald-500/30 hover:border-rose-900/30'
                                          : 'bg-indigo-600/80 hover:bg-indigo-500 text-white border-indigo-500/30'
                                      }`}
                                      title={isAdded ? "견적에서 제거합니다." : "내 견적서에 추가합니다."}
                                    >
                                      {isAdded ? (
                                        <>
                                          <Check className="w-3 h-3 text-emerald-400" />
                                          <span>견적 담김</span>
                                        </>
                                      ) : (
                                        <>
                                          <ClipboardList className="w-3 h-3" />
                                          <span>견적 담기</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Head-to-Head suggested matchups */}
                    {msg.suggestedComparisons && msg.suggestedComparisons.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-850 space-y-2">
                        <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5" />
                          AI 제안 상세 대조군 매치업 바로가기
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestedComparisons.map((match, mIdx) => (
                            <button
                              key={mIdx}
                              onClick={() => handleStartMatchup(match.leftId, match.rightId, match.category as ComponentCategory)}
                              className="px-3 py-1.5 bg-indigo-950/30 hover:bg-indigo-900/40 border border-indigo-500/20 hover:border-indigo-500/50 text-indigo-300 hover:text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Scale className="w-3 h-3 text-indigo-400" />
                              <span>{match.label}</span>
                              <ChevronRight className="w-3 h-3 text-indigo-400" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3.5"
                >
                  <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border bg-indigo-950/50 border-indigo-900/50 text-indigo-400">
                    <Bot className="w-4.5 h-4.5 animate-pulse" />
                  </div>
                  <div className="bg-[#18181f]/80 text-slate-400 border border-slate-850 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
                    <span>사이트 데이터베이스를 기반으로 최적 부품 조합을 분석하는 중입니다...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Quick Preset Prompts */}
          <div className="px-5 py-2.5 bg-[#17171c]/40 border-t border-slate-850 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
            <span className="text-[10px] text-slate-500 font-bold shrink-0 uppercase tracking-widest flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-slate-500" />
              퀵 질문:
            </span>
            <div className="flex gap-2">
              {presetChips.map((chip, cIdx) => (
                <button
                  key={cIdx}
                  onClick={() => handleSend(chip.query)}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-[#17171c] hover:bg-slate-800 border border-slate-800/80 rounded-full text-[11px] font-semibold text-slate-300 hover:text-white whitespace-nowrap transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Console Text Input Area */}
          <div className="p-4 bg-[#17171c] border-t border-slate-800/80 shrink-0">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSend();
                  }
                }}
                disabled={isLoading}
                placeholder="예: 내 예산 100만원대로 게임과 문서작업에 딱 맞는 알맞은 컴퓨터 사양 구성 가이드해 줘."
                className="w-full bg-[#0E0E10] border border-slate-800 focus:border-slate-700 text-slate-100 placeholder-slate-600 rounded-xl pl-4 pr-12 py-3.5 text-sm outline-none transition-all shadow-inner disabled:opacity-60"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 p-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Quick Navigate Category Chips */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="pt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 max-w-5xl mx-auto"
        >
          <button
            id="home-btn-cpu"
            onClick={() => {
              setCategory('CPU');
              setView('compare');
            }}
            className="px-4 py-3 bg-[#111113] hover:bg-blue-600 text-slate-300 hover:text-white font-bold rounded-xl border border-slate-800/80 hover:border-blue-500/50 shadow-md transition-all duration-300 flex flex-col items-center justify-center gap-1.5 text-xs cursor-pointer"
          >
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>CPU</span>
          </button>
          <button
            id="home-btn-gpu"
            onClick={() => {
              setCategory('GPU');
              setView('compare');
            }}
            className="px-4 py-3 bg-[#111113] hover:bg-emerald-600 text-slate-300 hover:text-white font-bold rounded-xl border border-slate-800/80 hover:border-emerald-500/50 shadow-md transition-all duration-300 flex flex-col items-center justify-center gap-1.5 text-xs cursor-pointer"
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>GPU</span>
          </button>
          <button
            id="home-btn-ram"
            onClick={() => {
              setCategory('RAM');
              setView('compare');
            }}
            className="px-4 py-3 bg-[#111113] hover:bg-purple-600 text-slate-300 hover:text-white font-bold rounded-xl border border-slate-800/80 hover:border-purple-500/50 shadow-md transition-all duration-300 flex flex-col items-center justify-center gap-1.5 text-xs cursor-pointer"
          >
            <Database className="w-4 h-4 text-purple-400" />
            <span>메모리 (RAM)</span>
          </button>
          <button
            id="home-btn-ssd"
            onClick={() => {
              setCategory('SSD');
              setView('compare');
            }}
            className="px-4 py-3 bg-[#111113] hover:bg-cyan-600 text-slate-300 hover:text-white font-bold rounded-xl border border-slate-800/80 hover:border-cyan-500/50 shadow-md transition-all duration-300 flex flex-col items-center justify-center gap-1.5 text-xs cursor-pointer"
          >
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <span>저장장치 (SSD)</span>
          </button>
          <button
            id="home-btn-cooler"
            onClick={() => {
              setCategory('COOLER');
              setView('compare');
            }}
            className="px-4 py-3 bg-[#111113] hover:bg-sky-600 text-slate-300 hover:text-white font-bold rounded-xl border border-slate-800/80 hover:border-sky-500/50 shadow-md transition-all duration-300 flex flex-col items-center justify-center gap-1.5 text-xs cursor-pointer"
          >
            <Snowflake className="w-4 h-4 text-sky-400" />
            <span>CPU 쿨러</span>
          </button>
          <button
            id="home-btn-case"
            onClick={() => {
              setCategory('CASE');
              setView('compare');
            }}
            className="px-4 py-3 bg-[#111113] hover:bg-pink-600 text-slate-300 hover:text-white font-bold rounded-xl border border-slate-800/80 hover:border-pink-500/50 shadow-md transition-all duration-300 flex flex-col items-center justify-center gap-1.5 text-xs cursor-pointer"
          >
            <Box className="w-4 h-4 text-pink-400" />
            <span>케이스</span>
          </button>
          <button
            id="home-btn-psu"
            onClick={() => {
              setCategory('PSU');
              setView('compare');
            }}
            className="px-4 py-3 bg-[#111113] hover:bg-amber-600 text-slate-300 hover:text-white font-bold rounded-xl border border-slate-800/80 hover:border-amber-500/50 shadow-md transition-all duration-300 flex flex-col items-center justify-center gap-1.5 text-xs cursor-pointer"
          >
            <Power className="w-4 h-4 text-amber-400" />
            <span>파워</span>
          </button>
        </motion.div>
      </section>



      {/* Trending Direct Matches */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-4.5 h-4.5 text-orange-500 animate-pulse" />
              실시간 주요 카테고리별 화제의 하드웨어 대조 매치업
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              가장 대중적이며 비교 요청이 빈번한 대조군 조합입니다. 클릭 시 대조 분석 패널로 즉시 이동됩니다.
            </p>
          </div>
          <div className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800/60 px-2.5 py-1 rounded">
            클릭 시 대조 분석기 바로가기
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          
          {/* Match 1: RAM Match */}
          <button
            id="trending-match-1"
            onClick={() => handleStartMatchup('ram-ddr5-gskill-6000-cl30-32g', 'ram-ddr5-samsung-5600-16g', 'RAM')}
            className="p-4 rounded-xl bg-[#161618]/40 hover:bg-[#161618]/80 border border-slate-800 hover:border-purple-500/20 text-left transition-all duration-300 group shadow-md cursor-pointer"
          >
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[9px] font-bold uppercase text-purple-400 bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-900/30">RAM MATCH</span>
              <span className="text-[10px] text-slate-500 font-bold">인기순위 #1</span>
            </div>
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors truncate">
                G.SKILL DDR5 6000 CL30 (32GB)
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1 select-none">
                <div className="h-px bg-slate-800 flex-1" />
                <span className="font-mono text-[9px]">VS</span>
                <div className="h-px bg-slate-800 flex-1" />
              </div>
              <div className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors truncate">
                삼성전자 DDR5-5600 (16GB)
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-semibold group-hover:text-purple-400 transition-colors">
              <span>튜닝메모리 vs 순정 메모리</span>
              <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Match 2: SSD Match */}
          <button
            id="trending-match-2"
            onClick={() => handleStartMatchup('ssd-samsung-990pro-1t', 'ssd-hynix-p41-1t', 'SSD')}
            className="p-4 rounded-xl bg-[#161618]/40 hover:bg-[#161618]/80 border border-slate-800 hover:border-cyan-500/20 text-left transition-all duration-300 group shadow-md cursor-pointer"
          >
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[9px] font-bold uppercase text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-900/30">SSD MATCH</span>
              <span className="text-[10px] text-slate-500 font-bold">하이엔드</span>
            </div>
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors truncate">
                삼성전자 990 PRO (1TB)
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1 select-none">
                <div className="h-px bg-slate-800 flex-1" />
                <span className="font-mono text-[9px]">VS</span>
                <div className="h-px bg-slate-800 flex-1" />
              </div>
              <div className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors truncate">
                SK하이닉스 Platinum P41 (1TB)
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-semibold group-hover:text-cyan-400 transition-colors">
              <span>PCIe 4.0 최강 대결</span>
              <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Match 3: Case Match */}
          <button
            id="trending-match-3"
            onClick={() => handleStartMatchup('case-darkflash-dlx21-mesh', 'case-abko-g30-elisia', 'CASE')}
            className="p-4 rounded-xl bg-[#161618]/40 hover:bg-[#161618]/80 border border-slate-800 hover:border-pink-500/20 text-left transition-all duration-300 group shadow-md cursor-pointer"
          >
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[9px] font-bold uppercase text-pink-400 bg-pink-950/40 px-1.5 py-0.5 rounded border border-pink-900/30">CASE MATCH</span>
              <span className="text-[10px] text-slate-500 font-bold">인기순위 #2</span>
            </div>
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors truncate">
                darkFlash DLX21 MESH
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1 select-none">
                <div className="h-px bg-slate-800 flex-1" />
                <span className="font-mono text-[9px]">VS</span>
                <div className="h-px bg-slate-800 flex-1" />
              </div>
              <div className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors truncate">
                앱코 NCORE G30 엘리시아
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-semibold group-hover:text-pink-400 transition-colors">
              <span>베스트셀러 미들타워</span>
              <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Match 4: PSU Match */}
          <button
            id="trending-match-4"
            onClick={() => handleStartMatchup('psu-seasonic-focus-850', 'psu-micronics-classic-700', 'PSU')}
            className="p-4 rounded-xl bg-[#161618]/40 hover:bg-[#161618]/80 border border-slate-800 hover:border-amber-500/20 text-left transition-all duration-300 group shadow-md cursor-pointer"
          >
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[9px] font-bold uppercase text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-900/30">PSU MATCH</span>
              <span className="text-[10px] text-slate-500 font-bold">용량 & 등급</span>
            </div>
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors truncate">
                시소닉 FOCUS GX-850 Gold
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1 select-none">
                <div className="h-px bg-slate-800 flex-1" />
                <span className="font-mono text-[9px]">VS</span>
                <div className="h-px bg-slate-800 flex-1" />
              </div>
              <div className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors truncate">
                마이크로닉스 Classic II 700W
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-semibold group-hover:text-amber-400 transition-colors">
              <span>골드 풀모듈러 vs 브론즈 가성비</span>
              <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Match 5: Cooler Match */}
          <button
            id="trending-match-5"
            onClick={() => handleStartMatchup('cooler-thermalright-peerless-assassin-120-se', 'cooler-nzxt-kraken-360', 'COOLER')}
            className="p-4 rounded-xl bg-[#161618]/40 hover:bg-[#161618]/80 border border-slate-800 hover:border-sky-500/20 text-left transition-all duration-300 group shadow-md cursor-pointer"
          >
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[9px] font-bold uppercase text-sky-400 bg-sky-950/40 px-1.5 py-0.5 rounded border border-sky-900/30">COOLER MATCH</span>
              <span className="text-[10px] text-slate-500 font-bold">공랭 vs 수랭</span>
            </div>
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors truncate">
                Thermalright Assassin 120 SE
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1 select-none">
                <div className="h-px bg-slate-800 flex-1" />
                <span className="font-mono text-[9px]">VS</span>
                <div className="h-px bg-slate-800 flex-1" />
              </div>
              <div className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors truncate">
                NZXT KRAKEN 360 RGB
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-semibold group-hover:text-sky-400 transition-colors">
              <span>대장급 공랭 vs 하이엔드 수랭</span>
              <ChevronRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

        </div>
      </section>

      {/* Platform Advantages Grid */}
      <section className="space-y-4">
        <h3 className="text-base font-bold text-slate-300 border-b border-slate-800/80 pb-3">
          ComSpec 하드웨어 분석 코어 엔진 특징
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <div className="p-5 rounded-xl bg-[#161618]/30 border border-slate-800/60 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-950/40 text-blue-400 border border-blue-900/30 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">공인 벤치마크 정밀 통합</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              CPU/GPU 연산 스코어뿐만 아니라 메모리 대역폭, SSD 전송 속도 등 공식 규격 측정 데이터를 정밀 반영하여 왜곡 없는 팩트 데이터만 비교합니다.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#161618]/30 border border-slate-800/60 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-950/40 text-orange-400 border border-orange-900/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-orange-400" />
            </div>
            <h4 className="text-sm font-bold text-white">동적 강점 분석 & 추천 용도 매핑</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              두 부품간 가격 차이, 성능 등급, 물리 사양(쿨링팬 수, 최대 장착 길이, 정격 용량) 등을 계산하여 용도별 강점을 즉시 산출하고 사용자 선택을 보좌합니다.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#161618]/30 border border-slate-800/60 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 flex items-center justify-center">
              <Scale className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-sm font-bold text-white">실시간 규격 매칭 가이드</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              소켓 규격, 폼팩터, 전력 설계 제한, 물리 간섭 제약사항 등을 통합적으로 진단하여 사용자 조립 환경의 잠재 오류를 선제적으로 최소화합니다.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
