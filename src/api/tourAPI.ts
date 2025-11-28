/**
 * 한국관광공사 TourAPI 4.0 서비스 (TypeScript)
 */

import { CONTENT_TYPE, AREA_CODE, ARRANGE } from '../types/tourAPI.types';
import type {
  APIResponse,
  TouristSpot,
  Festival,
  DetailCommon,
  ImageInfo,
  AreaCode,
  CategoryCode,
  AreaBasedListParams,
  LocationBasedListParams,
  SearchKeywordParams,
  SearchFestivalParams,
  DetailCommonParams,
  DetailIntroParams,
  DetailImageParams,
  AreaCodeParams,
  CategoryCodeParams,
} from '../types/tourAPI.types';

// API 기본 설정
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
  BASE_URL: 'https://apis.data.go.kr/B551011/KorService2',
  SERVICE_KEY: import.meta.env.VITE_API_KEY,
  DEFAULT_PARAMS: {
    MobileOS: 'ETC',
    MobileApp: 'TravelWeb',
    _type: 'json',
  },
};

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
): Promise<APIResponse<T>['response']['body']> => {
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

    const data: APIResponse<T> = await response.json();

    // API 응답 에러 체크
    if (data.response?.header?.resultCode !== '0000') {
      throw new Error(data.response?.header?.resultMsg || 'API Error');
    }

    return data.response.body;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

/**
 * 1. 지역기반 관광정보 조회
 */
export const getAreaBasedList = async (
  params: AreaBasedListParams = {}
): Promise<APIResponse<TouristSpot>['response']['body']> => {
  return apiRequest<TouristSpot>('areaBasedList2', {
    numOfRows: 10,
    pageNo: 1,
    arrange: ARRANGE.MODIFIED,
    ...params,
  });
};

/**
 * 2. 위치기반 관광정보 조회
 */
export const getLocationBasedList = async (
  params: LocationBasedListParams
): Promise<APIResponse<TouristSpot>['response']['body']> => {
  const { mapX, mapY } = params;

  if (!mapX || !mapY) {
    throw new Error('mapX and mapY are required');
  }

  return apiRequest<TouristSpot>('locationBasedList2', {
    numOfRows: 10,
    pageNo: 1,
    radius: 1000,
    ...params,
  });
};

/**
 * 3. 키워드 검색 조회
 */
export const searchKeyword = async (
  params: SearchKeywordParams
): Promise<APIResponse<TouristSpot>['response']['body']> => {
  const { keyword } = params;

  if (!keyword) {
    throw new Error('keyword is required');
  }

  return apiRequest<TouristSpot>('searchKeyword2', {
    numOfRows: 10,
    pageNo: 1,
    arrange: ARRANGE.MODIFIED,
    ...params,
  });
};

/**
 * 4. 행사정보 조회
 */
export const searchFestival = async (
  params: SearchFestivalParams
): Promise<APIResponse<Festival>['response']['body']> => {
  const { eventStartDate } = params;

  if (!eventStartDate) {
    throw new Error('eventStartDate is required (format: YYYYMMDD)');
  }

  return apiRequest<Festival>('searchFestival2', {
    numOfRows: 10,
    pageNo: 1,
    arrange: ARRANGE.MODIFIED,
    ...params,
  });
};

/**
 * 5. 공통정보 조회 (상세정보1)
 */
export const getDetailCommon = async (
  params: DetailCommonParams
): Promise<APIResponse<DetailCommon>['response']['body']> => {
  const { contentId, contentTypeId } = params;

  if (!contentId || !contentTypeId) {
    throw new Error('contentId and contentTypeId are required');
  }

  return apiRequest<DetailCommon>('detailCommon2', {
    defaultYN: 'Y',
    firstImageYN: 'Y',
    areacodeYN: 'Y',
    addrinfoYN: 'Y',
    mapinfoYN: 'Y',
    overviewYN: 'Y',
    ...params,
  });
};

/**
 * 6. 소개정보 조회 (상세정보2)
 */
export const getDetailIntro = async (params: DetailIntroParams): Promise<APIResponse<any>['response']['body']> => {
  const { contentId, contentTypeId } = params;

  if (!contentId || !contentTypeId) {
    throw new Error('contentId and contentTypeId are required');
  }

  return apiRequest<any>('detailIntro2', params);
};

/**
 * 7. 이미지정보 조회 (상세정보4)
 */
export const getDetailImage = async (
  params: DetailImageParams
): Promise<APIResponse<ImageInfo>['response']['body']> => {
  const { contentId } = params;

  if (!contentId) {
    throw new Error('contentId is required');
  }

  return apiRequest<ImageInfo>('detailImage2', {
    imageYN: 'Y',
    subImageYN: 'Y',
    numOfRows: 10,
    pageNo: 1,
    ...params,
  });
};

/**
 * 8. 지역코드 조회
 */
export const getAreaCode = async (params: AreaCodeParams = {}): Promise<APIResponse<AreaCode>['response']['body']> => {
  return apiRequest<AreaCode>('areaCode2', {
    numOfRows: 100,
    pageNo: 1,
    ...params,
  });
};

/**
 * 9. 서비스 분류코드 조회
 */
export const getCategoryCode = async (
  params: CategoryCodeParams = {}
): Promise<APIResponse<CategoryCode>['response']['body']> => {
  return apiRequest<CategoryCode>('categoryCode2', {
    numOfRows: 100,
    pageNo: 1,
    ...params,
  });
};

/**
 * 유틸리티: 서비스키 설정
 */
export const setServiceKey = (serviceKey: string): void => {
  API_CONFIG.SERVICE_KEY = serviceKey;
};

/**
 * 유틸리티: 현재 날짜를 YYYYMMDD 형식으로 반환
 */
export const getCurrentDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

/**
 * 유틸리티: 날짜 범위 생성 (오늘부터 N일 후까지)
 */
export const getDateRange = (days: number = 30): { start: string; end: string } => {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + days);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  return {
    start: formatDate(start),
    end: formatDate(end),
  };
};

/**
 * Export API config for external use
 */
export const getAPIConfig = (): Readonly<APIConfig> => ({ ...API_CONFIG });

// Export constants
export { CONTENT_TYPE, AREA_CODE, ARRANGE };
