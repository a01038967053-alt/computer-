export type ComponentCategory = 'CPU' | 'GPU' | 'RAM' | 'SSD' | 'CASE' | 'PSU' | 'COOLER';

export interface ComponentSpec {
  id: string;
  name: string;
  category: ComponentCategory;
  brand: string; // relaxed to support other hardware brands
  price: number; // in KRW (Korean Won)
  cores?: number; // CPU only
  threads?: number; // CPU only
  baseClock?: number; // GHz for CPU, MHz for GPU, optional for other parts
  boostClock?: number; // GHz for CPU, MHz for GPU, optional for other parts
  tdp?: number; // Watts, optional for cases/SSDs
  socketOrInterface?: string; // e.g. LGA1700, AM5, PCIe 4.0, DDR5, M.2, etc.
  releaseYear: number;
  processNode?: string; // e.g. 5nm, 10nm, Intel 7, optional for cases/RAM/PSUs
  cacheOrMemory?: string; // e.g. L3 Cache, VRAM, RAM capacity, SSD cache
  scoreSingle?: number; // CPU Single, GPU TimeSpy, RAM latency score, SSD Read, Case fan count, PSU Rated power, Cooler fan count
  scoreMulti?: number; // CPU Multi, GPU FireStrike, RAM Bandwidth, SSD Write, Case max GPU length, PSU 12V output, Cooler Max TDP
  imageUrl?: string;

  // Custom fields for detail comparison
  memoryType?: string; // DDR4, DDR5 (RAM)
  timing?: string; // CL30, CL46, etc (RAM)
  capacity?: string; // 16GB, 1TB, etc (RAM, SSD)
  ssdType?: string; // NVMe M.2, SATA3 (SSD)
  nvmeGeneration?: string; // Gen4, Gen5 (SSD)
  tbw?: number; // Terabytes Written (SSD)
  caseSize?: string; // Middle Tower, Mini-ITX (Case)
  maxGpuLength?: number; // mm (Case)
  maxCpuCoolerHeight?: number; // mm (Case)
  psuEfficiency?: string; // Gold, Bronze, etc (PSU)
  psuModularType?: string; // Full-Modular, Non-Modular (PSU)
  ratedPower?: number; // Watts (PSU)

  // Cooler specific fields
  coolerType?: string; // 공랭 (Air), 수랭 (Liquid)
  fanSize?: string; // e.g. 120mm, 140mm
  fanCount?: number; // e.g. 1, 2, 3
  noiseLevel?: string; // e.g. Max 25.6 dBA
  radiatorSize?: string; // e.g. 360mm, 240mm, N/A
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  recommendedParts?: Array<{ id: string; reason: string }>;
  suggestedComparisons?: Array<{ leftId: string; rightId: string; category: string; label: string }>;
}

