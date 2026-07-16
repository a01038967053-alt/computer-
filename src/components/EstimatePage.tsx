import React, { useState, useMemo } from 'react';
import { 
  Cpu, 
  Activity, 
  Layers, 
  HardDrive, 
  Zap, 
  Box, 
  Power, 
  ClipboardList, 
  Trash2, 
  Share2, 
  AlertTriangle, 
  Plus, 
  RotateCcw, 
  Check, 
  Scale, 
  Search, 
  X,
  ShieldCheck,
  Flame,
  Gauge,
  ThumbsUp,
  ChevronRight,
  ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ComponentSpec, ComponentCategory } from '../types';
import { COMPONENTS_DATA } from '../data';

interface EstimatePageProps {
  estimate: Record<ComponentCategory, ComponentSpec | null>;
  addToEstimate: (cat: ComponentCategory, comp: ComponentSpec) => void;
  removeFromEstimate: (cat: ComponentCategory) => void;
  clearEstimate: () => void;
  setView: (view: 'home' | 'compare' | 'estimate') => void;
  setCategory: (category: ComponentCategory) => void;
  formatPrice: (price: number) => string;
  onOpenPriceCompare?: (part: ComponentSpec) => void;
}

export default function EstimatePage({
  estimate,
  addToEstimate,
  removeFromEstimate,
  clearEstimate,
  setView,
  setCategory,
  formatPrice,
  onOpenPriceCompare
}: EstimatePageProps) {
  const [activeSelectCategory, setActiveSelectCategory] = useState<ComponentCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Category Configuration
  const categoriesList = useMemo(() => [
    { 
      id: 'CPU' as ComponentCategory, 
      name: 'CPU (프로세서)', 
      icon: Cpu, 
      placeholder: 'CPU를 선택해 주세요', 
      specDesc: '코어/스레드 및 고주파 주파수 연산 성능' 
    },
    { 
      id: 'GPU' as ComponentCategory, 
      name: 'GPU (그래픽카드)', 
      icon: Activity, 
      placeholder: '그래픽카드를 선택해 주세요', 
      specDesc: '3D 그래픽 프레임 가속 및 광선 추적 코어' 
    },
    { 
      id: 'RAM' as ComponentCategory, 
      name: 'RAM (메모리)', 
      icon: Layers, 
      placeholder: '메모리를 선택해 주세요', 
      specDesc: '메모리 동작 주파수 대역폭 및 레이턴시 타이밍' 
    },
    { 
      id: 'SSD' as ComponentCategory, 
      name: 'SSD (초고속 스토리지)', 
      icon: HardDrive, 
      placeholder: '저장장치를 선택해 주세요', 
      specDesc: 'PCIe 레인 대역폭 및 초고속 순차 데이터 쓰기 성능' 
    },
    { 
      id: 'COOLER' as ComponentCategory, 
      name: 'COOLER (쿨러)', 
      icon: Zap, 
      placeholder: 'CPU 쿨러를 선택해 주세요', 
      specDesc: '공랭/수랭 해소 열량 효율성 및 저소음 쿨링팬' 
    },
    { 
      id: 'CASE' as ComponentCategory, 
      name: 'CASE (케이스)', 
      icon: Box, 
      placeholder: '본체 케이스를 선택해 주세요', 
      specDesc: '메인보드 장착 면적 및 공기 흐름, 장착 여유 치수' 
    },
    { 
      id: 'PSU' as ComponentCategory, 
      name: 'PSU (정격 파워)', 
      icon: Power, 
      placeholder: '전원 공급 장치를 선택해 주세요', 
      specDesc: '고부하 상황 대비 안정적인 정격 출력 가용 전력' 
    },
  ], []);

  // Filter products for inline selection list
  const filteredProducts = useMemo(() => {
    if (!activeSelectCategory) return [];
    return COMPONENTS_DATA.filter(item => {
      if (item.category !== activeSelectCategory) return false;
      if (!searchQuery) return true;
      return item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [activeSelectCategory, searchQuery]);

  // Calculations
  const totalPrice = useMemo(() => {
    return Object.values(estimate).reduce((sum, item) => sum + (item?.price || 0), 0);
  }, [estimate]);

  const totalTdp = useMemo(() => {
    // Basic baseline draw is about 50W (Motherboard, RAM, active SSD, Case Fans)
    let power = 50;
    if (estimate.CPU?.tdp) power += estimate.CPU.tdp;
    if (estimate.GPU?.tdp) power += estimate.GPU.tdp;
    return power;
  }, [estimate.CPU, estimate.GPU]);

  const psuCapacity = useMemo(() => {
    return estimate.PSU?.ratedPower || 0;
  }, [estimate.PSU]);

  // System Diagnostics
  const diagnostics = useMemo(() => {
    const alerts: { type: 'success' | 'warning' | 'info'; text: string }[] = [];
    
    // 1. PSU Capacity Check
    if (estimate.PSU) {
      if (psuCapacity < totalTdp) {
        alerts.push({
          type: 'warning',
          text: `파워 공급 용량이 부족합니다. 현재 시스템 최대 예상 소모량(${totalTdp}W)이 파워 용량(${psuCapacity}W)보다 많아 고부하 작업 시 시스템이 꺼질 위험이 큽니다. 정격 ${Math.max(600, totalTdp + 150)}W 이상을 권장합니다.`
        });
      } else if (psuCapacity < totalTdp + 100) {
        alerts.push({
          type: 'info',
          text: `파워 용량이 다소 유동적입니다. 예상 전력(${totalTdp}W) 대비 안전 마진이 부족하므로 가급적 정격 ${totalTdp + 150}W 이상의 전원 공급장치를 활용하는 편이 노이즈 해소에 좋습니다.`
        });
      } else {
        alerts.push({
          type: 'success',
          text: `정격 출력 설계 만족: 파워 정격 용량(${psuCapacity}W)이 총 전력 요구량(${totalTdp}W)을 상회하여 안정 마진이 약 ${psuCapacity - totalTdp}W 확보되었습니다.`
        });
      }
    } else if (estimate.CPU || estimate.GPU) {
      alerts.push({
        type: 'info',
        text: `현재 CPU/GPU 스펙 기준 정격 용량 ${Math.max(600, totalTdp + 150)}W 이상 등급의 파워서플라이 배정을 권장 드립니다.`
      });
    }

    // 2. RAM vs CPU AM5 Socket Check
    if (estimate.CPU && estimate.RAM) {
      const isAM5 = estimate.CPU.socketOrInterface === 'AM5';
      const isDDR4 = estimate.RAM.memoryType === 'DDR4';
      if (isAM5 && isDDR4) {
        alerts.push({
          type: 'warning',
          text: 'AMD AM5 규격 호환 경고: 선택하신 Ryzen 프로세서는 DDR5 메모리만 호환됩니다. DDR4 제품은 실장할 수 없으니 DDR5 메모리로 변경해 주십시오.'
        });
      }
    }

    // 3. Case vs GPU Length Check
    if (estimate.CASE && estimate.GPU) {
      const caseMaxLen = estimate.CASE.maxGpuLength || 350; // default safe fallback
      // Estimate GPU size from score / performance level if not specified
      const estimatedGpuLen = estimate.GPU.brand === 'NVIDIA' && estimate.GPU.name.includes('4090') ? 340 : 280;
      if (estimatedGpuLen > caseMaxLen) {
        alerts.push({
          type: 'warning',
          text: `케이스 장착 공간 협소: 선택한 그래픽카드(${estimate.GPU.name}, 약 ${estimatedGpuLen}mm)가 케이스 가용 슬롯 제한(${caseMaxLen}mm)을 초과할 가능성이 매우 높습니다. 메인 공간 치수를 확인하십시오.`
        });
      }
    }

    // 4. Liquid Cooler vs Case
    if (estimate.COOLER && estimate.CASE) {
      const isLiquid = estimate.COOLER.coolerType?.includes('수랭');
      if (isLiquid && estimate.CASE.caseSize?.includes('Mini')) {
        alerts.push({
          type: 'info',
          text: '수랭식 쿨러 호환 안내: 미니 케이스에 수랭 라디에이터(3열 등)를 장착할 시 상단/전면 규격 호환 정보를 반드시 검토해 주셔야 합니다.'
        });
      }
    }

    if (alerts.length === 0) {
      alerts.push({
        type: 'success',
        text: '현재 구성된 부품 간 심각한 물리적/전기적 충돌 징후가 없습니다. 빌드 호환성이 안정적입니다.'
      });
    }

    return alerts;
  }, [estimate, totalTdp, psuCapacity]);

  // Overall PC Grade
  const buildGrade = useMemo(() => {
    if (totalPrice === 0) return { title: 'D-Grade 기초 설계', desc: '부품을 선택하여 빌드를 완성해 보세요', color: 'text-slate-400 border-slate-800' };
    
    // Core check on CPU & GPU
    const hasCore = estimate.CPU && estimate.GPU;
    if (!hasCore) return { title: 'C-Grade 사무용/멀티미디어', desc: 'CPU 혹은 외장 GPU 보강 시 완전한 3D 성능 등급 산정이 가능합니다.', color: 'text-yellow-400 border-yellow-900/40 bg-yellow-950/10' };

    if (totalPrice >= 2500000) {
      return { 
        title: 'S-Grade 최상위 워크스테이션', 
        desc: '4K 해상도 풀옵션 게이밍 및 머신러닝, 프로덕션급 렌더링에 적합한 궁극의 빌드', 
        color: 'text-indigo-400 border-indigo-900/50 bg-indigo-950/10 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
      };
    }
    if (totalPrice >= 1500000) {
      return { 
        title: 'A-Grade 초고성능 다목적 빌드', 
        desc: 'QHD 초고주사율 원활한 플레이 및 정밀 영상 편집, 쾌적한 멀티태스킹 최적 구성', 
        color: 'text-blue-400 border-blue-900/50 bg-blue-950/10' 
      };
    }
    return { 
      title: 'B-Grade 합리적 게이밍 가성비', 
      desc: 'FHD 초정밀 게임용 및 스탠다드 비즈니스 용도에 완벽하게 부합하는 실속형 최강 구성', 
      color: 'text-emerald-400 border-emerald-900/50 bg-emerald-950/10' 
    };
  }, [totalPrice, estimate.CPU, estimate.GPU]);

  // Copy build to clipboard
  const handleCopyText = () => {
    let text = `================ [ComSpec PC 견적서] ================\n`;
    text += `📅 작성 일시: ${new Date().toLocaleDateString('ko-KR')} 기준\n`;
    text += `💰 총 합계 금액: ${formatPrice(totalPrice)}\n`;
    text += `⚡ 예상 최대 시스템 전력 소모량: 약 ${totalTdp}W\n`;
    text += `----------------------------------------------------\n`;
    
    categoriesList.forEach(cat => {
      const selected = estimate[cat.id];
      if (selected) {
        text += `■ ${cat.name}: ${selected.name} (${selected.brand}) - ${formatPrice(selected.price)}\n`;
      } else {
        text += `■ ${cat.name}: [미지정]\n`;
      }
    });
    
    text += `----------------------------------------------------\n`;
    text += `🏆 종합 평가 등급: ${buildGrade.title}\n`;
    text += `📢 ${buildGrade.desc}\n`;
    text += `====================================================\n`;
    text += `* ComSpec 계량 데이터 분석기를 통해 출력된 정밀 리포트입니다.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Intro Panel */}
      <section className="text-center flex flex-col items-center">
        <div className="mb-4 flex gap-3 items-center">
          <button
            id="back-to-home-from-estimate"
            onClick={() => setView('home')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors py-1 px-2.5 bg-[#161618] border border-slate-800 rounded-lg shadow-sm cursor-pointer"
          >
            ← 메인 홈
          </button>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-indigo-950/30 text-indigo-400 border border-indigo-900/50">
            <ClipboardList className="w-3.5 h-3.5" />
            PC BUILD SHEET COMPILER
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
          나만의 <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent italic">스마트 견적서</span>
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          엄선하여 비교하고 담은 부품들을 바탕으로 최적의 단가와 전력 소비량, 부품 호환성을 정밀하게 진단합니다.
        </p>
      </section>

      {/* Main Grid: Build slots on left, Pricing & Diagnostics on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Build Slots (Grid spans 7 on desktop) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 bg-[#161618] border border-slate-800 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">부품 구성 슬롯 ({Object.values(estimate).filter(Boolean).length} / 7)</span>
            {Object.values(estimate).filter(Boolean).length > 0 && (
              <button
                id="btn-clear-estimate-all"
                onClick={clearEstimate}
                className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 px-2 py-1 rounded bg-rose-950/10 border border-rose-900/30 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                전체 초기화
              </button>
            )}
          </div>

          <div className="space-y-3">
            {categoriesList.map((cat) => {
              const selected = estimate[cat.id];
              const IconComponent = cat.icon;
              
              return (
                <div 
                  key={cat.id}
                  className={`p-4 rounded-2xl border transition-all duration-300 relative ${
                    selected 
                      ? 'bg-[#161618]/80 border-slate-800 shadow-md' 
                      : 'bg-[#111113]/30 border-dashed border-slate-900 hover:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Part Icon & Info */}
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        selected 
                          ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/40' 
                          : 'bg-slate-900 text-slate-600 border border-slate-950'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">{cat.name}</span>
                          {selected && (
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                              selected.brand === 'Intel' || selected.brand === 'NVIDIA'
                                ? 'bg-blue-950/40 text-blue-400 border border-blue-900/40'
                                : selected.brand === 'AMD'
                                ? 'bg-orange-950/40 text-orange-400 border border-orange-900/40'
                                : 'bg-slate-950/40 text-slate-400 border border-slate-800'
                            }`}>
                              {selected.brand}
                            </span>
                          )}
                        </div>
                        {selected ? (
                          <h4 className="text-sm font-bold text-white tracking-tight sm:max-w-md truncate">
                            {selected.name}
                          </h4>
                        ) : (
                          <p className="text-xs text-slate-500 font-medium">
                            {cat.placeholder}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                          {selected ? (
                            <>
                              {cat.id === 'CPU' && `코어 ${selected.cores} | 스레드 ${selected.threads} | TDP ${selected.tdp}W | ${selected.cacheOrMemory}`}
                              {cat.id === 'GPU' && `TDP ${selected.tdp}W | 부스트 ${selected.boostClock}MHz | ${selected.cacheOrMemory}`}
                              {cat.id === 'RAM' && `${selected.memoryType} | 주파수 ${selected.baseClock}MHz | 타이밍 ${selected.timing} | ${selected.capacity}`}
                              {cat.id === 'SSD' && `${selected.ssdType} | 인터페이스 ${selected.nvmeGeneration} | 용량 ${selected.capacity} | TBW ${selected.tbw}TB`}
                              {cat.id === 'COOLER' && `${selected.coolerType}방식 | 쿨링팬 ${selected.fanCount}개 | 소음 ${selected.noiseLevel}`}
                              {cat.id === 'CASE' && `${selected.caseSize}규격 | GPU 호환 ${selected.maxGpuLength}mm | 수랭 라디 ${selected.radiatorSize}`}
                              {cat.id === 'PSU' && `${selected.psuEfficiency}등급 | 출력 ${selected.ratedPower}W | ${selected.psuModularType}`}
                            </>
                          ) : cat.specDesc}
                        </p>
                      </div>
                    </div>

                    {/* Actions and Price */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-900 pt-3 sm:pt-0">
                      {selected ? (
                        <>
                          <div className="text-right">
                            <span className="text-[9px] text-slate-500 block font-bold uppercase tracking-widest">Price</span>
                            <span className="text-sm font-bold font-mono text-white tracking-tight">
                              {formatPrice(selected.price)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {onOpenPriceCompare && (
                              <button
                                title="실시간 판매처별 최저가 비교 및 구매 정보"
                                onClick={() => onOpenPriceCompare(selected)}
                                className="px-2 py-1.5 bg-indigo-950/40 hover:bg-indigo-900/40 text-indigo-400 hover:text-indigo-300 border border-indigo-900/30 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>최저가</span>
                              </button>
                            )}
                            <button
                              title="부품 비교하러 가기"
                              onClick={() => {
                                setCategory(cat.id);
                                setView('compare');
                              }}
                              className="p-1.5 bg-[#111113] hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-lg text-xs cursor-pointer transition-colors"
                            >
                              비교
                            </button>
                            <button
                              id={`remove-estimate-btn-${cat.id}`}
                              onClick={() => removeFromEstimate(cat.id)}
                              className="p-1.5 bg-rose-950/10 hover:bg-rose-950/30 text-rose-400 hover:text-rose-300 border border-rose-900/30 rounded-lg text-xs cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5 w-full sm:w-auto">
                          <button
                            id={`quick-select-trigger-${cat.id}`}
                            onClick={() => {
                              setActiveSelectCategory(activeSelectCategory === cat.id ? null : cat.id);
                              setSearchQuery('');
                            }}
                            className="w-full sm:w-auto px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md shadow-indigo-500/10"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>직접 선택</span>
                          </button>
                          <button
                            onClick={() => {
                              setCategory(cat.id);
                              setView('compare');
                            }}
                            className="w-full sm:w-auto px-3 py-1.5 bg-[#161618] hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1"
                          >
                            <span>비교/대조 선택</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Inline product selector panel */}
                  <AnimatePresence>
                    {activeSelectCategory === cat.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-4 pt-4 border-t border-slate-900/80"
                      >
                        <div className="relative mb-3">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                          <input
                            type="text"
                            placeholder="검색할 부품 키워드나 제조사명을 입력해 주세요"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#111113] border border-slate-800 focus:border-indigo-600 rounded-xl py-2 pl-9 pr-8 text-xs font-medium text-white outline-none transition-all duration-300"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-900/60">
                          {filteredProducts.length > 0 ? (
                            filteredProducts.map((item) => (
                              <button
                                key={item.id}
                                id={`quick-select-item-${item.id}`}
                                onClick={() => {
                                  addToEstimate(cat.id, item);
                                  setActiveSelectCategory(null);
                                  setSearchQuery('');
                                }}
                                className="w-full text-left p-2 hover:bg-slate-800/40 rounded-lg text-xs flex items-center justify-between group transition-colors"
                              >
                                <div>
                                  <span className="font-bold text-slate-200 group-hover:text-white transition-colors">{item.name}</span>
                                  <div className="text-[10px] text-slate-500 mt-0.5">
                                    {cat.id === 'CPU' && `코어 ${item.cores} | TDP ${item.tdp}W`}
                                    {cat.id === 'GPU' && `TDP ${item.tdp}W | ${item.cacheOrMemory}`}
                                    {cat.id === 'RAM' && `${item.memoryType} | ${item.baseClock}MHz`}
                                    {cat.id === 'SSD' && `${item.ssdType} | ${item.nvmeGeneration}`}
                                    {cat.id === 'COOLER' && `${item.coolerType} | 수랭/공랭`}
                                    {cat.id === 'CASE' && `${item.caseSize}`}
                                    {cat.id === 'PSU' && `정격 ${item.ratedPower}W | ${item.psuEfficiency}`}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-slate-300 group-hover:text-white font-semibold">{formatPrice(item.price)}</span>
                                  <span className="text-[9px] bg-slate-900 text-slate-500 border border-slate-800 px-1.5 py-0.5 rounded font-black uppercase">{item.brand}</span>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="p-4 text-center text-xs text-slate-600">
                              등록된 상품군이 검색 필터에 없습니다.
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Calculations & Diagnostics (Spans 5 on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Bill Total Card */}
          <div className="p-6 rounded-3xl bg-[#161618] border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full filter blur-2xl pointer-events-none" />
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Core Bill Summary</span>
              <div>
                <span className="text-xs text-slate-400 block font-medium">총 견적 합계액</span>
                <div className="text-3xl sm:text-4xl font-extrabold text-white mt-1 font-mono tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent flex items-baseline gap-1">
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {/* Progress counter */}
              <div className="space-y-1.5 pt-2 border-t border-slate-900/60">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">부품 선택 진행도</span>
                  <span className="font-mono font-bold text-indigo-400">
                    {Object.values(estimate).filter(Boolean).length} / 7개 부품 지정
                  </span>
                </div>
                <div className="h-2 bg-[#111113] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(Object.values(estimate).filter(Boolean).length / 7) * 100}%` }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  />
                </div>
              </div>

              {/* Rating block */}
              <div className={`p-4 rounded-xl border ${buildGrade.color} transition-all duration-300 space-y-1`}>
                <span className="text-[10px] font-black uppercase tracking-wider opacity-60 block">시스템 종합 등급</span>
                <span className="text-sm font-black flex items-center gap-1.5">
                  <Scale className="w-4 h-4 shrink-0" />
                  {buildGrade.title}
                </span>
                <p className="text-xs opacity-80 leading-relaxed font-medium">
                  {buildGrade.desc}
                </p>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  id="btn-copy-estimate-text"
                  onClick={handleCopyText}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/10 cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>복사 완료!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>텍스트 견적서 복사</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setView('home')}
                  className="w-full py-3 bg-[#111113] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1"
                >
                  쇼룸에서 부품 구경하기
                </button>
              </div>
            </div>
          </div>

          {/* Wattage Analyzer */}
          <div className="p-6 rounded-3xl bg-[#161618] border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full filter blur-2xl pointer-events-none" />
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-amber-500" />
                예상 소비 전력 분석기 (TDP)
              </span>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#111113]/50 p-3 rounded-xl border border-slate-900">
                  <span className="text-[10px] text-slate-500 block font-semibold">시스템 최대 소비 요구량</span>
                  <span className="text-lg font-black font-mono text-amber-400 mt-1 block">
                    {totalTdp} <span className="text-xs text-slate-400 font-bold">W</span>
                  </span>
                </div>
                <div className="bg-[#111113]/50 p-3 rounded-xl border border-slate-900">
                  <span className="text-[10px] text-slate-500 block font-semibold">선택한 파워 정격 용량</span>
                  <span className={`text-lg font-black font-mono mt-1 block ${psuCapacity > 0 ? 'text-blue-400' : 'text-slate-600'}`}>
                    {psuCapacity > 0 ? `${psuCapacity}W` : '미지정'}
                  </span>
                </div>
              </div>

              {psuCapacity > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                    <span>파워 로드 지수</span>
                    <span>{Math.round((totalTdp / psuCapacity) * 100)}% 사용량</span>
                  </div>
                  <div className="h-2 bg-[#111113] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (totalTdp / psuCapacity) * 100)}%` }}
                      className={`h-full rounded-full ${
                        (totalTdp / psuCapacity) > 0.9 
                          ? 'bg-rose-500' 
                          : (totalTdp / psuCapacity) > 0.7 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>
              )}

              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                ※ 시스템 예상 요구량은 CPU 및 GPU 부스팅 Peak TDP에 메인보드 전원부 유휴 손실 전력인 약 50W를 추가하여 계산한 안전 지표량입니다.
              </p>
            </div>
          </div>

          {/* Compatibility Diagnostics */}
          <div className="p-6 rounded-3xl bg-[#161618] border border-slate-800 shadow-2xl space-y-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              호환성 정밀 진단 매트릭스
            </span>

            <div className="space-y-3">
              {diagnostics.map((diag, index) => (
                <div 
                  key={index} 
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 leading-relaxed font-medium ${
                    diag.type === 'success' 
                      ? 'bg-emerald-950/10 text-emerald-300 border-emerald-900/30' 
                      : diag.type === 'warning'
                      ? 'bg-rose-950/10 text-rose-300 border-rose-900/30' 
                      : 'bg-blue-950/10 text-blue-300 border-blue-900/30'
                  }`}
                >
                  {diag.type === 'success' && <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                  {diag.type === 'warning' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                  {diag.type === 'info' && <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />}
                  <span>{diag.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
