import { useState, useEffect, useCallback } from 'react';
import * as tourAPI from '../api/tourAPI';
import type {
  TouristSpot,
  Festival,
  DetailCommon,
  ImageInfo,
  AreaCode,
  CategoryCode,
  UseAPIResult,
  UseSearchResult,
  AreaBasedListParams,
  LocationBasedListParams,
  SearchFestivalParams,
  APIResponse,
} from '../types/tourAPI.types';
import { CONTENT_TYPE, ARRANGE, type ContentType, type AreaCodeType } from '../types/tourAPI.types';

/**
 * 지역기반 관광정보 조회 Hook
 */
export const useAreaBasedList = (
  params?: AreaBasedListParams,
  autoFetch: boolean = true
): UseAPIResult<TouristSpot> & { refetch: () => Promise<void> } => {
  const [data, setData] = useState<APIResponse<TouristSpot>['response']['body'] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!params?.areaCode && autoFetch) return;

    setLoading(true);
    setError(null);

    try {
      const result = await tourAPI.getAreaBasedList(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [params, autoFetch]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * 위치기반 관광정보 조회 Hook
 */
export const useLocationBasedList = (
  params?: LocationBasedListParams,
  autoFetch: boolean = true
): UseAPIResult<TouristSpot> & { refetch: () => Promise<void> } => {
  const [data, setData] = useState<APIResponse<TouristSpot>['response']['body'] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if ((!params?.mapX || !params?.mapY) && autoFetch) return;

    setLoading(true);
    setError(null);

    try {
      const result = await tourAPI.getLocationBasedList(params!);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [params, autoFetch]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * 키워드 검색 Hook
 */
export const useKeywordSearch = (
  keyword?: string,
  additionalParams: Omit<AreaBasedListParams, 'keyword'> = {}
): UseSearchResult<TouristSpot> => {
  const [data, setData] = useState<APIResponse<TouristSpot>['response']['body'] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (searchKeyword?: string) => {
      const keywordToSearch = searchKeyword || keyword;

      if (!keywordToSearch) return;

      setLoading(true);
      setError(null);

      try {
        const result = await tourAPI.searchKeyword({
          keyword: keywordToSearch,
          ...additionalParams,
        });
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    },
    [keyword, additionalParams]
  );

  useEffect(() => {
    if (keyword) {
      search(keyword);
    }
  }, [keyword, search]);

  return { data, loading, error, search };
};

/**
 * 행사정보 조회 Hook
 */
export const useFestivalList = (
  params?: SearchFestivalParams,
  autoFetch: boolean = true
): UseAPIResult<Festival> & { refetch: () => Promise<void> } => {
  const [data, setData] = useState<APIResponse<Festival>['response']['body'] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!params?.eventStartDate && autoFetch) return;

    setLoading(true);
    setError(null);

    try {
      const result = await tourAPI.searchFestival(params!);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [params, autoFetch]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * 상세정보 조회 Hook (공통정보 + 소개정보 + 이미지정보)
 */
interface TouristSpotDetailData {
  common: APIResponse<DetailCommon>['response']['body'] | null;
  intro: APIResponse<any>['response']['body'] | null;
  images: APIResponse<ImageInfo>['response']['body'] | null;
}

export const useTouristSpotDetail = (
  contentId?: string,
  contentTypeId?: string
): UseAPIResult<TouristSpotDetailData> => {
  const [data, setData] = useState<TouristSpotDetailData>({
    common: null,
    intro: null,
    images: null,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contentId || !contentTypeId) return;

    const fetchAllDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const [commonData, introData, imagesData] = await Promise.all([
          tourAPI.getDetailCommon({ contentId, contentTypeId }),
          tourAPI.getDetailIntro({ contentId, contentTypeId }),
          tourAPI.getDetailImage({ contentId }),
        ]);

        setData({
          common: commonData,
          intro: introData,
          images: imagesData,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAllDetails();
  }, [contentId, contentTypeId]);

  return { data: data as any, loading, error };
};

/**
 * 인기 관광지 조회 Hook (대표이미지 있는 것만, 수정일순)
 */
export const usePopularTouristSpots = (
  areaCode?: AreaCodeType | string,
  count: number = 10
): UseAPIResult<TouristSpot> => {
  const [data, setData] = useState<APIResponse<TouristSpot>['response']['body'] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await tourAPI.getAreaBasedList({
          areaCode,
          contentTypeId: CONTENT_TYPE.TOURIST_SPOT,
          arrange: ARRANGE.MODIFIED_IMAGE,
          numOfRows: count,
          pageNo: 1,
        });
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (areaCode) {
      fetchData();
    }
  }, [areaCode, count]);

  return { data, loading, error };
};

/**
 * 지역코드 목록 조회 Hook
 */
export const useAreaCodes = (): UseAPIResult<AreaCode> => {
  const [data, setData] = useState<APIResponse<AreaCode>['response']['body'] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await tourAPI.getAreaCode();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

/**
 * 카테고리 코드 조회 Hook
 */
export const useCategoryCodes = (
  contentTypeId?: ContentType,
  cat1?: string,
  cat2?: string
): UseAPIResult<CategoryCode> => {
  const [data, setData] = useState<APIResponse<CategoryCode>['response']['body'] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await tourAPI.getCategoryCode({
          contentTypeId,
          cat1,
          cat2,
        });
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [contentTypeId, cat1, cat2]);

  return { data, loading, error };
};

/**
 * 진행중인 축제 조회 Hook (현재 날짜 기준)
 */
export const useOngoingFestivals = (areaCode?: string | null, daysRange: number = 30): UseAPIResult<Festival> => {
  const [data, setData] = useState<APIResponse<Festival>['response']['body'] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const dateRange = tourAPI.getDateRange(daysRange);
        const result = await tourAPI.searchFestival({
          eventStartDate: dateRange.start,
          eventEndDate: dateRange.end,
          ...(areaCode && { areaCode }),
          arrange: ARRANGE.MODIFIED_IMAGE,
          numOfRows: 20,
        });
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [areaCode, daysRange]);

  return { data, loading, error };
};

/**
 * 다중 지역 관광지 조회 Hook
 */
export const useMultipleAreaTouristSpots = (
  areaCodes: (AreaCodeType | string)[] = [],
  contentTypeId?: ContentType
): {
  data: Record<string, APIResponse<TouristSpot>['response']['body']>;
  loading: boolean;
  error: string | null;
} => {
  const [data, setData] = useState<Record<string, APIResponse<TouristSpot>['response']['body']>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (areaCodes.length === 0) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const results = await Promise.all(
          areaCodes.map((areaCode) =>
            tourAPI.getAreaBasedList({
              areaCode,
              contentTypeId,
              arrange: ARRANGE.MODIFIED_IMAGE,
              numOfRows: 5,
            })
          )
        );

        const dataMap: Record<string, APIResponse<TouristSpot>['response']['body']> = {};
        areaCodes.forEach((areaCode, index) => {
          dataMap[areaCode] = results[index];
        });

        setData(dataMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [areaCodes.join(','), contentTypeId]);

  return { data, loading, error };
};
