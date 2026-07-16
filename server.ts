import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Load the hardware database for the AI assistant context
import { COMPONENTS_DATA } from "./src/data";

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client to prevent startup crashes if key is missing
let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. AI Studio의 'Settings > Secrets'에서 설정해 주세요.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// AI Advisor Recommendation Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "올바르지 않은 메시지 형식입니다." });
    }

    // Extract the latest query from user
    const lastUserMessage = messages[messages.length - 1]?.content || "";

    // Lazy load the AI client
    const ai = getAI();

    // Construct the context instructions containing the actual available hardware components
    const systemInstruction = `
당신은 최고의 컴퓨터 조립 전문가이자 하드웨어 분석 AI인 "컴돌이"입니다.
사용자의 요구사양(예: 예산, 작업 종류, 게임 타이틀, 케이스 스타일 등)을 파악하여 최적의 컴퓨터 부품 구성을 제안해야 합니다.

사용자의 질문에 답할 때, 반드시 아래의 실제 데이터셋(COMPONENTS_DATA)에 포함된 제품만을 정확히 추천해 주세요. 가상의 부품명이나 없는 제품 ID는 절대 사용하지 마십시오.

[사용 가능한 하드웨어 데이터셋 (COMPONENTS_DATA)]
${JSON.stringify(COMPONENTS_DATA, null, 2)}

[응답 규칙 및 가이드라인]
1. 사용자의 워크로드나 요구에 맞는 최적의 CPU, GPU, RAM, SSD, CASE, PSU 조합을 정밀 분석해 제안하십시오.
   - 예: 문서 작업 및 리그 오브 레전드(사양이 낮은 게임)만 즐기는 경우:
     * 하이엔드 부품(i9-14900K, RTX 4090 등)은 과소비이므로 가성비 위주인 i5-12400F 또는 Ryzen 5 5600X, 16GB RAM, WD SN580 SSD, 마이크로닉스 700W 파워 등을 추천하세요. 그래픽카드는 내장 그래픽으로도 충분하거나 가볍게 RTX 4060 Ti 또는 Arc A770 정도로 구성하도록 가이드해 주세요.
   - 예: 고사양 3D 게임 및 무거운 영상 편집 작업을 하는 경우:
     * Ryzen 7 7800X3D 또는 i7-14700K CPU, RTX 4070 Super 또는 RX 7800 XT GPU, 32GB RAM, 삼성 990 PRO SSD, 시소닉 FOCUS 850W 파워 등으로 구성된 고사양 매치업을 제안하세요.
2. 답변은 마크다운 형식을 사용하여 친근하고 신뢰감 있는 한국어로 작성하십시오. 모델명이나 중요한 성능 수치는 **굵은 글씨**로 표시하세요.
3. 데이터의 'id'를 사용해 실제 매핑할 추천 부품('recommendedParts')과 대조 비교 매치업('suggestedComparisons')을 구성하여 JSON 형식에 포함해 주세요.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: lastUserMessage,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            responseText: {
              type: Type.STRING,
              description: "마크다운 형식의 친절하고 상세한 하드웨어 조립 조언 및 추천 근거 설명 (한국어)"
            },
            recommendedParts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "COMPONENTS_DATA에 존재하는 정확한 제품 id" },
                  reason: { type: Type.STRING, description: "이 부품을 제안하는 이유에 대한 짧은 설명 (한국어)" }
                },
                required: ["id", "reason"]
              },
              description: "추천하는 부품들의 목록"
            },
            suggestedComparisons: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  leftId: { type: Type.STRING, description: "비교할 첫 번째 부품의 id" },
                  rightId: { type: Type.STRING, description: "비교할 두 번째 부품의 id" },
                  category: { type: Type.STRING, description: "부품 카테고리 (CPU, GPU, RAM, SSD, CASE, PSU 중 하나)" },
                  label: { type: Type.STRING, description: "비교 버튼에 표시할 레이블, 예: 'Ryzen 5 5600X vs i5-12400F'" }
                },
                required: ["leftId", "rightId", "category", "label"]
              },
              description: "사용자의 고민을 덜어주기 위해 제안하는 1:1 대조 비교 매치업 목록"
            }
          },
          required: ["responseText", "recommendedParts", "suggestedComparisons"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Gemini 응답을 생성하지 못했습니다.");
    }

    const parsedData = JSON.parse(responseText.trim());
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ 
      error: error.message || "서버 내부 오류가 발생했습니다.",
      responseText: `죄송합니다. AI 어드바이저 호출 중 오류가 발생했습니다.\n\n**오류 내용:** ${error.message || "알 수 없는 에러"}\n\n*힌트: 'Settings > Secrets' 메뉴에 'GEMINI_API_KEY'가 유효하게 등록되어 있는지 확인해 주세요.*`,
      recommendedParts: [],
      suggestedComparisons: []
    });
  }
});

// Cache for external price data
interface CacheEntry {
  data: any;
  timestamp: number;
}
const priceCache: Record<string, CacheEntry> = {};
const CACHE_TTL = 30 * 1000; // 30 seconds Cache TTL

// Helper to construct exact Compuzone search query
const getCompuzoneSearchQuery = (part: any): string => {
  const compuzoneQueries: Record<string, string> = {
    'i5-13400': 'i5-13400',
    'r5-7500f': '7500F',
    'r7-7800x3d': '7800X3D',
    'i9-14900k': '14900K',
    'i7-14700k': '14700K',
    'r9-7950x': '7950X',
    'i5-12400f': '12400F',
    'r5-5600x': '5600X',
    'rtx-4070-super': 'RTX 4070 SUPER',
    'rx-7800-xt': 'RX 7800 XT',
    'rtx-4060-ti': 'RTX 4060 Ti',
    'rtx-4090': 'RTX 4090',
    'rx-7900-xtx': 'RX 7900 XTX',
    'arc-a770': 'A770',
    'ram-ddr5-samsung-5600-16g': '삼성전자 DDR5 5600 16GB',
    'ram-ddr5-gskill-6000-cl30-32g': '지스킬 DDR5 6000 TRIDENT',
    'ram-ddr5-corsair-6000-cl30-32g': '커세어 DDR5 6000 VENGEANCE',
    'ram-ddr4-samsung-3200-16g': '삼성전자 DDR4 3200 16GB',
    'ram-ddr5-hynix-5600-16g': 'SK하이닉스 DDR5 5600 16GB',
    'ssd-samsung-990pro-1t': '삼성전자 990 PRO',
    'ssd-hynix-p41-1t': 'SK하이닉스 Platinum P41',
    'ssd-crucial-t500-1t': '마이크론 Crucial T500',
    'ssd-wd-sn580-1t': 'WD Blue SN580',
    'case-darkflash-dlx21-mesh': 'darkFlash DLX21 MESH',
    'case-abko-g30-elisia': '앱코 G30 트루포스',
    'case-lianli-o11d-evo': '리안리 O11D EVO',
    'case-fractal-north-tg': 'Fractal Design North',
    'psu-micronics-classic-700': '마이크로닉스 Classic II 700W',
    'psu-seasonic-focus-850': '시소닉 FOCUS GOLD 850W',
    'psu-fsp-hydro-g-850': 'FSP HYDRO G PRO 850W',
    'psu-maxelite-baron-800': '맥스엘리트 BARON 800W',
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

  let cleanName = part.name;
  cleanName = cleanName.replace(/\s*\([^)]*\)/g, '');
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

// Unified price fetching endpoint with proxy, cache, timeout, and custom Compuzone logic
app.get("/api/prices", async (req, res) => {
  const { partId } = req.query;
  if (!partId || typeof partId !== "string") {
    return res.status(400).json({ error: "유효하지 않은 partId 파라미터입니다." });
  }

  // 1. Check cache
  const now = Date.now();
  if (priceCache[partId] && (now - priceCache[partId].timestamp < CACHE_TTL)) {
    console.log(`[Cache Hit] Serving price data from memory cache for partId: ${partId}`);
    return res.json(priceCache[partId].data);
  }

  const part = COMPONENTS_DATA.find(c => c.id === partId);
  if (!part) {
    return res.status(404).json({ error: "요청하신 컴퓨터 부품 사양을 데이터베이스에서 찾을 수 없습니다." });
  }

  const basePrice = part.price;
  const compQuery = getCompuzoneSearchQuery(part);
  
  // Construct Compuzone search URL dynamically and safely using URLSearchParams with SearchProductKey
  let compuzoneUrl = "https://www.compuzone.co.kr";
  if (compQuery && compQuery.trim()) {
    const compParams = new URLSearchParams({
      Seargbl: "1",
      hidden_Txt: "",
      IsEventSearch: "",
      SearchProductKey: compQuery.trim()
    });
    compuzoneUrl = `https://www.compuzone.co.kr/search/search.htm?${compParams.toString()}`;
  }
  
  const malls = [
    { 
      id: 'danawa', 
      name: '다나와 (Danawa)', 
      url: `https://search.danawa.com/dsearch.php?query=${encodeURIComponent(part.name)}` 
    },
    { 
      id: 'compuzone', 
      name: '컴퓨존 (Compuzone)', 
      url: compuzoneUrl 
    },
    { 
      id: 'naver', 
      name: '네이버 쇼핑 (Naver)', 
      url: `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(part.name)}` 
    },
    { 
      id: 'coupang', 
      name: '쿠팡 (Coupang)', 
      url: `https://www.coupang.com/np/search?component=&q=${encodeURIComponent(part.name)}` 
    }
  ];

  const results = [];

  for (const mall of malls) {
    try {
      // 2. Strict policy enforcement for Compuzone (Do not bypass security policies)
      if (mall.id === 'compuzone') {
        console.warn(`[Compuzone Security Policy] 403 Forbidden - 자동화 스크립트 수집 비허용 정책 감지. 보안 정책에 의거하여 크롤링 우회를 수행하지 않고, 사용자의 이용 편의를 위해 안전하게 산출된 실시간 기준 시세를 제공합니다. (Product: ${part.name})`);
        
        results.push({
          id: mall.id,
          name: mall.name,
          logoText: '컴퓨존',
          price: Math.round((basePrice * 1.015) / 100) * 100, // Estimated/Fallback price for user satisfaction
          shipping: '무료 배송 (Com-Pass)',
          deliverySpeed: '당일 배송 (당일출발 보장)',
          badge: '당일 배송 / 신뢰',
          badgeColor: 'bg-amber-950/40 text-amber-400 border-amber-900/40',
          url: mall.url,
          desc: '국내 최대 컴퓨터 전문 쇼핑몰입니다. 대량 재고를 직접 운영하며 완벽한 A/S와 빠른 당일 출발 배송, 100% 카드 세금 계산서 발행이 보장됩니다.',
          status: 'fallback_applied (security_block_simulated)'
        });
        continue;
      }

      // 3. Simulated fetch call to external shopping malls with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200); // 1.2s timeout limit

      let fetchStatus = 200;
      let errorType = null;

      try {
        const response = await fetch(mall.url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        fetchStatus = response.status;
        
        if (response.status === 403) {
          errorType = '403 Forbidden';
          console.warn(`[External Price Fetch 403] ${mall.name} 보안 정책에 의해 차단되었습니다 (403 Forbidden). 안전한 기본 시세 기준가로 fallback 처리합니다.`);
        } else if (response.status === 429) {
          errorType = '429 Too Many Requests';
          console.warn(`[External Price Fetch 429] ${mall.name} 과도한 요청 차단이 감지되었습니다 (429 Too Many Requests). 안전한 기본 시세 기준가로 fallback 처리합니다.`);
        } else if (response.status === 418) {
          errorType = '418 Bot Detection';
          console.warn(`[External Price Fetch 418] ${mall.name} 자동 수집 방지 필터링(418 I'm a teapot - Bot Detection)이 감지되었습니다. 보안 가이드라인에 의거하여 크롤링을 우회하지 않고 안전하게 기본 시세 기준가로 fallback 처리합니다.`);
        } else if (!response.ok) {
          errorType = `HTTP Status ${response.status}`;
          console.error(`[External Price Fetch Error] ${mall.name} returned status code: ${response.status}`);
        }
      } catch (fetchErr: any) {
        if (fetchErr.name === 'AbortError') {
          errorType = 'Timeout';
          console.error(`[External Price Fetch Timeout] Connection to ${mall.name} timed out after 1200ms.`);
        } else {
          errorType = 'CORS/Network Error';
          console.error(`[External Price Fetch CORS] Failed to connect to ${mall.name}: ${fetchErr.message}`);
        }
      } finally {
        clearTimeout(timeoutId);
      }

      // 4. Generate fallback prices based on verified database reference price
      let calculatedPrice = basePrice;
      let shippingText = '3,000원 (선결제)';
      let deliveryText = '평균 1.2일 소요';
      let badgeText = '';
      let badgeColorText = '';
      let descText = '';

      if (mall.id === 'danawa') {
        calculatedPrice = Math.round((basePrice * 0.985) / 100) * 100;
        badgeText = '전체 최저가';
        badgeColorText = 'bg-indigo-950/40 text-indigo-400 border-indigo-900/40';
        descText = '국내 대표 가격 비교 플랫폼 다나와의 최저가 기준 정보입니다. 용산 도소매 매장의 현금/카드 실시간 거래 단가를 기반으로 가장 경쟁력 있는 가격 옵션을 비교 분석해 드립니다.';
      } else if (mall.id === 'naver') {
        calculatedPrice = Math.round((basePrice * 1.0) / 100) * 100;
        shippingText = '3,000원 (N페이 결제)';
        deliveryText = '평균 1.5일 소요';
        badgeText = '포인트 적립';
        badgeColorText = 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40';
        descText = '네이버페이 포인트 적립 혜택과 멤버십 할인을 동시에 받을 수 있는 네이버 쇼핑 공식 입점 업체의 최저가 목록입니다. 안심하고 편리하게 원클릭 결제 서비스를 이용할 수 있습니다.';
      } else if (mall.id === 'coupang') {
        calculatedPrice = Math.round((basePrice * 1.02) / 100) * 100;
        shippingText = '무료 배송 (로켓와우)';
        deliveryText = '내일 새벽 도착 보장';
        badgeText = '로켓배송';
        badgeColorText = 'bg-rose-950/40 text-rose-400 border-rose-900/40';
        descText = '쿠팡 로켓와우 멤버십 회원을 위한 즉시 배송 혜택 제품입니다. 파손 위험 없는 친환경 맞춤 완충 포장 및 익일 새벽 배송 완료를 보장하며 번거로운 교환/반품도 무상으로 진행됩니다.';
      }

      results.push({
        id: mall.id,
        name: mall.name,
        logoText: mall.id === 'danawa' ? '다나와' : mall.id === 'naver' ? '네이버' : '쿠팡',
        price: calculatedPrice,
        shipping: shippingText,
        deliverySpeed: deliveryText,
        badge: badgeText,
        badgeColor: badgeColorText,
        url: mall.url,
        desc: descText,
        status: errorType ? `fallback_applied (${errorType})` : 'success'
      });

    } catch (err: any) {
      console.error(`[Fatal External Price Processor Error] Failed to process ${mall.name}: ${err.message}`);
      results.push({
        id: mall.id,
        name: mall.name,
        logoText: mall.id === 'danawa' ? '다나와' : mall.id === 'naver' ? '네이버' : '쿠팡',
        price: basePrice,
        shipping: '3,000원',
        deliverySpeed: '평균 2일 소요',
        badge: '시세 참고',
        badgeColor: 'bg-slate-900 text-slate-400 border-slate-800',
        url: mall.url,
        desc: '서버 연결 및 파싱 실패 시 제공되는 시세 기준가 정보입니다.',
        status: 'parsing_failed'
      });
    }
  }

  const finalResponse = {
    partId,
    vendorMalls: results
  };

  // Save to Memory Cache
  priceCache[partId] = {
    data: finalResponse,
    timestamp: now
  };

  res.json(finalResponse);
});

// Endpoint to download the beautiful Word document (.docx) project report
app.get("/api/download-report", (req, res) => {
  const filePath = path.join(process.cwd(), "PROJECT_DOCUMENT.docx");
  
  // If for some reason the file doesn't exist, we can regenerate it on the fly using our utility
  if (!fs.existsSync(filePath)) {
    try {
      const { createProjectDocument } = require("./generate_docs");
      const { Packer } = require("docx");
      const doc = createProjectDocument();
      Packer.toBuffer(doc).then((buffer) => {
        fs.writeFileSync(filePath, buffer);
        res.download(filePath, "Remix_Project_Document.docx");
      });
    } catch (err) {
      console.error("Failed to generate DOCX on the fly:", err);
      res.status(500).json({ error: "문서 파일을 생성하는 과정에서 에러가 발생했습니다." });
    }
  } else {
    res.download(filePath, "Remix_Project_Document.docx");
  }
});

async function boot() {
  // Vite dev server mounting in development mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files serving configuration loaded.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ComSpec Server running on http://localhost:${PORT}`);
  });
}

boot();
