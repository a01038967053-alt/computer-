import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from "docx";
import * as fs from "fs";
import * as path from "path";

export function createProjectDocument(): Document {
  return new Document({
    sections: [
      {
        properties: {},
        children: [
          // 1. 프로젝트 제목 (Title Section)
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
            children: [
              new TextRun({
                text: "Remix 컴퓨터 부품 비교기 & 스마트 견적 플랫폼",
                bold: true,
                size: 56, // 28pt
                color: "1E3A8A", // Deep Navy Blue
                font: "Malgun Gothic"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 800 },
            children: [
              new TextRun({
                text: "실시간 다채널 가격 비교 분석 및 맞춤 조립 PC 견적서 빌더 서비스",
                italics: true,
                size: 28, // 14pt
                color: "4B5563", // Gray
                font: "Malgun Gothic"
              })
            ]
          }),

          // Divider Line
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
            children: [
              new TextRun({
                text: "_________________________________________________________________________________",
                color: "E5E7EB",
                font: "Malgun Gothic"
              })
            ]
          }),

          // 2. 팀 빌딩 (Team Building Section)
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            children: [
              new TextRun({
                text: "1. 팀 구성 및 역할 분담 (Team Building)",
                bold: true,
                size: 36, // 18pt
                color: "1E3A8A",
                font: "Malgun Gothic"
              })
            ]
          }),

          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    shading: { fill: "F3F4F6" },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "역할 / 직책", bold: true, color: "111827", font: "Malgun Gothic" })]
                      })
                    ]
                  }),
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    shading: { fill: "F3F4F6" },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "성명", bold: true, color: "111827", font: "Malgun Gothic" })]
                      })
                    ]
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { fill: "F3F4F6" },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "상세 기획 및 개발 담당 업무", bold: true, color: "111827", font: "Malgun Gothic" })]
                      })
                    ]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "PM / 서비스 기획", bold: true, color: "1E3A8A", font: "Malgun Gothic" })]
                      })
                    ]
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "홍길동", font: "Malgun Gothic" })]
                      })
                    ]
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: "• 서비스 기획서 설계 및 요구사양 구체화\n", font: "Malgun Gothic" }),
                          new TextRun({ text: "• 조립 PC 구매자 여정(User Journey) 정의\n", font: "Malgun Gothic" }),
                          new TextRun({ text: "• 다채널 이커머스 최저가 연동 비즈니스 가이드 수립", font: "Malgun Gothic" })
                        ]
                      })
                    ]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "Full-Stack Developer", bold: true, color: "1E3A8A", font: "Malgun Gothic" })]
                      })
                    ]
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "이몽룡", font: "Malgun Gothic" })]
                      })
                    ]
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: "• React 18 & Vite 기반 고해상도 다크 UI 컴포넌트 구현\n", font: "Malgun Gothic" }),
                          new TextRun({ text: "• Express 실시간 프록시 최저가 수집 및 30s TTL 메모리 캐시 엔진 개발\n", font: "Malgun Gothic" }),
                          new TextRun({ text: "• Recharts 활용 최근 4주 부품 시세 변동 트렌드 시각화\n", font: "Malgun Gothic" }),
                          new TextRun({ text: "• 컴퓨존 실제 검색 파라미터(SearchProductKey) 동적 매핑 딥링크 연동", font: "Malgun Gothic" })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          }),

          // 3. 프로젝트 기획 의도
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            children: [
              new TextRun({
                text: "2. 프로젝트 기획 의도 (Project Intent)",
                bold: true,
                size: 36,
                color: "1E3A8A",
                font: "Malgun Gothic"
              })
            ]
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "소비자가 본인 용도에 딱 알맞은 컴퓨터 부품을 선택하고 조립 PC를 안전하게 구매하기까지는 대단히 높은 정보 검색 피로도가 동반됩니다. 당사는 이를 해결하고자 다음과 같은 핵심 가치를 제공하는 조립 PC 스마트 플랫폼을 개발하였습니다.",
                font: "Malgun Gothic"
              })
            ]
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({ text: "1) 분산된 유통 채널 정보의 통합 일원화", bold: true, color: "111827", font: "Malgun Gothic" })
            ]
          }),
          new Paragraph({
            indent: { left: 360 },
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "다나와, 네이버 쇼핑, 쿠팡, 컴퓨존 등 다양한 하드웨어 온라인 전문몰의 최저가 정보와 무료배송 여부, 당일 배송 혜택 등의 물류 정보를 단 하나의 화면에서 원스톱으로 비교 분석하도록 일원화하였습니다.",
                font: "Malgun Gothic"
              })
            ]
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({ text: "2) 합리적 소비 시기 가이드 제공", bold: true, color: "111827", font: "Malgun Gothic" })
            ]
          }),
          new Paragraph({
            indent: { left: 360 },
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "단순히 당장의 최저가를 보여주는 것을 넘어 최근 4주간의 가격 변동 추이 선형 그래프를 Recharts 시각화하여, 소비자가 해당 부품을 '지금 구매하는 것이 기회비용 측면에서 이득인가'를 합리적으로 판별하게 해 줍니다.",
                font: "Malgun Gothic"
              })
            ]
          }),

          // 4. 전체 아키텍처
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            children: [
              new TextRun({
                text: "3. 전체 아키텍처 (Architecture)",
                bold: true,
                size: 36,
                color: "1E3A8A",
                font: "Malgun Gothic"
              })
            ]
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({ text: "■ 메뉴 구성 (Information Architecture)", bold: true, color: "111827", font: "Malgun Gothic" })
            ]
          }),
          new Paragraph({
            indent: { left: 360 },
            spacing: { after: 150 },
            children: [
              new TextRun({ text: "• 메인 홈 대시보드: ", bold: true, font: "Malgun Gothic" }),
              new TextRun({ text: "실시간 대시보드 큐레이션, 인기 부품 대조 매치업 배너, 하드웨어 분석 핵심 가이드라인 제공\n", font: "Malgun Gothic" }),
              new TextRun({ text: "• 실시간 1:1 정밀 대조 비교기: ", bold: true, font: "Malgun Gothic" }),
              new TextRun({ text: "두 가지 부품의 사양 스펙을 교차 대조하고 공인 스코어 및 소비전력, 가격 대비 메리트를 수치화\n", font: "Malgun Gothic" }),
              new TextRun({ text: "• 내 견적 빌더 (My Estimate): ", bold: true, font: "Malgun Gothic" }),
              new TextRun({ text: "원하는 부품을 카테고리별로 장바구니에 담아 실시간 정격 소비전력 합산 계산 및 통합 견적 가격 합산 산출", font: "Malgun Gothic" })
            ]
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({ text: "■ 데이터 흐름 (Data Flow)", bold: true, color: "111827", font: "Malgun Gothic" })
            ]
          }),
          new Paragraph({
            indent: { left: 360 },
            spacing: { after: 150 },
            children: [
              new TextRun({ text: "1. Client UI 요청: ", bold: true, font: "Malgun Gothic" }),
              new TextRun({ text: "사용자가 특정 부품의 실시간 '최저가 비교' 클릭 시 비동기 GET /api/prices 트리거\n", font: "Malgun Gothic" }),
              new TextRun({ text: "2. API Proxy 가동: ", bold: true, font: "Malgun Gothic" }),
              new TextRun({ text: "CORS 보안 정책을 우회하기 위하여 Express 백엔드에서 다나와/네이버/쿠팡으로 병렬 비동기 실시간 조회 수행 (1.2s Timeout 안전 마진 설정)\n", font: "Malgun Gothic" }),
              new TextRun({ text: "3. TTL 30s 메모리 캐싱: ", bold: true, font: "Malgun Gothic" }),
              new TextRun({ text: "과도한 상용 사이트 트래픽 요청을 방지하기 위해 30초 내 동일 부품의 요청은 캐싱 데이터 즉시 서빙\n", font: "Malgun Gothic" }),
              new TextRun({ text: "4. 보안 정책 우회 설계: ", bold: true, font: "Malgun Gothic" }),
              new TextRun({ text: "자동화 스크립트 수집이 완전히 차단된 컴퓨존(Compuzone)의 경우, 보안 에러가 유발되지 않도록 '시뮬레이션 기반 스마트 시세 가격 가이드라인'으로 동적 안전 fallback 서빙", font: "Malgun Gothic" })
            ]
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({ text: "■ 작업 흐름 (Work Flow)", bold: true, color: "111827", font: "Malgun Gothic" })
            ]
          }),
          new Paragraph({
            indent: { left: 360 },
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "사용자 유입 -> CPU/GPU 등 부품 검색 및 대조군 설정 -> 1:1 스펙 정밀 강점 진단서 확인 -> '실시간 가격비교' 오픈 -> 쇼핑몰 클릭 시 실제 정상 파라미터가 인코딩 포함된 검색 딥링크 URL(SearchProductKey)로 새 탭 랜딩 -> 조립 견적서 실시간 최종 수집 및 견적 저장.",
                font: "Malgun Gothic"
              })
            ]
          }),

          // 5. 사용 코딩 도구
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            children: [
              new TextRun({
                text: "4. 사용 코딩 도구 (GenAI Tools)",
                bold: true,
                size: 36,
                color: "1E3A8A",
                font: "Malgun Gothic"
              })
            ]
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "본 프로젝트는 인프라 구축, 프론트엔드 반응형 디자인, 복잡한 비동기 백엔드 API 설계 등 설계 전반에서 Google AI Studio의 고성능 대형 언어 모델(Gemini 3.5 Flash 및 Gemini 3.5 Pro) 기반의 에이전트 코딩 어시스턴트를 주 도구로 사용하여 개발 생산성을 극대화하였습니다.",
                font: "Malgun Gothic"
              })
            ]
          }),

          // 6. 사용 프롬프트 예시
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            children: [
              new TextRun({
                text: "5. 사용 프롬프트 예시 (GenAI Prompts)",
                bold: true,
                size: 36,
                color: "1E3A8A",
                font: "Malgun Gothic"
              })
            ]
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({ text: "■ 프롬프트 사례 1: 크롤링 타임아웃 및 TTL 캐싱 프록시 구현", bold: true, color: "111827", font: "Malgun Gothic" })
            ]
          }),
          new Paragraph({
            indent: { left: 360 },
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: `"Express 서버단에서 각 쇼핑몰 최저가를 병렬 패치하려는데, 특정 채널이 지연되어 응답 전체가 느려지는 것을 방지하고 싶어. 각 채널별로 최대 1.2초 타임아웃을 걸어두고, 이미 수집한 가격 데이터는 동일 사용자 혹은 타 사용자가 연속 클릭했을 때 즉시 응답하도록 TTL 30초짜리 인메모리 캐시를 적용하는 프록시 코드를 TypeScript로 빌드해 줘."`,
                italics: true,
                color: "4B5563",
                font: "Malgun Gothic"
              })
            ]
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({ text: "■ 프롬프트 사례 2: 컴퓨존 검색창 URL 파라미터 정밀 분석 대응", bold: true, color: "111827", font: "Malgun Gothic" })
            ]
          }),
          new Paragraph({
            indent: { left: 360 },
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: `"컴퓨존 검색 딥링크 클릭 시 검색창이 빈 상태로 열려. 실제 브라우저 주소창 주소를 대조 분석해 보니 SearchProductKey 파라미터를 사용하네! 임의로 q나 query 파라미터를 생성하지 말고, URLSearchParams를 생성해 SearchProductKey 파라미터에만 안전하게 인코딩된 상품명 문자열을 세팅해서 새 탭으로 여는 방식으로 버튼 핸들러를 수정해 줘."`,
                italics: true,
                color: "4B5563",
                font: "Malgun Gothic"
              })
            ]
          }),

          // 7. 기술 스택
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            children: [
              new TextRun({
                text: "6. 기술 스택 (Technology Stack)",
                bold: true,
                size: 36,
                color: "1E3A8A",
                font: "Malgun Gothic"
              })
            ]
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    shading: { fill: "F3F4F6" },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "구분", bold: true, font: "Malgun Gothic" })] })]
                  }),
                  new TableCell({
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    shading: { fill: "F3F4F6" },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "사용 기술 및 프레임워크", bold: true, font: "Malgun Gothic" })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "프론트엔드 (Frontend)", bold: true, font: "Malgun Gothic" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "React 18, Vite, Tailwind CSS, Lucide React, Recharts (시세동향 시각화), Motion (인터랙션 애니메이션)", font: "Malgun Gothic" })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "백엔드 (Backend)", bold: true, font: "Malgun Gothic" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Node.js, Express 4, TypeScript, Tsx Execution, Esbuild 번들링", font: "Malgun Gothic" })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "빌드 / 배포", bold: true, font: "Malgun Gothic" })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Cloud Run (풀스택 도커 컨테이너 구동), Vercel (정적 애셋 호스팅)", font: "Malgun Gothic" })] })] })
                ]
              })
            ]
          }),

          // 8. 최종 결과물 MVP
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            children: [
              new TextRun({
                text: "7. 최종 결과물 MVP (Minimum Viable Product)",
                bold: true,
                size: 36,
                color: "1E3A8A",
                font: "Malgun Gothic"
              })
            ]
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "• MVP 실 배포 주소 (예시): ",
                bold: true,
                font: "Malgun Gothic"
              }),
              new TextRun({
                text: "https://remix-pc-compare.vercel.app",
                color: "2563EB",
                underline: {},
                font: "Malgun Gothic"
              })
            ]
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "• 핵심 기능 요약: 다크 스모크 프리미엄 테마 적용, Recharts 4주 실시간 시세 그래프 완비, 카테고리별 부품 1:1 대조 및 지능형 가성비/스펙 판독 엔진, 원클릭 온라인 장바구니 PC 견적서 빌더 탑재.",
                font: "Malgun Gothic"
              })
            ]
          }),

          // 9. 프로젝트 소감 (PMI)
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            children: [
              new TextRun({
                text: "8. 프로젝트 소감 (PMI 개인별 성찰)",
                bold: true,
                size: 36,
                color: "1E3A8A",
                font: "Malgun Gothic"
              })
            ]
          }),

          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({ text: "■ 기획 / PM (홍길동 소감)", bold: true, color: "111827", font: "Malgun Gothic" })
            ]
          }),
          new Paragraph({
            indent: { left: 360 },
            spacing: { after: 150 },
            children: [
              new TextRun({ text: "• Plus: ", bold: true, color: "10B981", font: "Malgun Gothic" }),
              new TextRun({ text: "Generative AI를 기획 고도화에 적극 접목하여, 단 3일만에 훌륭한 UI 컨셉과 실시간 최저가 연동 비즈니스 가이드를 상세 구축했습니다.\n", font: "Malgun Gothic" }),
              new TextRun({ text: "• Minus: ", bold: true, color: "EF4444", font: "Malgun Gothic" }),
              new TextRun({ text: "실 상용 이커머스의 까다로운 크롤링 원천 차단 방어벽을 실시간 완벽히 파싱하는 데 구조적 어려움이 있었습니다.\n", font: "Malgun Gothic" }),
              new TextRun({ text: "• Interest: ", bold: true, color: "3B82F6", font: "Malgun Gothic" }),
              new TextRun({ text: "크롤링 차단 시 단순 에러를 유발하는 대신 스마트 기준가 Fallback(우회) 가격 책정 기법을 적용하여 예외 상황에서도 완벽한 사용자 만족도를 창출하는 설계를 도출한 점이 매우 유익했습니다.", font: "Malgun Gothic" })
            ]
          }),

          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({ text: "■ Full-Stack Developer (이몽룡 소감)", bold: true, color: "111827", font: "Malgun Gothic" })
            ]
          }),
          new Paragraph({
            indent: { left: 360 },
            spacing: { after: 200 },
            children: [
              new TextRun({ text: "• Plus: ", bold: true, color: "10B981", font: "Malgun Gothic" }),
              new TextRun({ text: "실시간 컴퓨존 검색 URL of 딥링크 파라미터(SearchProductKey)를 정밀 매핑하여 완벽히 일치하는 랜딩 결과를 원클릭으로 열 수 있게 오류를 시원하게 격파하여 보람찼습니다.\n", font: "Malgun Gothic" }),
              new TextRun({ text: "• Minus: ", bold: true, color: "EF4444", font: "Malgun Gothic" }),
              new TextRun({ text: "비동기 병렬 최저가 프록시 가동 시 TTL 캐시 갱신주기 불일치로 일시적인 정합성 검증 에러가 발생해 디버깅하는 데 다소 고전했습니다.\n", font: "Malgun Gothic" }),
              new TextRun({ text: "• Interest: ", bold: true, color: "3B82F6", font: "Malgun Gothic" }),
              new TextRun({ text: "프론트엔드 URLSearchParams 인코딩 방식과 백엔드의 인메모리 캐시 TTL을 밀결합하여 대규모 트래픽 지연을 최소화하는 고가용성 풀스택 아키텍처 구현 과정이 무척 흥미롭고 보람찼습니다.", font: "Malgun Gothic" })
            ]
          })
        ]
      }
    ]
  });
}

// Check if run directly
if (process.argv[1] && process.argv[1].endsWith("generate_docs.ts")) {
  const doc = createProjectDocument();
  Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync(path.join(process.cwd(), "PROJECT_DOCUMENT.docx"), buffer);
    console.log("PROJECT_DOCUMENT.docx generated successfully at project root!");
  }).catch((err) => {
    console.error("Failed to generate DOCX file:", err);
  });
}
