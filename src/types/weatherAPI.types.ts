// 기상청 단기예보 API 타입 정의

/**
 * 기상청 API 응답 공통 구조
 */
export interface WeatherAPIResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      dataType: string;
      items: {
        item: T | T[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

/**
 * 초단기실황 데이터
 */
export interface UltraSrtNcst {
  baseDate: string; // 발표일자 (YYYYMMDD)
  baseTime: string; // 발표시각 (HHmm)
  category: string; // 자료구분코드
  nx: string; // 예보지점 X좌표
  ny: string; // 예보지점 Y좌표
  obsrValue: string; // 실황 값
}

/**
 * 초단기예보 데이터
 */
export interface UltraSrtFcst {
  baseDate: string; // 발표일자 (YYYYMMDD)
  baseTime: string; // 발표시각 (HHmm)
  category: string; // 자료구분코드
  fcstDate: string; // 예측일자 (YYYYMMDD)
  fcstTime: string; // 예측시간 (HHmm)
  fcstValue: string; // 예보 값
  nx: string; // 예보지점 X좌표
  ny: string; // 예보지점 Y좌표
}

/**
 * 단기예보 데이터
 */
export interface VilageFcst {
  baseDate: string; // 발표일자 (YYYYMMDD)
  baseTime: string; // 발표시각 (HHmm)
  category: string; // 자료구분문자
  fcstDate: string; // 예보일자 (YYYYMMDD)
  fcstTime: string; // 예보시각 (HHmm)
  fcstValue: string; // 예보 값
  nx: string; // 예보지점 X좌표
  ny: string; // 예보지점 Y좌표
}

/**
 * 격자 좌표 정보
 */
export interface GridCoordinate {
  area1: string; // 1단계 (시/도)
  area2?: string; // 2단계 (구/군)
  area3?: string; // 3단계 (동/읍/면)
  nx: number; // 격자 X
  ny: number; // 격자 Y
  longitude: number; // 경도
  latitude: number; // 위도
}

/**
 * 초단기실황 요청 파라미터
 */
export interface GetUltraSrtNcstParams {
  numOfRows?: number;
  pageNo?: number;
  dataType?: 'XML' | 'JSON';
  base_date: string; // YYYYMMDD
  base_time: string; // HHmm
  nx: number;
  ny: number;
}

/**
 * 초단기예보 요청 파라미터
 */
export interface GetUltraSrtFcstParams {
  numOfRows?: number;
  pageNo?: number;
  dataType?: 'XML' | 'JSON';
  base_date: string; // YYYYMMDD
  base_time: string; // HHmm (30분 단위)
  nx: number;
  ny: number;
}

/**
 * 단기예보 요청 파라미터
 */
export interface GetVilageFcstParams {
  numOfRows?: number;
  pageNo?: number;
  dataType?: 'XML' | 'JSON';
  base_date: string; // YYYYMMDD
  base_time: string; // 0200, 0500, 0800, 1100, 1400, 1700, 2000, 2300
  nx: number;
  ny: number;
}

/**
 * 날씨 카테고리 코드
 */
export const WEATHER_CATEGORY = {
  // 초단기실황
  T1H: 'T1H', // 기온
  RN1: 'RN1', // 1시간 강수량
  UUU: 'UUU', // 동서바람성분
  VVV: 'VVV', // 남북바람성분
  REH: 'REH', // 습도
  PTY: 'PTY', // 강수형태
  VEC: 'VEC', // 풍향
  WSD: 'WSD', // 풍속

  // 초단기예보 추가
  SKY: 'SKY', // 하늘상태
  LGT: 'LGT', // 낙뢰

  // 단기예보 추가
  POP: 'POP', // 강수확률
  PCP: 'PCP', // 1시간 강수량
  SNO: 'SNO', // 1시간 신적설
  TMP: 'TMP', // 1시간 기온
  TMN: 'TMN', // 일 최저기온
  TMX: 'TMX', // 일 최고기온
  WAV: 'WAV', // 파고
} as const;

export type WeatherCategory = (typeof WEATHER_CATEGORY)[keyof typeof WEATHER_CATEGORY];

/**
 * 하늘 상태 코드
 */
export const SKY_CODE = {
  CLEAR: '1', // 맑음
  PARTLY_CLOUDY: '3', // 구름많음
  CLOUDY: '4', // 흐림
} as const;

/**
 * 강수 형태 코드
 */
export const PTY_CODE = {
  NONE: '0', // 없음
  RAIN: '1', // 비
  RAIN_SNOW: '2', // 비/눈
  SNOW: '3', // 눈
  SHOWER: '4', // 소나기 (단기예보만)
  RAINDROP: '5', // 빗방울 (초단기만)
  RAINDROP_SNOW: '6', // 빗방울눈날림 (초단기만)
  SNOW_FLURRY: '7', // 눈날림 (초단기만)
} as const;

/**
 * 날씨 데이터 파싱 결과
 */
export interface ParsedWeatherData {
  temperature?: number; // 기온 (℃)
  humidity?: number; // 습도 (%)
  precipitation?: string; // 강수량
  precipitationType?: string; // 강수형태
  skyCondition?: string; // 하늘상태
  windSpeed?: number; // 풍속 (m/s)
  windDirection?: number; // 풍향 (deg)
  precipitationProbability?: number; // 강수확률 (%)
}

/**
 * 위치 정보로 날씨 조회 파라미터
 */
export interface WeatherByLocationParams {
  latitude: number;
  longitude: number;
  forecastType?: 'ultra-short' | 'short';
}

/**
 * Hook 반환 타입
 */
export interface UseWeatherResult<T> {
  data: WeatherAPIResponse<T>['response']['body'] | null;
  loading: boolean;
  error: string | null;
  refetch?: () => Promise<void>;
}
