/**
 * 기상청 단기예보 API 서비스 (TypeScript)
 * API 문서: 기상청41_단기예보 조회서비스 OpenAPI 활용가이드
 */

import type {
  WeatherAPIResponse,
  UltraSrtNcst,
  UltraSrtFcst,
  VilageFcst,
  GetUltraSrtNcstParams,
  GetUltraSrtFcstParams,
  GetVilageFcstParams,
  ParsedWeatherData,
} from '../types/weatherAPI.types';

import { WEATHER_CATEGORY, SKY_CODE, PTY_CODE } from '../types/weatherAPI.types';

// API 기본 설정
interface WeatherAPIConfig {
  BASE_URL: string;
  SERVICE_KEY: string;
  DEFAULT_PARAMS: {
    dataType: string;
    numOfRows: number;
    pageNo: number;
  };
}

const API_CONFIG: WeatherAPIConfig = {
  BASE_URL: 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0',
  SERVICE_KEY: import.meta.env.VITE_API_KEY,
  DEFAULT_PARAMS: {
    dataType: 'JSON',
    numOfRows: 1000,
    pageNo: 1,
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
): Promise<WeatherAPIResponse<T>['response']['body']> => {
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

    const data: WeatherAPIResponse<T> = await response.json();

    // API 응답 에러 체크
    if (data.response?.header?.resultCode !== '00') {
      throw new Error(data.response?.header?.resultMsg || 'Weather API Error');
    }

    return data.response.body;
  } catch (error) {
    console.error('Weather API Request Error:', error);
    throw error;
  }
};

/**
 * 1. 초단기실황 조회 (매시각 정시 발표, 10분 이후 호출)
 */
export const getUltraSrtNcst = async (
  params: GetUltraSrtNcstParams
): Promise<WeatherAPIResponse<UltraSrtNcst>['response']['body']> => {
  return apiRequest<UltraSrtNcst>('getUltraSrtNcst', params);
};

/**
 * 2. 초단기예보 조회 (매시각 30분 발표, 45분 이후 호출)
 */
export const getUltraSrtFcst = async (
  params: GetUltraSrtFcstParams
): Promise<WeatherAPIResponse<UltraSrtFcst>['response']['body']> => {
  return apiRequest<UltraSrtFcst>('getUltraSrtFcst', params);
};

/**
 * 3. 단기예보 조회 (하루 8회 발표)
 */
export const getVilageFcst = async (
  params: GetVilageFcstParams
): Promise<WeatherAPIResponse<VilageFcst>['response']['body']> => {
  return apiRequest<VilageFcst>('getVilageFcst', params);
};

/**
 * 유틸리티: 서비스키 설정
 */
export const setWeatherServiceKey = (serviceKey: string): void => {
  API_CONFIG.SERVICE_KEY = serviceKey;
};

/**
 * 유틸리티: 현재 시각의 발표시각 계산 (초단기실황용)
 */
export const getBaseTimeForNcst = (): { baseDate: string; baseTime: string } => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');

  return {
    baseDate: `${year}${month}${day}`,
    baseTime: `${hour}00`,
  };
};

/**
 * 유틸리티: 현재 시각의 발표시각 계산 (초단기예보용)
 */
export const getBaseTimeForFcst = (): { baseDate: string; baseTime: string } => {
  const now = new Date();
  const minutes = now.getMinutes();

  // 45분 이전이면 이전 시간의 30분 발표시각 사용
  if (minutes < 45) {
    now.setHours(now.getHours() - 1);
  }

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');

  return {
    baseDate: `${year}${month}${day}`,
    baseTime: `${hour}30`,
  };
};

/**
 * 유틸리티: 현재 시각의 발표시각 계산 (단기예보용)
 */
