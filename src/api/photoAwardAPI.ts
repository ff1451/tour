/**
 * 한국관광공사 관광공모전(사진) 수상작 API 서비스 (TypeScript)
 * TourAPI 4.0 - PhokoAwrdService
 */

import type {
  PhotoAwardAPIResponse,
  PhotoAwardItem,
  PhotoAwardSyncItem,
  RegionCode,
  PhotoAwardListParams,
  PhotoAwardSyncListParams,
  RegionCodeParams,
  ParsedPhotoAward,
} from '../types/photoAwardAPI.types';

// ============================================
// API 기본 설정
// ============================================

interface APIConfig {
  BASE_URL: string;
  SERVICE_KEY: string;
  DEFAULT_PARAMS: {
    MobileOS: string;
    MobileApp: string;
    _type: string;
  };
}

const API_CONFIG: APIConfig = {
  BASE_URL: 'https://apis.data.go.kr/B551011/PhokoAwrdService',
  SERVICE_KEY: import.meta.env.VITE_API_KEY,
  DEFAULT_PARAMS: {
    MobileOS: 'ETC',
    MobileApp: 'TravelWeb',
    _type: 'json',
  },
};

// ============================================
// Helper 함수
// ============================================

/**
 * URL 파라미터 생성 헬퍼
 */
const buildQueryString = (params: Record<string, any>): string => {
  return Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');
};

/**
 * API 요청 헬퍼
 */
