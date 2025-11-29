// 관광 콘텐츠 타입
export const ContentType = {
  TOURIST_SPOT: '12', // 관광지
  CULTURAL_FACILITY: '14', // 문화시설
  FESTIVAL: '15', // 행사/공연/축제
  TRAVEL_COURSE: '25', // 여행코스
  LEISURE_SPORTS: '28', // 레포츠
  ACCOMMODATION: '32', // 숙박
  SHOPPING: '38', // 쇼핑
  RESTAURANT: '39', // 음식점
} as const;

export type ContentType = (typeof ContentType)[keyof typeof ContentType];

// 기본 관광 정보 인터페이스
export interface TourItem {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1: string;
  addr2?: string;
  areacode: string;
  booktour?: string;
  cat1: string;
  cat2: string;
  cat3: string;
  createdtime: string;
  firstimage?: string;
  firstimage2?: string;
  cpyrhtDivCd?: string;
  mapx: string;
  mapy: string;
  mlevel: string;
  modifiedtime: string;
  sigungucode: string;
  tel?: string;
  zipcode?: string;
}

// 상세 공통 정보
export interface DetailCommon extends TourItem {
  homepage?: string;
  overview?: string;
  telname?: string;
}

// 행사 정보
export interface Festival extends TourItem {
  eventstartdate: string;
  eventenddate: string;
}

// 숙박 정보
export interface Accommodation extends TourItem {
  benikia?: string;
  goodstay?: string;
  hanok?: string;
}

// 지역 코드
export interface AreaCode {
  code: string;
  name: string;
  rnum: number;
}

// 카테고리 코드
export interface CategoryCode {
  code: string;
  name: string;
  rnum: number;
}

// API 응답 구조
export interface TourAPIResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: T[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

// 여행 계획
export interface TripPlan {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  thumbnail?: string;
  days: TripDay[];
  createdAt: string;
  updatedAt: string;
}

export interface TripDay {
  date: string;
  places: TripPlace[];
}

export interface TripPlace {
  id: string;
  contentId: string;
  contentTypeId: string;
  title: string;
  address: string;
  image?: string;
  mapx: string;
  mapy: string;
  memo?: string;
  visitTime?: string;
  order: number;
}

// 검색 파라미터
export interface SearchParams {
  keyword?: string;
  contentTypeId?: string;
  areaCode?: string;
  sigunguCode?: string;
  pageNo?: number;
  numOfRows?: number;
  arrange?: 'A' | 'B' | 'C' | 'D' | 'E' | 'O' | 'P' | 'Q' | 'R';
}

// 위치 기반 검색 파라미터
export interface LocationSearchParams {
  mapX: string;
  mapY: string;
  radius?: string;
  contentTypeId?: string;
  pageNo?: number;
  numOfRows?: number;
}

// 축제 검색 파라미터
export interface FestivalSearchParams {
  eventStartDate?: string;
  eventEndDate?: string;
  areaCode?: string;
  sigunguCode?: string;
  numOfRows?: number;
  pageNo?: number;
  arrange?: 'A' | 'B' | 'C' | 'D' | 'E' | 'O' | 'P' | 'Q' | 'R';
}

// 숙박 검색 파라미터
export interface AccommodationSearchParams {
  areaCode?: string;
  sigunguCode?: string;
  numOfRows?: number;
  pageNo?: number;
  arrange?: 'A' | 'B' | 'C' | 'D' | 'E' | 'O' | 'P' | 'Q' | 'R';
}

// 지역기반 검색 파라미터
export interface AreaBasedSearchParams {
  areaCode?: string;
  sigunguCode?: string;
  contentTypeId?: string;
  cat1?: string;
  cat2?: string;
  cat3?: string;
  numOfRows?: number;
  pageNo?: number;
  arrange?: 'A' | 'B' | 'C' | 'D' | 'E' | 'O' | 'P' | 'Q' | 'R';
}

// 즐겨찾기
export interface Favorite {
  id: string;
  contentId: string;
  contentTypeId: string;
  title: string;
  image?: string;
  address: string;
  addedAt: string;
}

// 사용자 설정
export interface UserPreferences {
  favoriteRegions: string[];
  interests: string[];
  petFriendly: boolean;
  theme: 'light' | 'dark';
  language: 'ko' | 'en' | 'ja' | 'zh';
}
