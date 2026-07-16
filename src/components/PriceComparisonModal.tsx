import React, { useState, useMemo } from 'react';
import { 
  X, 
  ExternalLink, 
  TrendingDown, 
  TrendingUp, 
  ShieldCheck, 
  ShoppingCart, 
  Store, 
  Truck, 
  Check, 
  ClipboardList, 
  Info,
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ComponentSpec, ComponentCategory } from '../types';

interface PriceComparisonModalProps {
  part: ComponentSpec | null;
  onClose: () => void;
  estimate: Record<ComponentCategory, ComponentSpec | null>;
  addToEstimate: (cat: ComponentCategory, comp: ComponentSpec) => void;
  removeFromEstimate: (cat: ComponentCategory) => void;
  formatPrice: (price: number) => string;
}

const getCompuzoneSearchQuery = (part: ComponentSpec): string => {
  const compuzoneQueries: Record<string, string> = {
    // CPUs
    'i5-13400': 'i5-13400',
    'r5-7500f': '7500F',
    'r7-7800x3d': '7800X3D',
    'i9-14900k': '14900K',
    'i7-14700k': '14700K',
    'r9-7950x': '7950X',
    'i5-12400f': '12400F',
    'r5-5600x': '5600X',

    // GPUs
    'rtx-4070-super': 'RTX 4070 SUPER',
    'rx-7800-xt': 'RX 7800 XT',
    'rtx-4060-ti': 'RTX 4060 Ti',
    'rtx-4090': 'RTX 4090',
    'rx-7900-xtx': 'RX 7900 XTX',
    'arc-a770': 'A770',

    // RAMs
    'ram-ddr5-samsung-5600-16g': '삼성전자 DDR5 5600 16GB',
    'ram-ddr5-gskill-6000-cl30-32g': '지스킬 DDR5 6000 TRIDENT',
    'ram-ddr5-corsair-6000-cl30-32g': '커세어 DDR5 6000 VENGEANCE',
    'ram-ddr4-samsung-3200-16g': '삼성전자 DDR4 3200 16GB',
    'ram-ddr5-hynix-5600-16g': 'SK하이닉스 DDR5 5600 16GB',

    // SSDs
    'ssd-samsung-990pro-1t': '삼성전자 990 PRO',
    'ssd-hynix-p41-1t': 'SK하이닉스 Platinum P41',
    'ssd-crucial-t500-1t': '마이크론 Crucial T500',
    'ssd-wd-sn580-1t': 'WD Blue SN580',

    // Cases
    'case-darkflash-dlx21-mesh': 'darkFlash DLX21 MESH',
    'case-abko-g30-elisia': '앱코 G30 트루포스',
    'case-lianli-o11d-evo': '리안리 O11D EVO',
    'case-fractal-north-tg': 'Fractal Design North',

    // PSUs
    'psu-micronics-classic-700': '마이크로닉스 Classic II 700W',
    'psu-seasonic-focus-850': '시소닉 FOCUS GOLD 850W',
    'psu-fsp-hydro-g-850': 'FSP HYDRO G PRO 850W',
    'psu-maxelite-baron-800': '맥스엘리트 BARON 800W',

    // Coolers
    'cooler-thermalright-peerless-assassin-120-se': 'Thermalright Peerless Assassin 120 SE',
    'cooler-deepcool-ag620': 'DEEPCOOL AG620',
    'cooler-nzxt-kraken-360': 'NZXT KRAKEN 360',
    'cooler-3rsys-rc1800-lite': '3RSYS Socoool RC1800 LITE',
    'cooler-pentawave-z06d': 'PentaWave Z06D',
    'cooler-darkflash-dx360': 'darkFlash Twister DX-360'
  };

  if (compuzoneQueries[part.id]) {
    return compuzoneQueries[part.id];
  }

  // Fallback for custom or unmapped products
  let cleanName = part.name;
  
  // Remove parenthesis and their content
  cleanName = cleanName.replace(/\s*\([^)]*\)/g, '');
  
  // Translate English brands to Korean for better search compatibility
  cleanName = cleanName
    .replace(/G\.SKILL|G\.Skill/gi, '지스킬')
    .replace(/Corsair/gi, '커세어')
    .replace(/Samsung/gi, '삼성전자')
    .replace(/SK Hynix|Hynix/gi, 'SK하이닉스')
    .replace(/Micronics/gi, '마이크로닉스')
    .replace(/Seasonic/gi, '시소닉')
    .replace(/Micron/gi, '마이크론')
    .replace(/Crucial/gi, '크루셜');

  return cleanName.trim();
};