const apiRequest = async <T>(
  endpoint: string,
  params: Record<string, any> = {}
): Promise<PhotoAwardAPIResponse<T>['response']['body']> => {
  const queryParams = {
    ...API_CONFIG.DEFAULT_PARAMS,
    serviceKey: API_CONFIG.SERVICE_KEY,
    ...params,
  };

  const url = `${API_CONFIG.BASE_URL}/${endpoint}?${buildQueryString(queryParams)}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: PhotoAwardAPIResponse<T> = await response.json();

    // API 응답 에러 체크
    if (data.response?.header?.resultCode !== '0000') {
      throw new Error(data.response?.header?.resultMsg || 'API Error');
    }

    return data.response.body;
  } catch (error) {
    console.error(`Photo Award API Request Error (${endpoint}):`, error);
    throw error;
  }
};

// ============================================
// 날짜/문자열 파싱 유틸리티
// ============================================

/**
 * 날짜 파싱: YYYYMMDDHHmmss → Date
 */
const parseDateTime = (dateStr: string): Date => {
  if (!dateStr || dateStr.length < 8) return new Date();
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  const hour = dateStr.substring(8, 10) || '00';
  const minute = dateStr.substring(10, 12) || '00';
  const second = dateStr.substring(12, 14) || '00';
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
};

/**
 * 촬영일 포맷: YYYYMM → YYYY년 MM월
 */
const formatFilmDate = (filmDay: string): string => {
  if (!filmDay || filmDay.length !== 6) return filmDay;
  const year = filmDay.substring(0, 4);
  const month = filmDay.substring(4, 6);
  return `${year}년 ${month}월`;
};

/**
 * 수상작 정보 파싱
 * 예: "스마트폰 부문 [입선]" → { category: "스마트폰 부문", rank: "입선" }
 */
const parseAward = (koWnprzDiz: string): { category: string; rank: string } => {
  const match = koWnprzDiz.match(/(.+?)\s*\[(.+?)\]/);
  if (match) {
    return {
      category: match[1].trim(),
      rank: match[2].trim(),
    };
  }
  return {
    category: koWnprzDiz,
    rank: '',
  };
};

// ============================================
// API 호출 함수
// ============================================

/**
 * 1. 법정동 코드 조회
 * @endpoint /ldongCode
 * @description 전국 시도 코드 정보 조회 (17개 시도)
 */
export const fetchRegionCodes = async (params: Partial<RegionCodeParams> = {}): Promise<RegionCode[]> => {
  const body = await apiRequest<RegionCode>('ldongCode', {
    numOfRows: 20,
    pageNo: 1,
    ...params,
  });

  // API 응답이 단일 객체일 수도 있으므로 배열로 정규화
  const items = body.items?.item;
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
};

/**
 * 2. 관광공모전(사진) 수상작 정보 목록 조회
 * @endpoint /phokoAwrdList
 * @description 키워드, 지역별 수상작 검색 및 조회
 */
export const fetchPhotoAwardList = async (params: Partial<PhotoAwardListParams> = {}): Promise<PhotoAwardItem[]> => {
  const body = await apiRequest<PhotoAwardItem>('phokoAwrdList', {
    numOfRows: 10,
    pageNo: 1,
    arrange: 'C', // 수정일순 (최신순)
    ...params,
  });

  // API 응답이 단일 객체일 수도 있으므로 배열로 정규화
  const items = body.items?.item;
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
};

/**
 * 3. 관광공모전(사진) 수상작 정보 동기화 목록 조회
 * @endpoint /phokoAwrdSyncList
 * @description 표출 여부를 포함한 수상작 목록 조회
 */
export const fetchPhotoAwardSyncList = async (
  params: Partial<PhotoAwardSyncListParams> = {}
): Promise<PhotoAwardSyncItem[]> => {
  const body = await apiRequest<PhotoAwardSyncItem>('phokoAwrdSyncList', {
    numOfRows: 10,
    pageNo: 1,
    arrange: 'C',
    showflag: '1', // 기본값: 표출
    ...params,
  });

  // API 응답이 단일 객체일 수도 있으므로 배열로 정규화
  const items = body.items?.item;
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
};

// ============================================
// 데이터 파싱 함수
// ============================================

/**
 * API 응답을 UI용 데이터로 변환
 */
export const parsePhotoAwardItem = (item: PhotoAwardItem): ParsedPhotoAward => {
  const { category, rank } = parseAward(item.koWnprzDiz);

  return {
    id: item.contentId,
    title: item.koTitle,
    englishTitle: item.enTitle,
    location: item.koFilmst,
    englishLocation: item.enFilmst,
    regionCode: item.lDongRegnCd,
    photographer: item.koCmanNm,
    award: item.koWnprzDiz,
    awardCategory: category,
    awardRank: rank,
    keywords: item.koKeyWord
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k),
    filmDate: formatFilmDate(item.filmDay),
    image: item.orgImage,
    thumbnail: item.thumbImage,
    registeredAt: parseDateTime(item.regDt),
    modifiedAt: parseDateTime(item.mdfcnDt),
  };
};

// ============================================
// 고수준 API 함수 (편의 함수)
// ============================================

/**
 * 키워드로 검색
 */
export const searchPhotoAwards = async (
  keyword: string,
  options: Partial<PhotoAwardListParams> = {}
): Promise<ParsedPhotoAward[]> => {
  if (!keyword || !keyword.trim()) {
    throw new Error('keyword is required');
  }

  const items = await fetchPhotoAwardList({
    keyword,
    ...options,
  });
  return items.map(parsePhotoAwardItem);
};

/**
 * 지역별 수상작 조회
 */
export const fetchPhotoAwardsByRegion = async (
  regionCode: string,
  options: Partial<PhotoAwardListParams> = {}
): Promise<ParsedPhotoAward[]> => {
  if (!regionCode) {
    throw new Error('regionCode is required');
  }

  const items = await fetchPhotoAwardList({
    lDongRegnCd: regionCode,
    ...options,
  });
  return items.map(parsePhotoAwardItem);
};

/**
 * 최신 수상작 조회
 */
export const fetchLatestPhotoAwards = async (count: number = 10): Promise<ParsedPhotoAward[]> => {
  const items = await fetchPhotoAwardList({
    numOfRows: count,
    arrange: 'C', // 수정일순
  });
  return items.map(parsePhotoAwardItem);
};

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 유틸리티: 서비스키 설정
 */
export const setPhotoAwardServiceKey = (serviceKey: string): void => {
  API_CONFIG.SERVICE_KEY = serviceKey;
};

/**
 * Export API config for external use
 */
export const getAPIConfig = (): Readonly<APIConfig> => ({ ...API_CONFIG });
