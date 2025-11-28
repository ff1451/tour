// API 설정 파일
// 실제 사용 시 환경변수로 관리하세요

// 공공데이터포털 API 키 (모든 API에서 동일하게 사용)
export const API_KEY = import.meta.env.VITE_API_KEY;

// API 설정
interface TourAPIConfig {
  BASE_URL: string;
  SERVICE_KEY: string;
  MOBILE_OS: string;
  MOBILE_APP: string;
}

interface WeatherAPIConfig {
  BASE_URL: string;
  SERVICE_KEY: string;
}

interface PhotoAwardAPIConfig {
  BASE_URL: string;
  SERVICE_KEY: string;
}

interface Config {
  TOUR_API: TourAPIConfig;
  WEATHER_API: WeatherAPIConfig;
  PHOTO_AWARD_API: PhotoAwardAPIConfig;
}

export const API_CONFIG: Config = {
  TOUR_API: {
    BASE_URL: 'https://apis.data.go.kr/B551011/KorService2',
    SERVICE_KEY: API_KEY,
    MOBILE_OS: 'ETC',
    MOBILE_APP: 'TravelWeb',
  },
  WEATHER_API: {
    BASE_URL: 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0',
    SERVICE_KEY: API_KEY,
  },
  PHOTO_AWARD_API: {
    BASE_URL: 'https://apis.data.go.kr/B551011/PhokoAwrdService',
    SERVICE_KEY: API_KEY,
  },
};
