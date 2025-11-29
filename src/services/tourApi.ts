import axios from 'axios';
import type {
  TourItem,
  Festival,
  Accommodation,
  AreaCode,
  CategoryCode,
  TourAPIResponse,
  SearchParams,
  LocationSearchParams,
  FestivalSearchParams,
  AccommodationSearchParams,
  AreaBasedSearchParams,
} from './types';

const BASE_URL = 'http://apis.data.go.kr/B551011/KorService2';
const SERVICE_KEY = import.meta.env.VITE_TOUR_API_KEY;

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// 공통 파라미터
const getCommonParams = () => ({
  serviceKey: decodeURIComponent(SERVICE_KEY),
  MobileOS: 'ETC',
  MobileApp: 'KoreaTravel',
  _type: 'json',
});

export const tourApi = {
  /**
   * 지역코드 조회
   */
  getAreaCode: async (areaCode?: string): Promise<AreaCode[]> => {
    try {
      const response = await api.get('/areaCode2', {
        params: {
          ...getCommonParams(),
          numOfRows: 20,
          pageNo: 1,
          areaCode,
        },
      });
      return response.data.response.body.items.item || [];
    } catch (error) {
      console.error('지역코드 조회 실패:', error);
      return [];
    }
  },

  /**
   * 서비스 분류코드 조회
   */
  getCategoryCode: async (contentTypeId?: string, cat1?: string, cat2?: string): Promise<CategoryCode[]> => {
    try {
      const response = await api.get('/categoryCode2', {
        params: {
          ...getCommonParams(),
          numOfRows: 100,
          pageNo: 1,
          contentTypeId,
          cat1,
          cat2,
        },
      });
      return response.data.response.body.items.item || [];
    } catch (error) {
      console.error('분류코드 조회 실패:', error);
      return [];
    }
  },

  /**
   * 지역기반 관광정보 조회
   */
  getAreaBasedList: async (params: AreaBasedSearchParams): Promise<TourItem[]> => {
    try {
      const response = await api.get('/areaBasedList2', {
        params: {
          ...getCommonParams(),
          numOfRows: params.numOfRows || 12,
          pageNo: params.pageNo || 1,
          arrange: params.arrange || 'O', // O: 제목순
          ...params,
        },
      });
      return response.data.response.body.items.item || [];
    } catch (error) {
      console.error('지역기반 관광정보 조회 실패:', error);
      return [];
    }
  },

  /**
   * 위치기반 관광정보 조회
   */
  getLocationBasedList: async (params: LocationSearchParams): Promise<TourItem[]> => {
    try {
      const response = await api.get('/locationBasedList2', {
        params: {
          ...getCommonParams(),
          numOfRows: params.numOfRows || 12,
          pageNo: params.pageNo || 1,
          radius: params.radius || '10000', // 10km
          ...params,
        },
      });
      return response.data.response.body.items.item || [];
    } catch (error) {
      console.error('위치기반 관광정보 조회 실패:', error);
      return [];
    }
  },

  /**
   * 키워드 검색
   */
  searchKeyword: async (params: SearchParams): Promise<TourItem[]> => {
    try {
      const response = await api.get('/searchKeyword2', {
        params: {
          ...getCommonParams(),
          numOfRows: params.numOfRows || 12,
          pageNo: params.pageNo || 1,
          arrange: 'O',
          ...params,
        },
      });
      return response.data.response.body.items.item || [];
    } catch (error) {
      console.error('키워드 검색 실패:', error);
      return [];
    }
  },

  /**
   * 행사정보 조회
   */
  searchFestival: async (params: FestivalSearchParams): Promise<Festival[]> => {
    try {
      const response = await api.get('/searchFestival2', {
        params: {
          ...getCommonParams(),
          numOfRows: params.numOfRows || 12,
          pageNo: params.pageNo || 1,
          arrange: 'O',
          ...params,
        },
      });
      return response.data.response.body.items.item || [];
    } catch (error) {
      console.error('행사정보 조회 실패:', error);
      return [];
    }
  },

  /**
   * 숙박정보 조회
   */
  searchStay: async (params: AccommodationSearchParams): Promise<Accommodation[]> => {
    try {
      const response = await api.get('/searchStay2', {
        params: {
          ...getCommonParams(),
          numOfRows: params.numOfRows || 12,
          pageNo: params.pageNo || 1,
          arrange: 'O',
          ...params,
        },
      });
      return response.data.response.body.items.item || [];
    } catch (error) {
      console.error('숙박정보 조회 실패:', error);
      return [];
    }
  },

  /**
   * 공통정보 조회 (상세정보1)
   */
  getDetailCommon: async (contentId: string, contentTypeId?: string): Promise<any> => {
    try {
      const params: any = {
        ...getCommonParams(),
        contentId,
      };

      // contentTypeId가 있으면 추가
      if (contentTypeId) {
        params.contentTypeId = contentTypeId;
      }

      console.log('detailCommon2 요청:', { contentId, params });
      const response = await api.get('/detailCommon2', { params });
      console.log('detailCommon2 응답:', response.data);

      const item = response.data.response?.body?.items?.item;
      if (!item) {
        console.warn('detailCommon2: 아이템이 없습니다');
        return null;
      }

      return Array.isArray(item) ? item[0] : item;
    } catch (error: any) {
      console.error('공통정보 조회 실패:', {
        contentId,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return null;
    }
  },

  /**
   * 소개정보 조회 (상세정보2)
   */
  getDetailIntro: async (contentId: string, contentTypeId: string): Promise<any> => {
    try {
      console.log('detailIntro2 요청:', { contentId, contentTypeId });
      const response = await api.get('/detailIntro2', {
        params: {
          ...getCommonParams(),
          contentId,
          contentTypeId,
        },
      });
      console.log('detailIntro2 응답:', response.data);

      const item = response.data.response.body.items?.item;
      if (!item) {
        console.warn('detailIntro2: 아이템이 없습니다');
        return null;
      }

      return Array.isArray(item) ? item[0] : item;
    } catch (error: any) {
      console.error('소개정보 조회 실패:', {
        contentId,
        contentTypeId,
        error: error.message,
        response: error.response?.data,
      });
      return null;
    }
  },

  /**
   * 반복정보 조회 (상세정보3)
   */
  getDetailInfo: async (contentId: string, contentTypeId: string): Promise<any[]> => {
    try {
      const response = await api.get('/detailInfo2', {
        params: {
          ...getCommonParams(),
          contentId,
          contentTypeId,
        },
      });
      return response.data.response.body.items.item || [];
    } catch (error) {
      console.error('반복정보 조회 실패:', error);
      return [];
    }
  },

  /**
   * 이미지정보 조회 (상세정보4)
   */
  getDetailImage: async (contentId: string): Promise<any[]> => {
    try {
      console.log('detailImage2 요청:', { contentId });
      const response = await api.get('/detailImage2', {
        params: {
          ...getCommonParams(),
          contentId,
          imageYN: 'Y',
        },
      });
      console.log('detailImage2 응답:', response.data);

      const items = response.data.response.body.items?.item;
      if (!items) {
        console.warn('detailImage2: 이미지가 없습니다');
        return [];
      }

      return Array.isArray(items) ? items : [items];
    } catch (error: any) {
      console.error('이미지정보 조회 실패:', {
        contentId,
        error: error.message,
        response: error.response?.data,
      });
      return [];
    }
  },

  /**
   * 반려동물 동반여행 정보 조회
   */
  getPetTourInfo: async (contentId: string): Promise<any> => {
    try {
      const response = await api.get('/detailPetTour2', {
        params: {
          ...getCommonParams(),
          contentId,
        },
      });
      return response.data.response.body.items.item[0] || null;
    } catch (error) {
      console.error('반려동물 정보 조회 실패:', error);
      return null;
    }
  },

  /**
   * 전체 상세정보 조회 (공통 + 소개 + 이미지)
   */
  getFullDetail: async (contentId: string, contentTypeId: string) => {
    try {
      const [common, intro, images] = await Promise.all([
        tourApi.getDetailCommon(contentId, contentTypeId),
        tourApi.getDetailIntro(contentId, contentTypeId),
        tourApi.getDetailImage(contentId),
      ]);

      return {
        common,
        intro,
        images,
      };
    } catch (error) {
      console.error('상세정보 조회 실패:', error);
      return null;
    }
  },
};

export default tourApi;