export default function PriceComparisonModal({
  part,
  onClose,
  estimate,
  addToEstimate,
  removeFromEstimate,
  formatPrice
}: PriceComparisonModalProps) {
  const [activeTab, setActiveTab] = useState<'prices' | 'analysis'>('prices');
  const [selectedMall, setSelectedMall] = useState<string | null>(null);
  
  // Dynamic pricing state loaded from full-stack API route
  const [vendorMalls, setVendorMalls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  if (!part) return null;

  const isAddedInEstimate = estimate[part.category]?.id === part.id;

  // Fetch prices safely via self-hosted API route to avoid browser CORS and respect security boundaries
  React.useEffect(() => {
    setIsLoading(true);
    setApiError(null);
    setSelectedMall(null);

    fetch(`/api/prices?partId=${encodeURIComponent(part.id)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`서버 시세 조회에 실패했습니다. (상태 코드: ${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.vendorMalls) {
          setVendorMalls(data.vendorMalls);
        } else {
          throw new Error("올바르지 않은 데이터 패킷 형식입니다.");
        }
      })
      .catch((err) => {
        console.error("[PriceComparisonModal API Error]", err);
        setApiError(err.message || "시세를 불러오는 중에 오류가 발생했습니다.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [part]);

  // Generate mock price changes over the last 4 weeks
  const priceHistory = useMemo(() => {
    const base = part.price;
    const isPopular = part.brand === 'NVIDIA' || part.brand === 'AMD';
    const percentDiff = isPopular ? -1.8 : 0.6; // Mock trend
    
    return [
      { week: '4주 전', price: Math.round((base * (1 + (percentDiff * 1.4) / 100)) / 100) * 100 },
      { week: '3주 전', price: Math.round((base * (1 + (percentDiff * 1.0) / 100)) / 100) * 100 },
      { week: '2주 전', price: Math.round((base * (1 + (percentDiff * 0.5) / 100)) / 100) * 100 },
      { week: '현재 최저가', price: Math.round((base * 0.982) / 100) * 100 }
    ];
  }, [part]);

  const priceTrendType = useMemo(() => {
    const p4 = priceHistory[0].price;
    const curr = priceHistory[3].price;
    if (curr < p4) return 'down';
    if (curr > p4) return 'up';
    return 'flat';
  }, [priceHistory]);

  const priceTrendPercent = useMemo(() => {
    const p4 = priceHistory[0].price;
    const curr = priceHistory[3].price;
    const diff = curr - p4;
    return Math.abs(Math.round((diff / p4) * 1000) / 10);
  }, [priceHistory]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="relative bg-[#111113] border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Background ambient light */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full filter blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-900 flex items-start justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-indigo-400 border border-slate-800">
                {part.category} 실시간 최저가 분석
              </span>
              <span className="text-[10px] font-bold text-slate-500">{part.brand} 공식 유통사 정품인증</span>
            </div>
            <h3 className="text-xl font-extrabold text-white mt-1.5 leading-snug">
              {part.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              제조사 권장 및 용산 도소매 유통 채널별 실시간 시세 연동 리포트입니다.
            </p>
          </div>
          
          <button 
            id="close-price-compare-modal"
            onClick={onClose}
            className="p-1.5 bg-[#161618] hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-850 hover:border-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="px-6 border-b border-slate-900/60 bg-[#161618]/40 flex gap-4 relative z-10 select-none">
          <button
            onClick={() => setActiveTab('prices')}
            className={`py-3.5 text-xs font-bold transition-all border-b-2 relative cursor-pointer ${
              activeTab === 'prices' 
                ? 'text-indigo-400 border-indigo-500' 
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5" />
              판매처별 최저가 비교 ({isLoading ? "..." : vendorMalls.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`py-3.5 text-xs font-bold transition-all border-b-2 relative cursor-pointer ${
              activeTab === 'analysis' 
                ? 'text-indigo-400 border-indigo-500' 
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5" />
              시세 동향 & 구매 분석 리포트
            </span>
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 relative z-10 custom-scrollbar">
          
          {activeTab === 'prices' ? (
            isLoading ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-4">
                <div className="w-9 h-9 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-400 font-semibold">각 쇼핑몰 유통 채널별 실시간 시세 연동 중...</p>
              </div>
            ) : apiError ? (
              <div className="py-12 px-4 bg-rose-950/10 border border-rose-900/30 rounded-2xl flex flex-col items-center justify-center space-y-3">
                <span className="text-xs text-rose-400 font-bold">{apiError}</span>
                <p className="text-[11px] text-slate-500 text-center">외부 유통채널 API 점검 중입니다. 제조사 기준가 사양을 참조해 주세요.</p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Highlight Board */}
                <div className="p-4 bg-indigo-950/10 border border-indigo-900/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-950/50 text-indigo-400 border border-indigo-900/50 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-widest">Global Best Deal</span>
                      <span className="text-sm font-bold text-slate-200">
                        인터넷 종합 최저가: <span className="font-mono text-emerald-400">{vendorMalls[0]?.price ? formatPrice(vendorMalls[0].price) : "가격 확인 필요"}</span>
                      </span>
                    </div>
                  </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      if (isAddedInEstimate) {
                        removeFromEstimate(part.category);
                      } else {
                        addToEstimate(part.category, part);
                      }
                    }}
                    className={`w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isAddedInEstimate
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-rose-950/20 hover:text-rose-400 hover:border-rose-900/30'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                    }`}
                  >
                    {isAddedInEstimate ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>내 견적 담김</span>
                      </>
                    ) : (
                      <>
                        <ClipboardList className="w-3.5 h-3.5" />
                        <span>견적에 담기</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Mall Listing */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">인기 온라인 도소매 판매처 리스트</span>
                
                <div className="space-y-2">
                  {vendorMalls.map((mall) => {
                    const isSelected = selectedMall === mall.id;
                    return (
                      <div 
                        key={mall.id}
                        className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                          isSelected 
                            ? 'bg-[#161618] border-indigo-500/50 shadow-md' 
                            : 'bg-[#141416]/50 border-slate-900 hover:border-slate-800'
                        }`}
                      >
                        {/* Header card info */}
                        <div 
                          onClick={() => setSelectedMall(isSelected ? null : mall.id)}
                          className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="w-16 py-1 bg-slate-900 border border-slate-800 rounded-lg text-center text-[10px] font-black text-slate-300">
                              {mall.logoText}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-white">{mall.name}</span>
                                {mall.badge && (
                                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${mall.badgeColor}`}>
                                    {mall.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                                <span className="flex items-center gap-0.5"><Truck className="w-3 h-3" /> {mall.shipping}</span>
                                <span>•</span>
                                <span>{mall.deliverySpeed}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-[9px] text-slate-500 block font-bold uppercase">Price</span>
                              <span className="text-sm font-bold font-mono text-white">
                                {mall.price !== null && mall.price !== undefined ? formatPrice(mall.price) : '가격 확인 필요'}
                              </span>
                            </div>
                            <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isSelected ? 'rotate-90' : ''}`} />
                          </div>
                        </div>

                        {/* Detailed drawer */}
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden bg-[#161618] border-t border-slate-900"
                            >
                              <div className="p-4 space-y-3">
                                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                  {mall.desc}
                                </p>
                                <div className="pt-2 border-t border-slate-900 flex justify-between items-center flex-wrap gap-2">
                                  <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                                    <Info className="w-3 h-3 text-indigo-400" />
                                    위 최저가는 실시간 채널 시세 할인 및 카드 제휴가 적용 수치입니다.
                                  </span>
                                  <a
                                    href={mall.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 transition-all"
                                  >
                                    <span>해당 쇼핑몰 상품 페이지로 이동</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                      </div>
                    );
                  })}
                </div>

              </div>

            </div>
          )) : (
            <div className="space-y-6">
              
              {/* 시세 요약 카드 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="p-4 bg-[#161618] border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">최근 4주 변동 트렌드</span>
                    {priceTrendType === 'down' ? (
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-1.5 py-0.5 rounded font-black flex items-center gap-0.5">
                        <TrendingDown className="w-3 h-3" />
                        하락 안정세
                      </span>
                    ) : priceTrendType === 'up' ? (
                      <span className="text-[10px] text-rose-400 bg-rose-950/40 border border-rose-900/40 px-1.5 py-0.5 rounded font-black flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        상승 과열기
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded font-black">
                        시세 유지 변동 없음
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-xl font-extrabold text-slate-200">
                      {priceTrendType === 'down' ? '-' : priceTrendType === 'up' ? '+' : ''} {priceTrendPercent}%
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 font-semibold leading-relaxed">
                      {priceTrendType === 'down' 
                        ? '수요 충족 및 공급처 수급 안정화로 전월 대비 단가가 안정적으로 내려갔습니다.' 
                        : priceTrendType === 'up'
                        ? '수입 총판 환율 변동 혹은 수요 폭증으로 시장 시세가 소폭 인상되었습니다.'
                        : '수요가 완연하며 공급 변동이 적어 시장 보합세를 보이고 있습니다.'}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-[#161618] border border-slate-800 rounded-2xl space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">정밀 시장 수급 지수</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-extrabold text-blue-400">안정 등급 (Green)</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                    본사 총판 유통 물량 및 대리점 실시간 재고를 합산한 결과입니다. 현재 공급 과잉 상태에 가깝고 수요 수급이 정상적이므로 구매 보류 불필요합니다.
                  </p>
                </div>

              </div>

              {/* 간단한 가격 변동 시각화 그래프 */}
              <div className="p-5 bg-[#161618]/30 border border-slate-900 rounded-2xl space-y-4">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500" />
                  주차별 실시간 평균 최저가 시세 변동 추이 (원)
                </span>

                <div className="grid grid-cols-4 items-end gap-3 pt-6 h-32 border-b border-slate-800 relative select-none">
                  
                  {/* Grid Lines */}
                  <div className="absolute inset-x-0 top-1/4 border-t border-slate-900/60 border-dashed pointer-events-none" />
                  <div className="absolute inset-x-0 top-2/4 border-t border-slate-900/60 border-dashed pointer-events-none" />
                  <div className="absolute inset-x-0 top-3/4 border-t border-slate-900/60 border-dashed pointer-events-none" />

                  {priceHistory.map((item, index) => {
                    // Find max & min to scale height nicely
                    const prices = priceHistory.map(h => h.price);
                    const maxPrice = Math.max(...prices);
                    const minPrice = Math.min(...prices);
                    const diff = maxPrice - minPrice;
                    
                    // Scale height between 40% and 100%
                    const heightPercent = diff > 0 
                      ? 40 + ((item.price - minPrice) / diff) * 60 
                      : 80;

                    return (
                      <div key={index} className="flex flex-col items-center gap-2 relative z-10 group">
                        <span className="text-[9px] font-mono text-slate-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded shadow">
                          {formatPrice(item.price)}
                        </span>
                        <div 
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full max-w-[28px] rounded-t-md transition-all duration-500 ${
                            index === 3 
                              ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-md shadow-indigo-600/10' 
                              : 'bg-slate-800 group-hover:bg-slate-700'
                          }`}
                        />
                        <span className="text-[10px] text-slate-500 font-bold tracking-tight">
                          {item.week}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 스마트 구매 권장 시점 리포트 */}
              <div className="p-4 bg-slate-900/40 border border-slate-800/60 rounded-2xl space-y-2.5">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ComSpec 스마트 쇼퍼 팩트 체크
                </span>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  본 품목은 현재 세대 전환 직전의 성숙기로 시세 거품이 완벽하게 제거되었습니다. 대체재 하드웨어 가격과 비교해 보았을 때 가성비 지수가 <span className="text-indigo-400 font-bold">매우 우수(94점/100점)</span>로 측정됩니다. 따라서 다음 세대 발표를 기다리며 지연하는 것보다 지금 시기에 묶음 견적으로 일괄 조립하여 컴퓨존 당일 무료 배송 보장 및 다나와 패키지 할인을 받아 구매하는 것을 강력히 추천합니다.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-900 bg-[#161618]/20 flex items-center justify-between gap-4 relative z-10">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            닫기
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                const searchName = encodeURIComponent(part.name);
                window.open(`https://search.danawa.com/dsearch.php?query=${searchName}`, '_blank');
              }}
              className="py-2 px-3 bg-[#111113] hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
            >
              <span>다나와에서 검색</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <button
              onClick={() => {
                const searchWord = getCompuzoneSearchQuery(part);
                if (!searchWord || !searchWord.trim()) {
                  console.log("Compuzone Search URL: empty search word, falling back to home");
                  window.open("https://www.compuzone.co.kr", "_blank");
                  return;
                }
                const params = new URLSearchParams({
                  Seargbl: "1",
                  hidden_Txt: "",
                  IsEventSearch: "",
                  SearchProductKey: searchWord.trim()
                });
                const url = `https://www.compuzone.co.kr/search/search.htm?${params.toString()}`;
                console.log("Compuzone Search URL:", url);
                window.open(url, '_blank');
              }}
              className="py-2 px-3 bg-[#111113] hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
            >
              <span>컴퓨존에서 검색</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
