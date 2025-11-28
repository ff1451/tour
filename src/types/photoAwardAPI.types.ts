/**
 * 한국관광공사 관광공모전(사진) 수상작 API 타입 정의
 * API 문서: TourAPI 4.0 - PhokoAwrdService
 */

// ============================================
// API 응답 공통 타입
// ============================================

export interface PhotoAwardAPIResponse<T> {
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

// ============================================
// 법정동 코드 관련 타입
// ============================================

export interface RegionCode {
  rnum: number;
  lDongRegnCd: string; // 법정동 시도 코드
  lDongRegnNm: string; // 법정동 시도명
}

// ============================================
// 관광공모전 수상작 관련 타입
// ============================================

export interface PhotoAwardItem {
  contentId: string; // 콘텐츠 ID
  koTitle: string; // 콘텐츠명(국문)
  enTitle: string; // 콘텐츠명(영문)
  lDongRegnCd: string; // 법정동 시도 코드
  koFilmst: string; // 촬영 장소(국문)
  enFilmst: string; // 촬영 장소(영문)
  filmDay: string; // 촬영 연월 (YYYYMM)
  koCmanNm: string; // 촬영자(국문)
  enCmanNm: string; // 촬영자(영문)
  koWnprzDiz: string; // 수상작(국문) - 예: "스마트폰 부문 [입선]"
  enWnprzDiz: string; // 수상작(영문) - 예: "Mobile [Honorary Mention]"
  koKeyWord: string; // 키워드(국문) - API 응답 필드명 대문자 W
  enKeyWord: string; // 키워드(영문) - API 응답 필드명 대문자 W
  orgImage: string; // 원본 대표 이미지 URL
  thumbImage: string; // 썸네일 대표 이미지 URL
  cpyrhtDivCd: string; // 이미지 저작권 유형 (예: "Type1")
  regDt: string; // 콘텐츠 최초 등록일 (YYYYMMDDHHmmss)
  mdfcnDt: string; // 콘텐츠 수정일 (YYYYMMDDHHmmss)
}

export interface PhotoAwardSyncItem extends PhotoAwardItem {
  showflag: string; // 콘텐츠 표출 여부 (1=표출, 0=비표출)
}

// ============================================
// API 요청 파라미터 타입
// ============================================

export interface PhotoAwardListParams {
  numOfRows?: number; // 한 페이지 결과 수 (기본: 10)
  pageNo?: number; // 페이지 번호 (기본: 1)
  MobileOS: string; // OS 구분 (IOS/AND/WIN/ETC)
  MobileApp: string; // 서비스명=어플명
  serviceKey: string; // 인증키 (URL-Encode)
  _type?: string; // 응답 메시지 형식 (json/xml)
  arrange?: 'A' | 'C' | 'D' | 'O' | 'Q' | 'R'; // 정렬 구분
  mdfcnDt?: string; // 수정일 (YYMMDD)
  lDongRegnCd?: string; // 법정동 시도 코드
  keyword?: string; // 검색 키워드 (국문=인코딩필요)
}

export interface PhotoAwardSyncListParams extends PhotoAwardListParams {
  showflag?: string; // 표출 여부 (1=표출, 0=비표출)
}

export interface RegionCodeParams {
  numOfRows?: number;
  pageNo?: number;
  MobileOS: string;
  MobileApp: string;
  serviceKey: string;
  _type?: string;
}

// ============================================
// 정렬 옵션 상수
// ============================================

export const ARRANGE_TYPE = {
  TITLE: 'A', // 제목순
  MODIFIED: 'C', // 수정일순 (최신순)
  CREATED: 'D', // 생성일순
  TITLE_WITH_IMAGE: 'O', // 대표이미지 포함 제목순
  MODIFIED_WITH_IMAGE: 'Q', // 대표이미지 포함 수정일순
  CREATED_WITH_IMAGE: 'R', // 대표이미지 포함 생성일순
} as const;

// ============================================
// 파싱된 데이터 타입 (UI용)
// ============================================

export interface ParsedPhotoAward {
  id: string;
  title: string;
  englishTitle: string;
  location: string;
  englishLocation: string;
  regionCode: string;
  photographer: string;
  award: string; // 예: "스마트폰 부문 [입선]"
  awardCategory: string; // 예: "스마트폰 부문"
  awardRank: string; // 예: "입선"
  keywords: string[];
  filmDate: string; // 촬영일 (YYYY년 MM월)
  image: string;
  thumbnail: string;
  registeredAt: Date;
  modifiedAt: Date;
}