export const getBaseTimeForVilage = (): { baseDate: string; baseTime: string } => {
  const now = new Date();
  const hour = now.getHours();

  // 발표시각: 02, 05, 08, 11, 14, 17, 20, 23시
  // 각 발표 후 10분 후부터 조회 가능
  const baseTimes = ['0200', '0500', '0800', '1100', '1400', '1700', '2000', '2300'];
  const baseHours = [2, 5, 8, 11, 14, 17, 20, 23];

  let selectedBaseTime = baseTimes[0];

  for (let i = baseHours.length - 1; i >= 0; i--) {
    if (hour >= baseHours[i]) {
      selectedBaseTime = baseTimes[i];
      break;
    }
  }

  // 만약 현재 시각이 02:10 이전이면 전날 23시 발표 사용
  if (hour < 2 || (hour === 2 && now.getMinutes() < 10)) {
    now.setDate(now.getDate() - 1);
    selectedBaseTime = '2300';
  }

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return {
    baseDate: `${year}${month}${day}`,
    baseTime: selectedBaseTime,
  };
};

/**
 * 유틸리티: 위경도를 격자 좌표로 변환
 * Lambert Conformal Conic Projection 사용
 */
export const convertToGrid = (latitude: number, longitude: number): { nx: number; ny: number } => {
  const RE = 6371.00877; // 지구 반경 (km)
  const GRID = 5.0; // 격자 간격 (km)
  const SLAT1 = 30.0; // 표준위도 1
  const SLAT2 = 60.0; // 표준위도 2
  const OLON = 126.0; // 기준점 경도
  const OLAT = 38.0; // 기준점 위도
  const XO = 43; // 기준점 X좌표 (210/5)
  const YO = 136; // 기준점 Y좌표 (675/5)

  const DEGRAD = Math.PI / 180.0;
  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + latitude * DEGRAD * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);
  let theta = longitude * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  const x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  const y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

  return { nx: x, ny: y };
};

/**
 * 유틸리티: 날씨 데이터 파싱
 */
export const parseWeatherData = (items: UltraSrtNcst[] | UltraSrtFcst[] | VilageFcst[]): ParsedWeatherData => {
  const result: ParsedWeatherData = {};

  const itemList = Array.isArray(items) ? items : [items];

  itemList.forEach((item) => {
    const value = 'obsrValue' in item ? item.obsrValue : item.fcstValue;

    switch (item.category) {
      case WEATHER_CATEGORY.T1H:
      case WEATHER_CATEGORY.TMP:
        result.temperature = parseFloat(value);
        break;
      case WEATHER_CATEGORY.REH:
        result.humidity = parseFloat(value);
        break;
      case WEATHER_CATEGORY.RN1:
      case WEATHER_CATEGORY.PCP:
        result.precipitation = value;
        break;
      case WEATHER_CATEGORY.PTY:
        result.precipitationType = getPtyDescription(value);
        break;
      case WEATHER_CATEGORY.SKY:
        result.skyCondition = getSkyDescription(value);
        break;
      case WEATHER_CATEGORY.WSD:
        result.windSpeed = parseFloat(value);
        break;
      case WEATHER_CATEGORY.VEC:
        result.windDirection = parseFloat(value);
        break;
      case WEATHER_CATEGORY.POP:
        result.precipitationProbability = parseFloat(value);
        break;
    }
  });

  return result;
};

/**
 * 유틸리티: 하늘 상태 설명
 */
export const getSkyDescription = (code: string): string => {
  switch (code) {
    case SKY_CODE.CLEAR:
      return '맑음';
    case SKY_CODE.PARTLY_CLOUDY:
      return '구름많음';
    case SKY_CODE.CLOUDY:
      return '흐림';
    default:
      return '알 수 없음';
  }
};

/**
 * 유틸리티: 강수 형태 설명
 */
export const getPtyDescription = (code: string): string => {
  switch (code) {
    case PTY_CODE.NONE:
      return '없음';
    case PTY_CODE.RAIN:
      return '비';
    case PTY_CODE.RAIN_SNOW:
      return '비/눈';
    case PTY_CODE.SNOW:
      return '눈';
    case PTY_CODE.SHOWER:
      return '소나기';
    case PTY_CODE.RAINDROP:
      return '빗방울';
    case PTY_CODE.RAINDROP_SNOW:
      return '빗방울눈날림';
    case PTY_CODE.SNOW_FLURRY:
      return '눈날림';
    default:
      return '알 수 없음';
  }
};

// Export constants
export { WEATHER_CATEGORY, SKY_CODE, PTY_CODE };
