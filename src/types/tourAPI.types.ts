// 한국관광공사 TourAPI 타입 정의

/**
 * API 응답 공통 구조
 */
export interface APIResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
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
 * 관광지 정보
 */
export interface TouristSpot {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1: string;
  addr2?: string;
  firstimage?: string;
  firstimage2?: string;
  areacode?: string;
  sigungucode?: string;
  cat1?: string;
  cat2?: string;
  cat3?: string;
  mapx?: string;
  mapy?: string;
  mlevel?: string;
  tel?: string;
  zipcode?: string;
  homepage?: string;
  overview?: string;
  createdtime: string;
  modifiedtime: string;
  cpyrhtDivCd?: string;
  booktour?: string;
}

/**
 * 축제 정보
 */
export interface Festival extends TouristSpot {
  eventstartdate: string;
  eventenddate: string;
  eventplace?: string;
  playtime?: string;
  sponsor1?: string;
  sponsor2?: string;
  agelimit?: string;
  bookingplace?: string;
  placeinfo?: string;
  subevent?: string;
  program?: string;
  usetimefestival?: string;
  discountinfofestival?: string;
  spendtimefestival?: string;
  sponsor1tel?: string;
  sponsor2tel?: string;
}

/**
 * 상세 공통 정보
 */
export interface DetailCommon extends TouristSpot {
  homepage?: string;
  overview?: string;
  telname?: string;
}

/**
 * 상세 소개 정보 (관광지)
 */
export interface DetailIntroTouristSpot {
  contentid: string;
  contenttypeid: string;
  accomcount?: string;
  chkbabycarriage?: string;
  chkcreditcard?: string;
  chkpet?: string;
  expagerange?: string;
  expguide?: string;
  heritage1?: string;
  heritage2?: string;
  heritage3?: string;
  infocenter?: string;
  opendate?: string;
  parking?: string;
  restdate?: string;
  useseason?: string;
  usetime?: string;
}

/**
 * 이미지 정보
 */
export interface ImageInfo {
  contentid: string;
  originimgurl: string;
  smallimageurl: string;
  cpyrhtDivCd?: string;
  serialnum?: string;
}

/**
 * 지역 코드
 */
export interface AreaCode {
  code: string;
  name: string;
  rnum: number;
}

/**
 * 카테고리 코드
 */
export interface CategoryCode {
  code: string;
  name: string;
  rnum: number;
}

/**
 * API 요청 파라미터 - 지역기반 관광정보
 */
export interface AreaBasedListParams {
  numOfRows?: number;
  pageNo?: number;
  arrange?: string;
  contentTypeId?: string;
  areaCode?: string;
  sigunguCode?: string;
  cat1?: string;
  cat2?: string;
  cat3?: string;
  modifiedtime?: string;
}

/**
 * API 요청 파라미터 - 위치기반 관광정보
 */
export interface LocationBasedListParams {
  numOfRows?: number;
  pageNo?: number;
  arrange?: string;
  contentTypeId?: string;
  mapX: number | string;
  mapY: number | string;
  radius?: number;
}

/**
 * API 요청 파라미터 - 키워드 검색
 */
export interface SearchKeywordParams {
  numOfRows?: number;
  pageNo?: number;
  arrange?: string;
  contentTypeId?: string;
  areaCode?: string;
  sigunguCode?: string;
  cat1?: string;
  cat2?: string;
  cat3?: string;
  keyword: string;
}

/**
 * API 요청 파라미터 - 축제 검색
 */
export interface SearchFestivalParams {
  numOfRows?: number;
  pageNo?: number;
  arrange?: string;
  eventStartDate: string;
  eventEndDate?: string;
  areaCode?: string;
  sigunguCode?: string;
}

/**
 * API 요청 파라미터 - 공통정보 조회
 */
export interface DetailCommonParams {
  contentId: string;
  contentTypeId: string;
  defaultYN?: string;
  firstImageYN?: string;
  areacodeYN?: string;
  addrinfoYN?: string;
  mapinfoYN?: string;
  overviewYN?: string;
}

/**
 * API 요청 파라미터 - 소개정보 조회
 */
export interface DetailIntroParams {
  contentId: string;
  contentTypeId: string;
}

/**
 * API 요청 파라미터 - 이미지정보 조회
 */
export interface DetailImageParams {
  contentId: string;
  imageYN?: string;
  subImageYN?: string;
  numOfRows?: number;
  pageNo?: number;
}

/**
 * API 요청 파라미터 - 지역코드 조회
 */
export interface AreaCodeParams {
  areaCode?: string;
  numOfRows?: number;
  pageNo?: number;
}

/**
 * API 요청 파라미터 - 분류코드 조회
 */
export interface CategoryCodeParams {
  contentTypeId?: string;
  cat1?: string;
  cat2?: string;
  cat3?: string;
  numOfRows?: number;
  pageNo?: number;
}

/**
 * 콘텐츠 타입 상수
 */
export const CONTENT_TYPE = {
  TOURIST_SPOT: '12',
  CULTURE: '14',
  FESTIVAL: '15',
  TRAVEL_COURSE: '25',
  LEPORTS: '28',
  ACCOMMODATION: '32',
  SHOPPING: '38',
  RESTAURANT: '39',
} as const;

export type ContentType = (typeof CONTENT_TYPE)[keyof typeof CONTENT_TYPE];

/**
 * 지역 코드 상수
 */
export const AREA_CODE = {
  SEOUL: '1',
  INCHEON: '2',
  DAEJEON: '3',
  DAEGU: '4',
  GWANGJU: '5',
  BUSAN: '6',
  ULSAN: '7',
  SEJONG: '8',
  GYEONGGI: '31',
  GANGWON: '32',
  CHUNGBUK: '33',
  CHUNGNAM: '34',
  GYEONGBUK: '35',
  GYEONGNAM: '36',
  JEONBUK: '37',
  JEONNAM: '38',
  JEJU: '39',
} as const;

export type AreaCodeType = (typeof AREA_CODE)[keyof typeof AREA_CODE];

/**
 * 정렬 방식 상수
 */
export const ARRANGE = {
  TITLE: 'A',
  MODIFIED: 'C',
  CREATED: 'D',
  TITLE_IMAGE: 'O',
  MODIFIED_IMAGE: 'Q',
  CREATED_IMAGE: 'R',
} as const;

export type ArrangeType = (typeof ARRANGE)[keyof typeof ARRANGE];

/**
 * Hook 반환 타입
 */
export interface UseAPIResult<T> {
  data: APIResponse<T>['response']['body'] | null;
  loading: boolean;
  error: string | null;
  refetch?: () => Promise<void>;
}

/**
 * 검색 Hook 반환 타입
 */
export interface UseSearchResult<T> extends UseAPIResult<T> {
  search: (keyword: string) => Promise<void>;
}
