import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Search, 
  ArrowLeftRight, 
  Check, 
  Zap, 
  TrendingUp, 
  Coins, 
  Award, 
  Scale, 
  Layers, 
  Activity, 
  X, 
  Gauge, 
  Clock,
  ShieldCheck,
  Flame,
  ThumbsUp,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Database,
  HardDrive,
  Box,
  Power,
  ClipboardList,
  Trash2,
  Share2,
  AlertTriangle,
  Plus,
  ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { COMPONENTS_DATA } from './data';
import { ComponentSpec, ComponentCategory, ChatMessage } from './types';
import HomePage from './components/HomePage';
import EstimatePage from './components/EstimatePage';
import PriceComparisonModal from './components/PriceComparisonModal';

export default function App() {
  const [view, setView] = useState<'home' | 'compare' | 'estimate'>('home');
  const [category, setCategory] = useState<ComponentCategory>('CPU');
  const [priceComparisonPart, setPriceComparisonPart] = useState<ComponentSpec | null>(null);

  // AI chat state persistent across navigation
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `반갑습니다! **지능형 컴퓨터 추천 AI ADVISOR**입니다. 💻✨

사용자분의 **사용 목적(예: 사무 작업, 디자인, 게임), 선호하시는 하드웨어 기준, 혹은 예산 규모**를 편하게 말씀해 주세요. 저희 사이트의 하드웨어 스펙 데이터베이스를 정밀 분석하여 사용자에게 딱 알맞은 최적의 조립 부품 구성을 친절하게 큐레이션해 드리겠습니다.

아래의 추천 질문 칩을 누르시거나 직접 질문을 입력해 보세요!`
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  
  // Custom build estimate state stored in localStorage
  const [estimate, setEstimate] = useState<Record<ComponentCategory, ComponentSpec | null>>(() => {
    const saved = localStorage.getItem('comspec_estimate');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved estimate', e);
      }
    }
    return {
      CPU: null,
      GPU: null,
      RAM: null,
      SSD: null,
      COOLER: null,
      CASE: null,
      PSU: null,
    };
  });

  // Save estimate state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('comspec_estimate', JSON.stringify(estimate));
  }, [estimate]);

  const addToEstimate = (cat: ComponentCategory, comp: ComponentSpec) => {
    setEstimate(prev => ({
      ...prev,
      [cat]: comp
    }));
  };

  const removeFromEstimate = (cat: ComponentCategory) => {
    setEstimate(prev => ({
      ...prev,
      [cat]: null
    }));
  };

  const clearEstimate = () => {
    setEstimate({
      CPU: null,
      GPU: null,
      RAM: null,
      SSD: null,
      COOLER: null,
      CASE: null,
      PSU: null,
    });
  };
  
  // Set initial default states dynamically based on selected category
  const [selectedLeft, setSelectedLeft] = useState<ComponentSpec>(
    COMPONENTS_DATA.find(c => c.category === 'CPU') || COMPONENTS_DATA[0]
  );
  const [selectedRight, setSelectedRight] = useState<ComponentSpec>(
    COMPONENTS_DATA.filter(c => c.category === 'CPU')[1] || COMPONENTS_DATA[1]
  );

  const [searchLeft, setSearchLeft] = useState('');
  const [searchRight, setSearchRight] = useState('');
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [isCompareDropdownOpen, setIsCompareDropdownOpen] = useState(false);

  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // When category changes, auto-select standard defaults for that category unless already pre-selected
  useEffect(() => {
    if (selectedLeft.category === category && selectedRight.category === category) {
      setSearchLeft('');
      setSearchRight('');
      setIsLeftOpen(false);
      setIsRightOpen(false);
      return;
    }
    const items = COMPONENTS_DATA.filter(c => c.category === category);
    if (items.length >= 2) {
      setSelectedLeft(items[0]);
      setSelectedRight(items[1]);
    }
    setSearchLeft('');
    setSearchRight('');
    setIsLeftOpen(false);
    setIsRightOpen(false);
  }, [category]);

  // Click outside close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (leftRef.current && !leftRef.current.contains(event.target as Node)) {
        setIsLeftOpen(false);
      }
      if (rightRef.current && !rightRef.current.contains(event.target as Node)) {
        setIsRightOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCompareDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter items based on category and search text
  const filteredLeftItems = COMPONENTS_DATA.filter(
    item => 
      item.category === category && 
      item.name.toLowerCase().includes(searchLeft.toLowerCase()) &&
      item.id !== selectedRight.id // Avoid selecting same item
  );

  const filteredRightItems = COMPONENTS_DATA.filter(
    item => 
      item.category === category && 
      item.name.toLowerCase().includes(searchRight.toLowerCase()) &&
      item.id !== selectedLeft.id // Avoid selecting same item
  );

  // Swap left and right components
  const handleSwap = () => {
    const temp = selectedLeft;
    setSelectedLeft(selectedRight);
    setSelectedRight(temp);
    setSearchLeft('');
    setSearchRight('');
  };

  // Format price helper (Korean Won formatting)
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' })
      .format(price)
      .replace('₩', '') + '원';
  };

  // Winner decider function
  // returns 'left' | 'right' | 'tie' | null
  const getWinner = (field: keyof ComponentSpec, lowerIsBetter = false) => {
    const valL = selectedLeft[field];
    const valR = selectedRight[field];

    if (valL === undefined || valR === undefined) return null;
    if (typeof valL !== 'number' || typeof valR !== 'number') return null;

    if (valL === valR) return 'tie';
    
    if (lowerIsBetter) {
      return valL < valR ? 'left' : 'right';
    } else {
      return valL > valR ? 'left' : 'right';
    }
  };

  // Dynamic analysis notes
  const getDynamicPros = (side: 'left' | 'right') => {
    const current = side === 'left' ? selectedLeft : selectedRight;
    const opponent = side === 'left' ? selectedRight : selectedLeft;
    const pros: string[] = [];

    if (!current || !opponent) return pros;

    // Price compare
    if (current.price < opponent.price) {
      const diffPercent = Math.round(((opponent.price - current.price) / opponent.price) * 100);
      pros.push(`상대 제품 대비 약 ${diffPercent}% 더 저렴함 (${formatPrice(opponent.price - current.price)} 절약)`);
    }

    // Category specific pros
    if (category === 'CPU') {
      if (current.cores && opponent.cores && current.cores > opponent.cores) {
        pros.push(`더 많은 코어 수 (${current.cores}코어 vs ${opponent.cores}코어)로 멀티태스킹 및 인코딩 우수`);
      }
      if (current.boostClock && opponent.boostClock && current.boostClock > opponent.boostClock) {
        pros.push(`더 높은 최대 부스트 클럭 (${current.boostClock}GHz vs ${opponent.boostClock}GHz)`);
      }
      if (current.tdp !== undefined && opponent.tdp !== undefined && current.tdp < opponent.tdp) {
        pros.push(`더 낮은 소비전력 (TDP ${current.tdp}W vs ${opponent.tdp}W)으로 높은 에너지 효율성`);
      }
      if (current.scoreSingle && opponent.scoreSingle && current.scoreSingle > opponent.scoreSingle) {
        const ratio = Math.round(((current.scoreSingle - opponent.scoreSingle) / opponent.scoreSingle) * 100);
        pros.push(`싱글코어 연산 성능 약 ${ratio}% 더 높음 (게이밍 및 단일 작업 유리)`);
      }
    } else if (category === 'GPU') {
      if (current.boostClock && opponent.boostClock && current.boostClock > opponent.boostClock) {
        pros.push(`더 높은 부스트 클럭 (${current.boostClock}MHz vs ${opponent.boostClock}MHz)`);
      }
      if (current.tdp !== undefined && opponent.tdp !== undefined && current.tdp < opponent.tdp) {
        pros.push(`더 낮은 전력 공급 요구량 (TDP ${current.tdp}W vs ${opponent.tdp}W)`);
      }
      if (current.scoreSingle && opponent.scoreSingle && current.scoreSingle > opponent.scoreSingle) {
        const ratio = Math.round(((current.scoreSingle - opponent.scoreSingle) / opponent.scoreSingle) * 100);
        pros.push(`3DMark TimeSpy 그래픽 점수 약 ${ratio}% 우세`);
      }
    } else if (category === 'RAM') {
      if (current.baseClock && opponent.baseClock && current.baseClock > opponent.baseClock) {
        pros.push(`더 빠른 동작 주파수 속도 (${current.baseClock}MHz vs ${opponent.baseClock}MHz)`);
      }
      if (current.scoreSingle && opponent.scoreSingle && current.scoreSingle > opponent.scoreSingle) {
        pros.push(`더 우수한 메모리 타이밍 & 반응 지연속도(CL) 성능 포지션`);
      }
      if (current.scoreMulti && opponent.scoreMulti && current.scoreMulti > opponent.scoreMulti) {
        pros.push(`더 높은 대역폭 데이터 전송 성능 (${current.scoreMulti?.toLocaleString()} MB/s)`);
      }
    } else if (category === 'SSD') {
      if (current.scoreSingle && opponent.scoreSingle && current.scoreSingle > opponent.scoreSingle) {
        const diff = current.scoreSingle - opponent.scoreSingle;
        pros.push(`더 빠른 순차 읽기 속도 (+${diff.toLocaleString()} MB/s 우세)`);
      }
      if (current.scoreMulti && opponent.scoreMulti && current.scoreMulti > opponent.scoreMulti) {
        const diff = current.scoreMulti - opponent.scoreMulti;
        pros.push(`더 빠른 순차 쓰기 속도 (+${diff.toLocaleString()} MB/s 우세)`);
      }
      if (current.tbw && opponent.tbw && current.tbw > opponent.tbw) {
        pros.push(`더 긴 쓰기 보증 수명 (TBW ${current.tbw}TB vs ${opponent.tbw}TB)`);
      }
    } else if (category === 'CASE') {
      if (current.scoreSingle !== undefined && opponent.scoreSingle !== undefined && current.scoreSingle > opponent.scoreSingle) {
        pros.push(`더 많은 빌트인 기본 쿨링팬 제공 (${current.scoreSingle}개 vs ${opponent.scoreSingle}개)`);
      }
      if (current.scoreMulti !== undefined && opponent.scoreMulti !== undefined && current.scoreMulti > opponent.scoreMulti) {
        pros.push(`더 여유로운 그래픽카드 장착 제한 길이 (${current.scoreMulti}mm 지원)`);
      }
    } else if (category === 'PSU') {
      if (current.scoreSingle !== undefined && opponent.scoreSingle !== undefined && current.scoreSingle > opponent.scoreSingle) {
        pros.push(`더 높은 여유 정격 전원 출력 용량 (${current.scoreSingle}W 출력)`);
      }
      if (current.scoreMulti !== undefined && opponent.scoreMulti !== undefined && current.scoreMulti > opponent.scoreMulti) {
        pros.push(`더 높은 에너지 변환 효율 등급 (Peak ${current.scoreMulti}%)`);
      }
    } else if (category === 'COOLER') {
      if (current.scoreMulti !== undefined && opponent.scoreMulti !== undefined && current.scoreMulti > opponent.scoreMulti) {
        pros.push(`더 강력한 프로세서 발열 억제력 (최대 감당 TDP ${current.scoreMulti}W)`);
      }
      if (current.fanCount !== undefined && opponent.fanCount !== undefined && current.fanCount > opponent.fanCount) {
        pros.push(`더 풍부한 고풍량 번들 팬 탑재 (${current.fanCount}개 번들 패키지)`);
      }
      if (current.coolerType !== opponent.coolerType) {
        pros.push(`고성능 ${current.coolerType} 쿨링 포맷 설계`);
      }
      if (current.noiseLevel) {
        pros.push(`정숙한 저소음 특화 설계 (${current.noiseLevel} 최저 구동 수준)`);
      }
    }

    // Default catch-alls
    if (pros.length === 0) {
      pros.push('균형 잡힌 성능 포지션');
      pros.push('신뢰할 수 있는 하드웨어 설계');
    }

    return pros.slice(0, 3); // top 3
  };

  const getShortName = (name: string) => {
    if (name.includes('i5')) return 'i5';
    if (name.includes('i7')) return 'i7';
    if (name.includes('i9')) return 'i9';
    if (name.includes('Ryzen 5')) return 'R5';
    if (name.includes('Ryzen 7')) return 'R7';
    if (name.includes('Ryzen 9')) return 'R9';
    if (name.includes('4070')) return '4070';
    if (name.includes('7800')) return '7800';
    if (name.includes('4060')) return '4060';
    if (name.includes('4090')) return '4090';
    if (name.includes('7900')) return '7900';
    if (name.includes('A770')) return 'A770';
    
    // For other parts, extract the prominent model number or name part
    const parts = name.split(' ');
    // Filter out common Korean terms or manufacturer names to get a compact word
    const filtered = parts.filter(p => !p.includes('삼성') && !p.includes('전자') && !p.includes('하이닉스') && !p.includes('마이크로닉스') && !p.includes('앱코'));
    if (filtered.length > 0) {
      const candidate = filtered[filtered.length - 1];
      if (candidate.length <= 8) return candidate;
      return candidate.substring(0, 6) + '..';
    }
    return name.substring(0, 4);
  };

  const getSeriesName = (item: ComponentSpec) => {
    if (item.brand === 'Intel') {
      if (item.category === 'CPU') {
        if (item.name.includes('13400')) return 'Intel 13th Gen';
        if (item.name.includes('14')) return 'Intel 14th Gen';
        if (item.name.includes('12')) return 'Intel 12th Gen';
        return 'Intel Core';
      }
      return 'Intel Arc Series';
    }
    if (item.brand === 'AMD') {
      if (item.category === 'CPU') {
        if (item.name.includes('7')) return 'AMD Zen 4';
        if (item.name.includes('5600')) return 'AMD Zen 3';
        return 'AMD Ryzen';
      }
      return 'AMD RDNA 3';
    }
    if (item.brand === 'NVIDIA') {
      return 'NVIDIA Ada Lovelace';
    }
    
    // For RAM, SSD, Case, PSU
    if (item.category === 'RAM') return `${item.memoryType || 'DDR5'} Memory`;
    if (item.category === 'SSD') return `${item.nvmeGeneration || 'PCIe Gen4'} SSD`;
    if (item.category === 'CASE') return `${item.caseSize || 'Middle Tower'} Case`;
    if (item.category === 'PSU') return `80PLUS ${item.psuEfficiency || 'Standard'} PSU`;
    if (item.category === 'COOLER') return `${item.coolerType || '공랭식'}형 CPU 쿨러`;

    return `${item.brand} Hardware`;
  };

  const getArchitectureName = (item: ComponentSpec) => {
    if (item.brand === 'Intel') {
      if (item.category === 'CPU') {
        if (item.name.includes('13400') || item.name.includes('14')) return 'Raptor Lake Architecture';
        if (item.name.includes('12')) return 'Alder Lake Architecture';
        return 'Intel x86 Core';
      }
      return 'Alchemist Architecture';
    }
    if (item.brand === 'AMD') {
      if (item.category === 'CPU') {
        return 'AM5 Platform Architecture';
      }
      return 'RDNA 3 GPU Architecture';
    }
    if (item.brand === 'NVIDIA') {
      return 'Ada Lovelace GPU Architecture';
    }
    
    if (item.category === 'RAM') return `${item.timing || 'CL30'} Timing Profile`;
    if (item.category === 'SSD') return `${item.ssdType || 'NVMe M.2'} Form Factor`;
    if (item.category === 'CASE') return `Max GPU Length: ${item.maxGpuLength || '350'}mm`;
    if (item.category === 'PSU') return `${item.psuModularType || 'Full-Modular'} Supply`;
    if (item.category === 'COOLER') return `${item.fanSize || '120mm'} 규격 번들 팬 탑재`;

    return 'Premium Computer Parts';
  };

  // Theme-color helpers based on brand
  const getBrandBadge = (brand: string) => {
    const b = brand.toUpperCase();
    if (b.includes('INTEL')) {
      return 'bg-blue-900/30 text-blue-400 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-tighter border border-blue-800/50';
    }
    if (b.includes('AMD') || b.includes('HYNIX') || b.includes('RYZEN')) {
      return 'bg-orange-900/30 text-orange-400 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-tighter border border-orange-800/50';
    }
    if (b.includes('NVIDIA') || b.includes('GEFORCE')) {
      return 'bg-emerald-900/30 text-emerald-400 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-tighter border border-emerald-800/50';
    }
    if (b.includes('SAMSUNG') || b.includes('삼성')) {
      return 'bg-blue-950/40 text-blue-400 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-tighter border border-blue-900/50';
    }
    if (b.includes('MICRON') || b.includes('CRUCIAL') || b.includes('마이크론')) {
      return 'bg-cyan-950/40 text-cyan-400 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-tighter border border-cyan-900/50';
    }
    if (b.includes('CORSAIR') || b.includes('커세어') || b.includes('FSP')) {
      return 'bg-yellow-950/40 text-yellow-500 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-tighter border border-yellow-900/50';
    }
    if (b.includes('G.SKILL') || b.includes('지스킬') || b.includes('LIAN') || b.includes('리안리')) {
      return 'bg-purple-950/40 text-purple-400 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-tighter border border-purple-900/50';
    }
    if (b.includes('DARKFLASH') || b.includes('다크플래쉬') || b.includes('FRACTAL')) {
      return 'bg-pink-950/40 text-pink-400 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-tighter border border-pink-900/50';
    }
    if (b.includes('SEASONIC') || b.includes('시소닉') || b.includes('ANTEC') || b.includes('안텍')) {
      return 'bg-amber-950/40 text-amber-500 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-tighter border border-amber-900/50';
    }
    if (b.includes('NZXT')) {
      return 'bg-purple-900/30 text-purple-400 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-tighter border border-purple-800/50';
    }
    if (b.includes('THERMALRIGHT') || b.includes('서멀라이트')) {
      return 'bg-slate-900/30 text-slate-300 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-tighter border border-slate-700/50';
    }
    if (b.includes('DEEPCOOL') || b.includes('딥쿨')) {
      return 'bg-cyan-900/30 text-cyan-400 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-tighter border border-cyan-800/50';
    }
    if (b.includes('3RSYS') || b.includes('쓰리알')) {
      return 'bg-rose-900/30 text-rose-400 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-tighter border border-rose-800/50';
    }
    if (b.includes('PENTAWAVE') || b.includes('펜타웨이브')) {
      return 'bg-amber-900/30 text-amber-400 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-tighter border border-amber-800/50';
    }
    return 'bg-slate-900 text-slate-400 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-tighter border border-slate-800';
  };

  const getBrandGradient = (brand: string) => {
    const b = brand.toUpperCase();
    if (b.includes('INTEL') || b.includes('SAMSUNG') || b.includes('삼성')) return 'from-blue-600/15 to-transparent';
    if (b.includes('AMD') || b.includes('HYNIX') || b.includes('RYZEN')) return 'from-orange-600/15 to-transparent';
    if (b.includes('NVIDIA') || b.includes('GEFORCE')) return 'from-emerald-600/15 to-transparent';
    if (b.includes('MICRON') || b.includes('CRUCIAL') || b.includes('마이크론')) return 'from-cyan-600/15 to-transparent';
    if (b.includes('CORSAIR') || b.includes('커세어') || b.includes('FSP')) return 'from-yellow-600/15 to-transparent';
    if (b.includes('G.SKILL') || b.includes('지스킬') || b.includes('LIAN') || b.includes('리안리')) return 'from-purple-600/15 to-transparent';
    if (b.includes('DARKFLASH') || b.includes('다크플래쉬') || b.includes('FRACTAL')) return 'from-pink-600/15 to-transparent';
    if (b.includes('SEASONIC') || b.includes('시소닉') || b.includes('ANTEC') || b.includes('안텍')) return 'from-amber-600/15 to-transparent';
    if (b.includes('NZXT')) return 'from-purple-600/15 to-transparent';
    if (b.includes('THERMALRIGHT') || b.includes('서멀라이트')) return 'from-slate-600/15 to-transparent';
    if (b.includes('DEEPCOOL') || b.includes('딥쿨')) return 'from-cyan-600/15 to-transparent';
    if (b.includes('3RSYS') || b.includes('쓰리알')) return 'from-rose-600/15 to-transparent';
    if (b.includes('PENTAWAVE') || b.includes('펜타웨이브')) return 'from-amber-600/15 to-transparent';
    return 'from-slate-600/15 to-transparent';
  };

  const getBrandTextClass = (brand: string) => {
    const b = brand.toUpperCase();
    if (b.includes('INTEL') || b.includes('SAMSUNG') || b.includes('삼성')) return 'text-blue-500';
    if (b.includes('AMD') || b.includes('HYNIX') || b.includes('RYZEN')) return 'text-orange-500';
    if (b.includes('NVIDIA') || b.includes('GEFORCE')) return 'text-emerald-500';
    if (b.includes('MICRON') || b.includes('CRUCIAL') || b.includes('마이크론')) return 'text-cyan-500';
    if (b.includes('CORSAIR') || b.includes('커세어') || b.includes('FSP')) return 'text-yellow-500';
    if (b.includes('G.SKILL') || b.includes('지스킬') || b.includes('LIAN') || b.includes('리안리')) return 'text-purple-500';
    if (b.includes('DARKFLASH') || b.includes('다크플래쉬') || b.includes('FRACTAL')) return 'text-pink-500';
    if (b.includes('SEASONIC') || b.includes('시소닉') || b.includes('ANTEC') || b.includes('안텍')) return 'text-amber-500';
    if (b.includes('NZXT')) return 'text-purple-400';
    if (b.includes('THERMALRIGHT') || b.includes('서멀라이트')) return 'text-slate-300';
    if (b.includes('DEEPCOOL') || b.includes('딥쿨')) return 'text-cyan-400';
    if (b.includes('3RSYS') || b.includes('쓰리알')) return 'text-rose-400';
    if (b.includes('PENTAWAVE') || b.includes('펜타웨이브')) return 'text-amber-400';
    return 'text-slate-400';
  };

  const getBrandBorderClass = (brand: string) => {
    const b = brand.toUpperCase();
    if (b.includes('INTEL') || b.includes('SAMSUNG') || b.includes('삼성')) return 'border-blue-900/40';
    if (b.includes('AMD') || b.includes('HYNIX') || b.includes('RYZEN')) return 'border-orange-900/40';
    if (b.includes('NVIDIA') || b.includes('GEFORCE')) return 'border-emerald-900/40';
    if (b.includes('MICRON') || b.includes('CRUCIAL') || b.includes('마이크론')) return 'border-cyan-900/40';
    if (b.includes('CORSAIR') || b.includes('커세어') || b.includes('FSP')) return 'border-yellow-900/40';
    if (b.includes('G.SKILL') || b.includes('지스킬') || b.includes('LIAN') || b.includes('리안리')) return 'border-purple-900/40';
    if (b.includes('DARKFLASH') || b.includes('다크플래쉬') || b.includes('FRACTAL')) return 'border-pink-900/40';
    if (b.includes('SEASONIC') || b.includes('시소닉') || b.includes('ANTEC') || b.includes('안텍')) return 'border-amber-900/40';
    if (b.includes('NZXT')) return 'border-purple-900/40';
    if (b.includes('THERMALRIGHT') || b.includes('서멀라이트')) return 'border-slate-700/40';
    if (b.includes('DEEPCOOL') || b.includes('딥쿨')) return 'border-cyan-900/40';
    if (b.includes('3RSYS') || b.includes('쓰리알')) return 'border-rose-900/40';
    if (b.includes('PENTAWAVE') || b.includes('펜타웨이브')) return 'border-amber-900/40';
    return 'border-slate-800';
  };

  const getRecommendedUsage = (item: ComponentSpec) => {
    if (category === 'CPU') {
      return item.cores && item.cores > 8 ? '고강도 영상 작업 및 멀티 렌더링 추천' : '안정적인 메인스트림 게이밍 PC 추천';
    }
    if (category === 'GPU') {
      return item.price > 1000000 ? '울트라 옵션 AAA급 4K 게이밍 전용' : 'QHD/FHD 프레임 방어 및 가성비 게이밍';
    }
    if (category === 'RAM') {
      return item.baseClock && item.baseClock >= 6000 ? '오버클럭 튜닝 게이밍 및 고대역폭 연산 추천' : '순정 사무용 및 무난한 올라운더 시스템 추천';
    }
    if (category === 'SSD') {
      return item.scoreSingle && item.scoreSingle >= 7000 ? 'OS 드라이브 및 고화질 무손실 편집용' : '보조 스토리지 대용량 데이터 전용';
    }
    if (category === 'CASE') {
      return item.price > 150000 ? '하이엔드 커스텀 쿨링 및 쇼케이스용' : '기본에 충실한 가성비 쿨링 구성용';
    }
    if (category === 'PSU') {
      return item.psuEfficiency === 'Gold' || item.psuEfficiency === 'Platinum' ? '고전력 안정성 하이엔드 시스템용' : '메인스트림 보급형 게이밍 본체용';
    }
    if (category === 'COOLER') {
      return item.coolerType?.includes('수랭') ? '하이엔드 오버클럭 및 발열 집중 시스템 추천' : '대장급 정숙한 공랭 특화 시스템 추천';
    }
    return '표준 시스템 호환 부품';
  };

  const getCategoryTip = () => {
    switch (category) {
      case 'CPU':
        return '메인보드 소켓(예: LGA1700, AM5) 및 칩셋 지원 세대를 반드시 대조해 보세요.';
      case 'GPU':
        return '본체 케이스의 장착 가능한 그래픽카드 제한 길이 및 파워 정격 용량을 대조해 보세요.';
      case 'RAM':
        return '메인보드의 지원 규격(DDR4/DDR5) 및 최대 오버클럭 가용 주파수를 대조해 보세요.';
      case 'SSD':
        return '메인보드 슬롯의 NVMe PCIe 세대(M.2 Gen4/Gen5) 대역폭 지원 및 방열판 유무를 대조해 보세요.';
      case 'CASE':
        return '메인보드 폼팩터 규격(ATX, M-ATX) 및 장착할 수냉 쿨러 라디에이터 규격을 대조해 보세요.';
      case 'PSU':
        return '시스템 부품(CPU + GPU)의 최대 권장 전력 소모량 합계를 계산하여 안전 마진을 두세요.';
      case 'COOLER':
        return 'CPU 쿨러 높이 호환성(공랭식) 및 라디에이터 규격 지원 유무(수랭식, 예: 360mm)를 케이스 사양과 꼭 매치해 보세요.';
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-slate-100 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* Visual background ambient details */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-950/15 via-[#0A0A0C]/5 to-transparent pointer-events-none z-0" />
      <div className="absolute top-40 left-10 w-96 h-96 bg-blue-600/3 rounded-full filter blur-3xl pointer-events-none z-0" />
      <div className="absolute top-96 right-10 w-96 h-96 bg-indigo-600/3 rounded-full filter blur-3xl pointer-events-none z-0" />

      {/* Header Panel */}
      <header className="sticky top-0 z-50 border-b border-slate-900 bg-[#0F0F12]/95 backdrop-blur-md shadow-lg shadow-black/20">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button 
            id="logo-brand"
            onClick={() => setView('home')}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/10 group-hover:scale-105 transition-transform duration-300">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-lg tracking-wider text-white">
              COM<span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">SPEC</span>
            </span>
          </button>
          
          <nav className="flex items-center gap-2 relative">
            <button
              id="nav-home"
              onClick={() => {
                setView('home');
                setIsCompareDropdownOpen(false);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                view === 'home' 
                  ? 'bg-slate-800 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-850/50'
              }`}
            >
              메인 홈
            </button>
            
            {/* Component Comparison Dropdown Container */}
            <div ref={dropdownRef} className="relative">
              <button
                id="nav-compare-dropdown-trigger"
                onClick={() => setIsCompareDropdownOpen(!isCompareDropdownOpen)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  view === 'compare'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850/50'
                }`}
              >
                <span>부품 비교</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isCompareDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isCompareDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-[#131317] border border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.8)] rounded-xl p-1.5 z-50 overflow-hidden"
                  >
                    <div className="px-2 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none border-b border-slate-900/60 mb-1">
                      비교 품목 선택
                    </div>
                    {[
                      { id: 'CPU', name: 'CPU (프로세서)', icon: <Cpu className="w-3.5 h-3.5" /> },
                      { id: 'GPU', name: 'GPU (그래픽카드)', icon: <Activity className="w-3.5 h-3.5" /> },
                      { id: 'RAM', name: 'RAM (메모리)', icon: <Layers className="w-3.5 h-3.5" /> },
                      { id: 'SSD', name: 'SSD (저장장치)', icon: <HardDrive className="w-3.5 h-3.5" /> },
                      { id: 'COOLER', name: 'COOLER (쿨러)', icon: <Zap className="w-3.5 h-3.5 text-sky-400" /> },
                      { id: 'CASE', name: 'CASE (케이스)', icon: <Box className="w-3.5 h-3.5" /> },
                      { id: 'PSU', name: 'PSU (파워)', icon: <Power className="w-3.5 h-3.5 text-amber-400" /> },
                    ].map((item) => {
                      const isActive = view === 'compare' && category === item.id;
                      return (
                        <button
                          key={item.id}
                          id={`nav-dropdown-cat-${item.id}`}
                          onClick={() => {
                            setCategory(item.id as ComponentCategory);
                            setView('compare');
                            setIsCompareDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                            isActive
                              ? 'bg-slate-800 text-blue-400 font-bold'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={isActive ? 'text-blue-400' : 'text-slate-400'}>
                              {item.icon}
                            </span>
                            <span>{item.name}</span>
                          </div>
                          {isActive && <Check className="w-3.5 h-3.5 text-blue-400" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* My Estimate Page Button */}
            <button
              id="nav-estimate"
              onClick={() => {
                setView('estimate');
                setIsCompareDropdownOpen(false);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 relative ${
                view === 'estimate' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md border border-indigo-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-850/50'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5 text-indigo-400" />
              <span>내 견적</span>
              {Object.values(estimate).filter(Boolean).length > 0 && (
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping absolute top-1 right-1" />
              )}
              {Object.values(estimate).filter(Boolean).length > 0 && (
                <span className="bg-indigo-950/80 text-indigo-300 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-indigo-700/50 flex items-center justify-center font-mono ml-0.5">
                  {Object.values(estimate).filter(Boolean).length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {view === 'home' ? (
          <HomePage 
            setView={setView} 
            setCategory={setCategory} 
            setSelectedLeft={setSelectedLeft} 
            setSelectedRight={setSelectedRight} 
            chatMessages={chatMessages}
            setChatMessages={setChatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            estimate={estimate}
            addToEstimate={addToEstimate}
            removeFromEstimate={removeFromEstimate}
            onOpenPriceCompare={setPriceComparisonPart}
          />
        ) : view === 'estimate' ? (
          <EstimatePage
            estimate={estimate}
            addToEstimate={addToEstimate}
            removeFromEstimate={removeFromEstimate}
            clearEstimate={clearEstimate}
            setView={setView}
            setCategory={setCategory}
            formatPrice={formatPrice}
            onOpenPriceCompare={setPriceComparisonPart}
          />
        ) : (
          <>
            {/* Intro Banner */}
            <section className="text-center mb-10 flex flex-col items-center animate-fade-in">
              <div className="mb-4 flex gap-3 items-center">
                <button
                  id="back-to-home"
                  onClick={() => setView('home')}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors py-1 px-2.5 bg-[#161618] border border-slate-800 rounded-lg shadow-sm cursor-pointer"
                >
                  ← 메인 홈
                </button>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-blue-950/30 text-blue-400 border border-blue-900/50">
                  <Award className="w-3.5 h-3.5" />
                  PROFESSIONAL HARDWARE COMPARISON INDEX
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                대조 분석: <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent italic">{category} COMPILER</span>
              </h2>
              <p className="text-sm text-slate-400 max-w-xl mx-auto">
                원하는 두 하드웨어를 직접 선택하세요. 공인 규격과 정밀 연산 비율을 바탕으로 최고의 파츠를 진단합니다.
              </p>
            </section>

            {/* Search Selection Section */}
            <section className="mb-8 bg-[#161618]/40 p-5 sm:p-6 rounded-2xl border border-slate-800/80 backdrop-blur-sm relative z-30">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
                
                {/* Left Search Input */}
                <div ref={leftRef} className="relative">
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2 flex items-center justify-between">
                    <span>첫 번째 {category}</span>
                    <span className={getBrandBadge(selectedLeft.brand)}>
                      {selectedLeft.brand}
                    </span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="search-input-left"
                      type="text"
                      placeholder={
                        category === 'CPU' ? '예: i5-13400, Ryzen 7...' : 
                        category === 'GPU' ? '예: RTX 4070, RX 7800...' :
                        category === 'RAM' ? '예: 삼성 DDR5, G.SKILL...' :
                        category === 'SSD' ? '예: 990 PRO, P41...' :
                        category === 'CASE' ? '예: DLX21, 엘리시아...' :
                        '예: Classic II, 시소닉 FOCUS...'
                      }
                      value={searchLeft}
                      onChange={(e) => {
                        setSearchLeft(e.target.value);
                        setIsLeftOpen(true);
                      }}
                      onFocus={() => setIsLeftOpen(true)}
                      className={`w-full bg-[#111113] border border-slate-800 focus:border-slate-600 rounded-xl py-3.5 pl-10 pr-10 text-sm font-medium text-white placeholder-slate-600 outline-none transition-all duration-300 shadow-inner`}
                    />
                    {searchLeft && (
                      <button 
                        onClick={() => setSearchLeft('')}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Suggestions Dropdown */}
                  <AnimatePresence>
                    {isLeftOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-[#0F0F12]/95 border border-slate-800 rounded-xl shadow-2xl z-20 backdrop-blur-md divide-y divide-slate-800/60"
                      >
                        {filteredLeftItems.length > 0 ? (
                          filteredLeftItems.map((item) => (
                            <button
                              key={item.id}
                              id={`select-left-${item.id}`}
                              onClick={() => {
                                setSelectedLeft(item);
                                setIsLeftOpen(false);
                                setSearchLeft('');
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-slate-800/60 text-sm flex items-center justify-between group transition-colors"
                            >
                              <div>
                                <p className="font-semibold text-slate-200 group-hover:text-white transition-colors">{item.name}</p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {category === 'CPU' && `TDP ${item.tdp}W | ${item.cacheOrMemory}`}
                                  {category === 'GPU' && `TDP ${item.tdp}W | ${item.cacheOrMemory}`}
                                  {category === 'RAM' && `${item.memoryType} | ${item.baseClock}MHz | ${item.timing}`}
                                  {category === 'SSD' && `${item.ssdType} | ${item.nvmeGeneration} | TBW ${item.tbw}TB`}
                                  {category === 'CASE' && `${item.caseSize} | GPU 최대 ${item.maxGpuLength}mm`}
                                  {category === 'PSU' && `${item.psuEfficiency}인증 | 정격 ${item.ratedPower}W | ${item.psuModularType}`}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-slate-400">{formatPrice(item.price)}</span>
                                <span className={getBrandBadge(item.brand)}>{item.brand}</span>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-4 text-center text-xs text-slate-500">
                            검색 결과가 없습니다.
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center md:pt-6">
                  <button
                    id="btn-swap-parts"
                    onClick={handleSwap}
                    title="좌우 비교 대상 스왑"
                    className="p-3 bg-[#111113] hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-400 hover:text-white transition-all duration-300 shadow-md group active:scale-95"
                  >
                    <ArrowLeftRight className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                  </button>
                </div>

                {/* Right Search Input */}
                <div ref={rightRef} className="relative">
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2 flex items-center justify-between">
                    <span>두 번째 {category}</span>
                    <span className={getBrandBadge(selectedRight.brand)}>
                      {selectedRight.brand}
                    </span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="search-input-right"
                      type="text"
                      placeholder={
                        category === 'CPU' ? '예: Ryzen 5, i7...' : 
                        category === 'GPU' ? '예: RX 7800, RTX 4060...' :
                        category === 'RAM' ? '예: 삼성 DDR5, G.SKILL...' :
                        category === 'SSD' ? '예: 990 PRO, P41...' :
                        category === 'CASE' ? '예: DLX21, 엘리시아...' :
                        '예: Classic II, 시소닉 FOCUS...'
                      }
                      value={searchRight}
                      onChange={(e) => {
                        setSearchRight(e.target.value);
                        setIsRightOpen(true);
                      }}
                      onFocus={() => setIsRightOpen(true)}
                      className={`w-full bg-[#111113] border border-slate-800 focus:border-slate-600 rounded-xl py-3.5 pl-10 pr-10 text-sm font-medium text-white placeholder-slate-600 outline-none transition-all duration-300 shadow-inner`}
                    />
                    {searchRight && (
                      <button 
                        onClick={() => setSearchRight('')}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Suggestions Dropdown */}
                  <AnimatePresence>
                    {isRightOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-[#0F0F12]/95 border border-slate-800 rounded-xl shadow-2xl z-20 backdrop-blur-md divide-y divide-slate-800/60"
                      >
                        {filteredRightItems.length > 0 ? (
                          filteredRightItems.map((item) => (
                            <button
                              key={item.id}
                              id={`select-right-${item.id}`}
                              onClick={() => {
                                setSelectedRight(item);
                                setIsRightOpen(false);
                                setSearchRight('');
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-slate-800/60 text-sm flex items-center justify-between group transition-colors"
                            >
                              <div>
                                <p className="font-semibold text-slate-200 group-hover:text-white transition-colors">{item.name}</p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {category === 'CPU' && `TDP ${item.tdp}W | ${item.cacheOrMemory}`}
                                  {category === 'GPU' && `TDP ${item.tdp}W | ${item.cacheOrMemory}`}
                                  {category === 'RAM' && `${item.memoryType} | ${item.baseClock}MHz | ${item.timing}`}
                                  {category === 'SSD' && `${item.ssdType} | ${item.nvmeGeneration} | TBW ${item.tbw}TB`}
                                  {category === 'CASE' && `${item.caseSize} | GPU 최대 ${item.maxGpuLength}mm`}
                                  {category === 'PSU' && `${item.psuEfficiency}인증 | 정격 ${item.ratedPower}W | ${item.psuModularType}`}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-slate-400">{formatPrice(item.price)}</span>
                                <span className={getBrandBadge(item.brand)}>{item.brand}</span>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-4 text-center text-xs text-gray-500">
                            검색 결과가 없습니다.
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </section>

            {/* Main Comparison Section */}
            <section className="space-y-6">
              
              {/* Header Card Summary Showcase */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
                
                {/* Left Header Panel */}
                <motion.div
                  id="spec-header-left"
                  layoutId={`card-head-${selectedLeft.id}`}
                  className="relative overflow-hidden rounded-2xl bg-[#161618] p-6 sm:p-8 border border-slate-800/80 shadow-2xl flex flex-col justify-between"
                >
                  <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/2 rounded-full pointer-events-none" />
                  <div className="flex flex-col h-full justify-between gap-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className={getBrandBadge(selectedLeft.brand)}>
                          {getSeriesName(selectedLeft)}
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-black mt-2 text-white italic tracking-tight leading-tight">
                          {selectedLeft.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{getArchitectureName(selectedLeft)}</p>
                      </div>
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${getBrandGradient(selectedLeft.brand)} rounded-xl border ${getBrandBorderClass(selectedLeft.brand)} flex items-center justify-center shrink-0 shadow-lg`}>
                        <span className={`text-2xl sm:text-3xl font-black ${getBrandTextClass(selectedLeft.brand)} opacity-50`}>
                          {getShortName(selectedLeft.name)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-3">
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest block">Estimated Price</span>
                          <div className="text-xl sm:text-2xl font-extrabold text-white mt-1 font-mono tracking-tight">
                            {formatPrice(selectedLeft.price)}
                          </div>
                        </div>
                        <div className="text-right text-[10px] text-slate-500 font-medium">
                          출시 {selectedLeft.releaseYear}년 {selectedLeft.processNode ? `• ${selectedLeft.processNode}` : ''}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPriceComparisonPart(selectedLeft)}
                          className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-[#141416]/80 hover:bg-[#18181b] text-indigo-400 hover:text-indigo-300 border border-indigo-900/40 hover:border-indigo-800/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>최저가 비교</span>
                        </button>
                        <button
                          onClick={() => addToEstimate(category, selectedLeft)}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                            estimate[category]?.id === selectedLeft.id
                              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/10'
                          }`}
                        >
                          {estimate[category]?.id === selectedLeft.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>견적 담김</span>
                            </>
                          ) : (
                            <>
                              <ClipboardList className="w-3.5 h-3.5" />
                              <span>견적 추가</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Right Header Panel */}
                <motion.div
                  id="spec-header-right"
                  layoutId={`card-head-${selectedRight.id}`}
                  className="relative overflow-hidden rounded-2xl bg-[#161618] p-6 sm:p-8 border border-slate-800/80 shadow-2xl flex flex-col justify-between"
                >
                  <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/2 rounded-full pointer-events-none" />
                  <div className="flex flex-col h-full justify-between gap-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className={getBrandBadge(selectedRight.brand)}>
                          {getSeriesName(selectedRight)}
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-black mt-2 text-white italic tracking-tight leading-tight">
                          {selectedRight.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{getArchitectureName(selectedRight)}</p>
                      </div>
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${getBrandGradient(selectedRight.brand)} rounded-xl border ${getBrandBorderClass(selectedRight.brand)} flex items-center justify-center shrink-0 shadow-lg`}>
                        <span className={`text-2xl sm:text-3xl font-black ${getBrandTextClass(selectedRight.brand)} opacity-50`}>
                          {getShortName(selectedRight.name)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-3">
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest block">Estimated Price</span>
                          <div className="text-xl sm:text-2xl font-extrabold text-white mt-1 font-mono tracking-tight">
                            {formatPrice(selectedRight.price)}
                          </div>
                        </div>
                        <div className="text-right text-[10px] text-slate-500 font-medium">
                          출시 {selectedRight.releaseYear}년 {selectedRight.processNode ? `• ${selectedRight.processNode}` : ''}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setPriceComparisonPart(selectedRight)}
                          className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-[#141416]/80 hover:bg-[#18181b] text-indigo-400 hover:text-indigo-300 border border-indigo-900/40 hover:border-indigo-800/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>최저가 비교</span>
                        </button>
                        <button
                          onClick={() => addToEstimate(category, selectedRight)}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                            estimate[category]?.id === selectedRight.id
                              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/10'
                          }`}
                        >
                          {estimate[category]?.id === selectedRight.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>견적 담김</span>
                            </>
                          ) : (
                            <>
                              <ClipboardList className="w-3.5 h-3.5" />
                              <span>견적 추가</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>

              </div>

              {/* Core Table Grid - Clean and Elegant Side-by-side Table */}
              <div className="bg-[#161618]/60 rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl">
                <div className="px-5 py-4 bg-[#161618] border-b border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-blue-500" />
                    상세 스펙 비교표 ({category})
                  </span>
                  <span className="text-xs text-slate-500">
                    ⭐ 초록색 텍스트/배지는 해당 하드웨어의 우위 스펙을 뜻합니다
                  </span>
                </div>

                <div className="divide-y divide-slate-800/50">
                  
                  {/* 가격 Row */}
                  <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                    <div className={`text-left pr-2 md:pr-4 ${getWinner('price', true) === 'left' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono">{formatPrice(selectedLeft.price)}</span>
                        {getWinner('price', true) === 'left' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 font-semibold border border-emerald-900/40">최저가</span>}
                      </div>
                    </div>
                    <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">
                      시장 참고 가격
                    </div>
                    <div className={`text-right pl-2 md:pl-4 ${getWinner('price', true) === 'right' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                      <div className="flex items-center justify-between flex-row-reverse">
                        <span className="font-mono">{formatPrice(selectedRight.price)}</span>
                        {getWinner('price', true) === 'right' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 font-semibold border border-emerald-900/40">최저가</span>}
                      </div>
                    </div>
                  </div>

                  {/* CPU Only Spec Rows */}
                  {category === 'CPU' && (
                    <>
                      {/* 코어 수 */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className={`text-left pr-2 md:pr-4 ${getWinner('cores') === 'left' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          <div className="flex items-center justify-between">
                            <span>{selectedLeft.cores} 코어</span>
                            {getWinner('cores') === 'left' && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                        </div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">코어 수</div>
                        <div className={`text-right pl-2 md:pl-4 ${getWinner('cores') === 'right' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          <div className="flex items-center justify-between flex-row-reverse">
                            <span>{selectedRight.cores} 코어</span>
                            {getWinner('cores') === 'right' && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                        </div>
                      </div>

                      {/* 스레드 수 */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className={`text-left pr-2 md:pr-4 ${getWinner('threads') === 'left' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          <div className="flex items-center justify-between">
                            <span>{selectedLeft.threads} 스레드</span>
                            {getWinner('threads') === 'left' && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                        </div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">스레드 수</div>
                        <div className={`text-right pl-2 md:pl-4 ${getWinner('threads') === 'right' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          <div className="flex items-center justify-between flex-row-reverse">
                            <span>{selectedRight.threads} 스레드</span>
                            {getWinner('threads') === 'right' && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* CPU & GPU Spec Rows */}
                  {(category === 'CPU' || category === 'GPU') && (
                    <>
                      {/* 기본 클럭 */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className={`text-left pr-2 md:pr-4 ${getWinner('baseClock') === 'left' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-mono">{selectedLeft.baseClock} {category === 'CPU' ? 'GHz' : 'MHz'}</span>
                            {getWinner('baseClock') === 'left' && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                        </div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">기본 동작 클럭</div>
                        <div className={`text-right pl-2 md:pl-4 ${getWinner('baseClock') === 'right' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          <div className="flex items-center justify-between flex-row-reverse">
                            <span className="font-mono">{selectedRight.baseClock} {category === 'CPU' ? 'GHz' : 'MHz'}</span>
                            {getWinner('baseClock') === 'right' && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                        </div>
                      </div>

                      {/* 부스트 클럭 */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className={`text-left pr-2 md:pr-4 ${getWinner('boostClock') === 'left' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-mono">{selectedLeft.boostClock} {category === 'CPU' ? 'GHz' : 'MHz'}</span>
                            {getWinner('boostClock') === 'left' && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                        </div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">최대 부스트 클럭</div>
                        <div className={`text-right pl-2 md:pl-4 ${getWinner('boostClock') === 'right' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          <div className="flex items-center justify-between flex-row-reverse">
                            <span className="font-mono">{selectedRight.boostClock} {category === 'CPU' ? 'GHz' : 'MHz'}</span>
                            {getWinner('boostClock') === 'right' && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                        </div>
                      </div>

                      {/* 소비 전력 */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className={`text-left pr-2 md:pr-4 ${getWinner('tdp', true) === 'left' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-mono">{selectedLeft.tdp} W</span>
                            {getWinner('tdp', true) === 'left' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 font-semibold border border-emerald-900/40">저전력</span>}
                          </div>
                        </div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">열설계전력 (TDP)</div>
                        <div className={`text-right pl-2 md:pl-4 ${getWinner('tdp', true) === 'right' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          <div className="flex items-center justify-between flex-row-reverse">
                            <span className="font-mono">{selectedRight.tdp} W</span>
                            {getWinner('tdp', true) === 'right' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 font-semibold border border-emerald-900/40">저전력</span>}
                          </div>
                        </div>
                      </div>

                      {/* 소켓 및 인터페이스 */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className="text-left pr-2 md:pr-4 text-slate-300 text-sm font-medium">
                          {selectedLeft.socketOrInterface}
                        </div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">소켓 및 대역 규격</div>
                        <div className="text-right pl-2 md:pl-4 text-slate-300 text-sm font-medium">
                          {selectedRight.socketOrInterface}
                        </div>
                      </div>

                      {/* 캐시 및 메모리 버퍼 */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className="text-left pr-2 md:pr-4 text-slate-300 text-sm font-medium">
                          {selectedLeft.cacheOrMemory}
                        </div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">
                          {category === 'CPU' ? 'L3 캐시 용량' : 'VRAM 메모리 스펙'}
                        </div>
                        <div className="text-right pl-2 md:pl-4 text-slate-300 text-sm font-medium">
                          {selectedRight.cacheOrMemory}
                        </div>
                      </div>
                    </>
                  )}

                  {/* RAM Only Spec Rows */}
                  {category === 'RAM' && (
                    <>
                      {/* 메모리 규격 */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className="text-left pr-2 md:pr-4 text-slate-300 text-sm font-bold">{selectedLeft.memoryType}</div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">메모리 규격 세대</div>
                        <div className="text-right pl-2 md:pl-4 text-slate-300 text-sm font-bold">{selectedRight.memoryType}</div>
                      </div>

                      {/* 동작 주파수 속도 */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className={`text-left pr-2 md:pr-4 ${getWinner('baseClock') === 'left' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-mono">{selectedLeft.baseClock} MHz</span>
                            {getWinner('baseClock') === 'left' && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                        </div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">메모리 동작 클럭</div>
                        <div className={`text-right pl-2 md:pl-4 ${getWinner('baseClock') === 'right' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          <div className="flex items-center justify-between flex-row-reverse">
                            <span className="font-mono">{selectedRight.baseClock} MHz</span>
                            {getWinner('baseClock') === 'right' && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                        </div>
                      </div>

                      {/* 용량 및 구성 */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className="text-left pr-2 md:pr-4 text-slate-300 text-sm font-medium">{selectedLeft.capacity}</div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">용량 및 모듈 구성</div>
                        <div className="text-right pl-2 md:pl-4 text-slate-300 text-sm font-medium">{selectedRight.capacity}</div>
                      </div>

                      {/* 램 타이밍 */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className="text-left pr-2 md:pr-4 text-slate-300 font-mono text-sm">{selectedLeft.timing}</div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">지연시간 지표 (CL)</div>
                        <div className="text-right pl-2 md:pl-4 text-slate-300 font-mono text-sm">{selectedRight.timing}</div>
                      </div>

                      {/* 소비 전압/전력 */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className={`text-left pr-2 md:pr-4 ${getWinner('tdp', true) === 'left' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-mono">{selectedLeft.tdp} W (추정)</span>
                            {getWinner('tdp', true) === 'left' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 font-semibold border border-emerald-900/40">저전력</span>}
                          </div>
                        </div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">대략 전력 사용량</div>
                        <div className={`text-right pl-2 md:pl-4 ${getWinner('tdp', true) === 'right' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          <div className="flex items-center justify-between flex-row-reverse">
                            <span className="font-mono">{selectedRight.tdp} W (추정)</span>
                            {getWinner('tdp', true) === 'right' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 font-semibold border border-emerald-900/40">저전력</span>}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* SSD Only Spec Rows */}
                  {category === 'SSD' && (
                    <>
                      {/* 스토리지 타입 */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className="text-left pr-2 md:pr-4 text-slate-300 text-sm font-medium">{selectedLeft.ssdType}</div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">스토리지 타입 폼팩터</div>
                        <div className="text-right pl-2 md:pl-4 text-slate-300 text-sm font-medium">{selectedRight.ssdType}</div>
                      </div>

                      {/* 대역폭 규격 */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className="text-left pr-2 md:pr-4 text-slate-300 text-sm font-bold">{selectedLeft.nvmeGeneration}</div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">PCIe 세대 규격</div>
                        <div className="text-right pl-2 md:pl-4 text-slate-300 text-sm font-bold">{selectedRight.nvmeGeneration}</div>
                      </div>

                      {/* 용량 */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className="text-left pr-2 md:pr-4 text-slate-300 text-sm">{selectedLeft.capacity}</div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">스토리지 총 용량</div>
                        <div className="text-right pl-2 md:pl-4 text-slate-300 text-sm">{selectedRight.capacity}</div>
                      </div>

                      {/* DRAM 유무 */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className="text-left pr-2 md:pr-4 text-slate-300 text-xs font-semibold">{selectedLeft.cacheOrMemory}</div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">DRAM 버퍼 탑재 유무</div>
                        <div className="text-right pl-2 md:pl-4 text-slate-300 text-xs font-semibold">{selectedRight.cacheOrMemory}</div>
                      </div>

                      {/* 쓰기 수명 TBW */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className={`text-left pr-2 md:pr-4 ${getWinner('tbw') === 'left' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-mono">{selectedLeft.tbw} TBW</span>
                            {getWinner('tbw') === 'left' && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                        </div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">보증 쓰기 수명 (TBW)</div>
                        <div className={`text-right pl-2 md:pl-4 ${getWinner('tbw') === 'right' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          <div className="flex items-center justify-between flex-row-reverse">
                            <span className="font-mono">{selectedRight.tbw} TBW</span>
                            {getWinner('tbw') === 'right' && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* CASE Only Spec Rows */}
                  {category === 'CASE' && (
                    <>
                      {/* 사이즈 */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className="text-left pr-2 md:pr-4 text-slate-300 text-sm font-bold">{selectedLeft.caseSize}</div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">케이스 폼팩터 크기</div>
                        <div className="text-right pl-2 md:pl-4 text-slate-300 text-sm font-bold">{selectedRight.caseSize}</div>
                      </div>

                      {/* 기본 탑재 팬 */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className={`text-left pr-2 md:pr-4 ${getWinner('scoreSingle') === 'left' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          <div className="flex items-center justify-between">
                            <span>{selectedLeft.cacheOrMemory} ({selectedLeft.scoreSingle}개)</span>
                            {getWinner('scoreSingle') === 'left' && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                        </div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">기본 번들 팬 수량</div>
                        <div className={`text-right pl-2 md:pl-4 ${getWinner('scoreSingle') === 'right' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          <div className="flex items-center justify-between flex-row-reverse">
                            <span>{selectedRight.cacheOrMemory} ({selectedRight.scoreSingle}개)</span>
                            {getWinner('scoreSingle') === 'right' && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                        </div>
                      </div>

                      {/* GPU 장착 제약 길이 */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className={`text-left pr-2 md:pr-4 ${getWinner('maxGpuLength') === 'left' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-mono">최대 {selectedLeft.maxGpuLength} mm</span>
                            {getWinner('maxGpuLength') === 'left' && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                        </div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">GPU 장착 허용 길이</div>
                        <div className={`text-right pl-2 md:pl-4 ${getWinner('maxGpuLength') === 'right' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          <div className="flex items-center justify-between flex-row-reverse">
                            <span className="font-mono">최대 {selectedRight.maxGpuLength} mm</span>
                            {getWinner('maxGpuLength') === 'right' && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                        </div>
                      </div>

                      {/* CPU 공랭 쿨러 높이 */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className={`text-left pr-2 md:pr-4 ${getWinner('maxCpuCoolerHeight') === 'left' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-mono">최대 {selectedLeft.maxCpuCoolerHeight} mm</span>
                            {getWinner('maxCpuCoolerHeight') === 'left' && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                        </div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">CPU 쿨러 허용 높이</div>
                        <div className={`text-right pl-2 md:pl-4 ${getWinner('maxCpuCoolerHeight') === 'right' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          <div className="flex items-center justify-between flex-row-reverse">
                            <span className="font-mono">최대 {selectedRight.maxCpuCoolerHeight} mm</span>
                            {getWinner('maxCpuCoolerHeight') === 'right' && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* PSU Only Spec Rows */}
                  {category === 'PSU' && (
                    <>
                      {/* 정격 출력 */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className={`text-left pr-2 md:pr-4 ${getWinner('ratedPower') === 'left' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-mono">{selectedLeft.ratedPower} W</span>
                            {getWinner('ratedPower') === 'left' && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                        </div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">정격 출력 용량</div>
                        <div className={`text-right pl-2 md:pl-4 ${getWinner('ratedPower') === 'right' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          <div className="flex items-center justify-between flex-row-reverse">
                            <span className="font-mono">{selectedRight.ratedPower} W</span>
                            {getWinner('ratedPower') === 'right' && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                        </div>
                      </div>

                      {/* 인증 등급 */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className="text-left pr-2 md:pr-4 text-slate-300 text-sm font-bold">{selectedLeft.cacheOrMemory} ({selectedLeft.psuEfficiency})</div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">80PLUS 효율 인증 등급</div>
                        <div className="text-right pl-2 md:pl-4 text-slate-300 text-sm font-bold">{selectedRight.cacheOrMemory} ({selectedRight.psuEfficiency})</div>
                      </div>

                      {/* 모듈러 여부 */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className="text-left pr-2 md:pr-4 text-slate-300 text-sm">{selectedLeft.psuModularType}</div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">케이블 설계 방식</div>
                        <div className="text-right pl-2 md:pl-4 text-slate-300 text-sm">{selectedRight.psuModularType}</div>
                      </div>
                    </>
                  )}

                  {/* COOLER Only Spec Rows */}
                  {category === 'COOLER' && (
                    <>
                      {/* 냉각 방식 */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className="text-left pr-2 md:pr-4 text-slate-300 text-sm font-bold">{selectedLeft.coolerType}</div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">냉각 방식</div>
                        <div className="text-right pl-2 md:pl-4 text-slate-300 text-sm font-bold">{selectedRight.coolerType}</div>
                      </div>

                      {/* 냉각 용량 (TDP) */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className={`text-left pr-2 md:pr-4 ${getWinner('scoreMulti') === 'left' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-mono">{selectedLeft.scoreMulti} W</span>
                            {getWinner('scoreMulti') === 'left' && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                        </div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">최대 발열 감당 용량 (TDP)</div>
                        <div className={`text-right pl-2 md:pl-4 ${getWinner('scoreMulti') === 'right' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          <div className="flex items-center justify-between flex-row-reverse">
                            <span className="font-mono">{selectedRight.scoreMulti} W</span>
                            {getWinner('scoreMulti') === 'right' && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                        </div>
                      </div>

                      {/* 팬 규격 */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className="text-left pr-2 md:pr-4 text-slate-300 text-sm">{selectedLeft.fanSize}</div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none font-sans">쿨링팬 규격</div>
                        <div className="text-right pl-2 md:pl-4 text-slate-300 text-sm">{selectedRight.fanSize}</div>
                      </div>

                      {/* 팬 수량 */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className={`text-left pr-2 md:pr-4 ${getWinner('fanCount') === 'left' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          <div className="flex items-center justify-between">
                            <span>{selectedLeft.fanCount} 개</span>
                            {getWinner('fanCount') === 'left' && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                        </div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">번들 팬 수량</div>
                        <div className={`text-right pl-2 md:pl-4 ${getWinner('fanCount') === 'right' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                          <div className="flex items-center justify-between flex-row-reverse">
                            <span>{selectedRight.fanCount} 개</span>
                            {getWinner('fanCount') === 'right' && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                        </div>
                      </div>

                      {/* 라디에이터 사이즈 */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className="text-left pr-2 md:pr-4 text-slate-300 text-sm font-semibold">{selectedLeft.radiatorSize || 'N/A (공랭)'}</div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">라디에이터 규격</div>
                        <div className="text-right pl-2 md:pl-4 text-slate-300 text-sm font-semibold">{selectedRight.radiatorSize || 'N/A (공랭)'}</div>
                      </div>

                      {/* 최저/최대 구동 소음 */}
                      <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                        <div className="text-left pr-2 md:pr-4 text-slate-300 text-sm">{selectedLeft.noiseLevel}</div>
                        <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">구동 최대 소음도</div>
                        <div className="text-right pl-2 md:pl-4 text-slate-300 text-sm">{selectedRight.noiseLevel}</div>
                      </div>
                    </>
                  )}

                  {/* 제조 공정 & 기술 (모두 해당) */}
                  {selectedLeft.processNode && selectedRight.processNode && (
                    <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                      <div className="text-left pr-2 md:pr-4 text-slate-300 text-sm">
                        {selectedLeft.processNode}
                      </div>
                      <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">제조 공정 및 패키징</div>
                      <div className="text-right pl-2 md:pl-4 text-slate-300 text-sm">
                        {selectedRight.processNode}
                      </div>
                    </div>
                  )}

                  {/* 출시년도 Row (모두 해당) */}
                  <div className="grid grid-cols-[1fr_auto_1fr] md:grid-cols-[1fr_200px_1fr] items-center p-4 hover:bg-slate-800/20 transition-all duration-150">
                    <div className={`text-left pr-2 md:pr-4 ${getWinner('releaseYear') === 'left' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                      <div className="flex items-center justify-between">
                        <span>{selectedLeft.releaseYear}년</span>
                        {getWinner('releaseYear') === 'left' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 font-semibold border border-emerald-900/40">최신</span>}
                      </div>
                    </div>
                    <div className="text-center px-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 select-none">시장 출시 년도</div>
                    <div className={`text-right pl-2 md:pl-4 ${getWinner('releaseYear') === 'right' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                      <div className="flex items-center justify-between flex-row-reverse">
                        <span>{selectedRight.releaseYear}년</span>
                        {getWinner('releaseYear') === 'right' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 font-semibold border border-emerald-900/40">최신</span>}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Benchmark Score Charts & Performance Visualizations */}
              <div className="bg-[#161618]/60 rounded-2xl border border-slate-800/80 p-5 sm:p-6 shadow-xl space-y-6 animate-fade-in">
                <h4 className="text-sm font-bold text-slate-300 flex items-center gap-1.5 border-b border-slate-800 pb-3">
                  <Gauge className="w-4 h-4 text-blue-500" />
                  실측 성능 및 계량 사양 대조 지표
                </h4>

                {/* Performance Bar 1 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      {category === 'CPU' && '싱글코어 연산 스코어 (Cinebench R23)'}
                      {category === 'GPU' && '그래픽스 타임스파이 점수 (3DMark)'}
                      {category === 'RAM' && '메모리 반응 레이턴시 성능 (수치가 높을수록 지연시간이 낮고 빠른 고성능)'}
                      {category === 'SSD' && '순차 읽기 속도 (Sequential Read, MB/s)'}
                      {category === 'CASE' && '기본 장착 번들 쿨링팬 수량 (개)'}
                      {category === 'PSU' && '정격 전원 총 출력량 (Rated Output, W)'}
                      {category === 'COOLER' && '번들 쿨링팬 기본 장착 수량 (개)'}
                    </span>
                    <span className="text-slate-500">높을수록 우수</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 truncate max-w-[150px] sm:max-w-none">{selectedLeft.name}</span>
                        <span className={`font-mono font-bold ${getBrandTextClass(selectedLeft.brand)}`}>
                          {selectedLeft.scoreSingle?.toLocaleString()}
                          {category === 'SSD' ? ' MB/s' : (category === 'CASE' || category === 'COOLER') ? '개' : category === 'PSU' ? 'W' : '점'}
                        </span>
                      </div>
                      <div className="h-2.5 bg-[#111113] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${((selectedLeft.scoreSingle || 0) / Math.max(selectedLeft.scoreSingle || 1, selectedRight.scoreSingle || 1)) * 100}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className={`h-full bg-gradient-to-r ${selectedLeft.brand === 'Intel' ? 'from-blue-600 to-blue-400' : selectedLeft.brand === 'AMD' ? 'from-orange-600 to-orange-400' : 'from-emerald-600 to-emerald-400'} rounded-full`}
                          style={{
                            backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`
                          }}
                        />
                      </div>
                    </div>
                    {/* Right */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 truncate max-w-[150px] sm:max-w-none">{selectedRight.name}</span>
                        <span className={`font-mono font-bold ${getBrandTextClass(selectedRight.brand)}`}>
                          {selectedRight.scoreSingle?.toLocaleString()}
                          {category === 'SSD' ? ' MB/s' : (category === 'CASE' || category === 'COOLER') ? '개' : category === 'PSU' ? 'W' : '점'}
                        </span>
                      </div>
                      <div className="h-2.5 bg-[#111113] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${((selectedRight.scoreSingle || 0) / Math.max(selectedLeft.scoreSingle || 1, selectedRight.scoreSingle || 1)) * 100}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className={`h-full bg-gradient-to-r ${selectedRight.brand === 'Intel' ? 'from-blue-600 to-blue-400' : selectedRight.brand === 'AMD' ? 'from-orange-600 to-orange-400' : 'from-emerald-600 to-emerald-400'} rounded-full`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Bar 2 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-blue-500" />
                      {category === 'CPU' && '멀티코어 렌더링 스코어 (Cinebench R23)'}
                      {category === 'GPU' && '종합 연산 3D 그래픽 스코어 (FireStrike)'}
                      {category === 'RAM' && '메모리 최대 전송 대역폭 수준 (Bandwidth, MB/s)'}
                      {category === 'SSD' && '순차 쓰기 속도 (Sequential Write, MB/s)'}
                      {category === 'CASE' && '최대 장착 가능 그래픽카드 길이 (Clearance, mm)'}
                      {category === 'PSU' && '정격 피크 출력 효율 변환율 (Peak Efficiency, %)'}
                      {category === 'COOLER' && '최대 감당 냉각 성능 용량 (TDP, W)'}
                    </span>
                    <span className="text-slate-500">높을수록 우수</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 truncate max-w-[150px] sm:max-w-none">{selectedLeft.name}</span>
                        <span className={`font-mono font-bold ${getBrandTextClass(selectedLeft.brand)}`}>
                          {selectedLeft.scoreMulti?.toLocaleString()}
                          {category === 'SSD' ? ' MB/s' : category === 'CASE' ? 'mm' : category === 'COOLER' ? ' W' : category === 'PSU' ? '%' : '점'}
                        </span>
                      </div>
                      <div className="h-2.5 bg-[#111113] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${((selectedLeft.scoreMulti || 0) / Math.max(selectedLeft.scoreMulti || 1, selectedRight.scoreMulti || 1)) * 100}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className={`h-full bg-gradient-to-r ${selectedLeft.brand === 'Intel' ? 'from-blue-600 to-blue-400' : selectedLeft.brand === 'AMD' ? 'from-orange-600 to-orange-400' : 'from-emerald-600 to-emerald-400'} rounded-full`}
                        />
                      </div>
                    </div>
                    {/* Right */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 truncate max-w-[150px] sm:max-w-none">{selectedRight.name}</span>
                        <span className={`font-mono font-bold ${getBrandTextClass(selectedRight.brand)}`}>
                          {selectedRight.scoreMulti?.toLocaleString()}
                          {category === 'SSD' ? ' MB/s' : category === 'CASE' ? 'mm' : category === 'COOLER' ? ' W' : category === 'PSU' ? '%' : '점'}
                        </span>
                      </div>
                      <div className="h-2.5 bg-[#111113] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${((selectedRight.scoreMulti || 0) / Math.max(selectedLeft.scoreMulti || 1, selectedRight.scoreMulti || 1)) * 100}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className={`h-full bg-gradient-to-r ${selectedRight.brand === 'Intel' ? 'from-blue-600 to-blue-400' : selectedRight.brand === 'AMD' ? 'from-orange-600 to-orange-400' : 'from-emerald-600 to-emerald-400'} rounded-full`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Bar 3 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-emerald-500" />
                      {category === 'CPU' && '전력 효율성 지수 (TDP 대비 싱글 성능 환산비)'}
                      {category === 'GPU' && '전력 효율성 지수 (TDP 대비 타스 스코어 환산비)'}
                      {category === 'RAM' && '동작 전성비 효율 (TDP 1W당 작동 클럭 주파수 비율)'}
                      {category === 'SSD' && '동작 가성비 수명 등가비 (가격 10만원당 쓰기 수명 TBW 확보량)'}
                      {category === 'CASE' && 'CPU 수랭 쿨러 최대 높이 장착 제약 마진 (mm)'}
                      {category === 'PSU' && '정격 전원 출력 설계의 안전 마진 지수 (W)'}
                      {category === 'COOLER' && '가격 대비 냉각 가성비 수치 (1만원당 감당 TDP W수)'}
                    </span>
                    <span className="text-slate-500">높을수록 우수</span>
                  </div>

                  {(() => {
                    let valLeft = 0;
                    let valRight = 0;
                    let unit = ' pt/W';

                    if (category === 'CPU' || category === 'GPU') {
                      valLeft = Math.round(((selectedLeft.scoreSingle || 0) / (selectedLeft.tdp || 1)) * 10) / 10;
                      valRight = Math.round(((selectedRight.scoreSingle || 0) / (selectedRight.tdp || 1)) * 10) / 10;
                    } else if (category === 'RAM') {
                      valLeft = Math.round(((selectedLeft.baseClock || 0) / (selectedLeft.tdp || 1)) * 10) / 10;
                      valRight = Math.round(((selectedRight.baseClock || 0) / (selectedRight.tdp || 1)) * 10) / 10;
                      unit = ' MHz/W';
                    } else if (category === 'SSD') {
                      valLeft = Math.round(((selectedLeft.tbw || 0) * 100000) / (selectedLeft.price || 1));
                      valRight = Math.round(((selectedRight.tbw || 0) * 100000) / (selectedRight.price || 1));
                      unit = ' TBW';
                    } else if (category === 'CASE') {
                      valLeft = selectedLeft.maxCpuCoolerHeight || 0;
                      valRight = selectedRight.maxCpuCoolerHeight || 0;
                      unit = ' mm';
                    } else if (category === 'PSU') {
                      valLeft = selectedLeft.ratedPower || 0;
                      valRight = selectedRight.ratedPower || 0;
                      unit = ' W';
                    } else if (category === 'COOLER') {
                      valLeft = Math.round(((selectedLeft.scoreMulti || 0) * 10000) / (selectedLeft.price || 1));
                      valRight = Math.round(((selectedRight.scoreMulti || 0) * 10000) / (selectedRight.price || 1));
                      unit = ' W/만원';
                    }

                    const maxVal = Math.max(valLeft, valRight, 1);

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-300 truncate max-w-[150px] sm:max-w-none">{selectedLeft.name}</span>
                            <span className={`font-mono font-bold ${getBrandTextClass(selectedLeft.brand)}`}>{valLeft.toLocaleString()}{unit}</span>
                          </div>
                          <div className="h-2.5 bg-[#111113] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(valLeft / maxVal) * 100}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                              className={`h-full bg-gradient-to-r ${selectedLeft.brand === 'Intel' ? 'from-blue-600 to-blue-400' : selectedLeft.brand === 'AMD' ? 'from-orange-600 to-orange-400' : 'from-emerald-600 to-emerald-400'} rounded-full`}
                            />
                          </div>
                        </div>
                        {/* Right */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-300 truncate max-w-[150px] sm:max-w-none">{selectedRight.name}</span>
                            <span className={`font-mono font-bold ${getBrandTextClass(selectedRight.brand)}`}>{valRight.toLocaleString()}{unit}</span>
                          </div>
                          <div className="h-2.5 bg-[#111113] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(valRight / maxVal) * 100}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                              className={`h-full bg-gradient-to-r ${selectedRight.brand === 'Intel' ? 'from-blue-600 to-blue-400' : selectedRight.brand === 'AMD' ? 'from-orange-600 to-orange-400' : 'from-emerald-600 to-emerald-400'} rounded-full`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

              </div>

              {/* Expert Core Recommendations & Pros/Cons Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
                
                {/* Left Recommendations Card */}
                <div className="p-5 rounded-2xl bg-[#161618]/60 border border-slate-800/80 flex flex-col justify-between gap-4 relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full filter blur-xl pointer-events-none" />
                  <div>
                    <h5 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-1.5">
                      <ThumbsUp className="w-4 h-4 text-blue-400" />
                      {selectedLeft.name} 핵심 특화 강점
                    </h5>
                    <ul className="space-y-2.5">
                      {getDynamicPros('left').map((pro, idx) => (
                        <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-3 border-t border-slate-800/60 mt-2">
                    <span className="text-[10px] text-slate-500 font-semibold">추천 시스템 용도: </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md border bg-slate-950/40 text-blue-300 border-blue-900/50">
                      {getRecommendedUsage(selectedLeft)}
                    </span>
                  </div>
                </div>

                {/* Right Recommendations Card */}
                <div className="p-5 rounded-2xl bg-[#161618]/60 border border-slate-800/80 flex flex-col justify-between gap-4 relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full filter blur-xl pointer-events-none" />
                  <div>
                    <h5 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-1.5">
                      <ThumbsUp className="w-4 h-4 text-cyan-400" />
                      {selectedRight.name} 핵심 특화 강점
                    </h5>
                    <ul className="space-y-2.5">
                      {getDynamicPros('right').map((pro, idx) => (
                        <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                          <span className="text-cyan-400 mt-0.5">•</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-3 border-t border-slate-800/60 mt-2">
                    <span className="text-[10px] text-slate-500 font-semibold">추천 시스템 용도: </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md border bg-slate-950/40 text-cyan-300 border-cyan-900/50">
                      {getRecommendedUsage(selectedRight)}
                    </span>
                  </div>
                </div>

              </div>

            </section>

            {/* Quick Tips or Reset */}
            <section className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#161618]/30 border border-slate-800/80 text-xs text-slate-500 shadow-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-500/60" />
                <span>호환 가이드: {getCategoryTip()}</span>
              </div>
              <button
                id="btn-reset-comparer"
                onClick={() => {
                  const defaultItems = COMPONENTS_DATA.filter(c => c.category === category);
                  if (defaultItems.length >= 2) {
                    setSelectedLeft(defaultItems[0]);
                    setSelectedRight(defaultItems[1]);
                  }
                  setSearchLeft('');
                  setSearchRight('');
                  setIsLeftOpen(false);
                  setIsRightOpen(false);
                }}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors py-1.5 px-3 bg-[#111113] border border-slate-800 rounded-lg text-xs cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                기본 비교값으로 초기화
              </button>
            </section>
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0F0F12] py-8 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p>© 2026 ComSpec. 모든 스펙과 계량 점수는 제조사 공식 스펙 가이드라인 및 공인 테스팅 그룹 통계를 기반으로 대조되었습니다.</p>
          <p className="text-[10px] text-slate-600">Intel, AMD, NVIDIA 및 기타 상표는 해당 제조사의 고유 자산 및 등록상표입니다.</p>
        </div>
      </footer>

      <AnimatePresence>
        {priceComparisonPart && (
          <PriceComparisonModal
            part={priceComparisonPart}
            onClose={() => setPriceComparisonPart(null)}
            addToEstimate={addToEstimate}
            removeFromEstimate={removeFromEstimate}
            estimate={estimate}
            formatPrice={formatPrice}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
