/**
 * 여행지 상세 페이지 타입 정의
 */

// 여행지 상세 정보
export interface DestinationDetail {
  contentId: string;
  contentTypeId: string;
  title: string;
  address: string;
  addressDetail?: string;
  tel?: string;
  homepage?: string;
  overview?: string;
  mainImage?: string;
  thumbnailImage?: string;
  mapX?: string;
  mapY?: string;
}

// 소개 정보
export interface IntroInfo {
  usetime?: string;
  restdate?: string;
  parking?: string;
  infocenter?: string;
  chkcreditcard?: string;
  chkpet?: string;
}

// 이미지 정보
export interface ImageItem {
  imageUrl: string;
  thumbnailUrl?: string;
}

// 주변 관광지
export interface NearbyPlace {
  contentId: string;
  title: string;
  address: string;
  image?: string;
  distance?: number;
}
