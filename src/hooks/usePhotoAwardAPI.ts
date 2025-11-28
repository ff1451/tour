/**
 * 관광공모전(사진) 수상작 API React Hooks
 */

import { useState, useEffect } from 'react';
import {
  fetchRegionCodes,
  fetchPhotoAwardList,
  parsePhotoAwardItem,
  searchPhotoAwards,
  fetchPhotoAwardsByRegion,
  fetchLatestPhotoAwards,
} from '../api/photoAwardAPI';
import type { RegionCode, PhotoAwardListParams, ParsedPhotoAward } from '../types/photoAwardAPI.types';

// ============================================
// Hook 공통 반환 타입
// ============================================

interface UsePhotoAwardResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

// ============================================
// 1. 법정동 코드 조회 Hook
// ============================================

export const useRegionCodes = (): UsePhotoAwardResult<RegionCode[]> => {
  const [data, setData] = useState<RegionCode[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchRegionCodes();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};

// ============================================
// 2. 관광공모전 수상작 목록 조회 Hook
// ============================================

export const usePhotoAwardList = (params?: Partial<PhotoAwardListParams>): UsePhotoAwardResult<ParsedPhotoAward[]> => {
  const [data, setData] = useState<ParsedPhotoAward[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await fetchPhotoAwardList(params);
      const parsed = items.map(parsePhotoAwardItem);
      setData(parsed);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(params)]);

  return { data, loading, error, refetch: fetchData };
};

// ============================================
// 3. 최신 수상작 조회 Hook
// ============================================

export const useLatestPhotoAwards = (count: number = 10): UsePhotoAwardResult<ParsedPhotoAward[]> => {
  const [data, setData] = useState<ParsedPhotoAward[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchLatestPhotoAwards(count);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [count]);

  return { data, loading, error, refetch: fetchData };
};

// ============================================
// 4. 키워드 검색 Hook
// ============================================

export const usePhotoAwardSearch = (
  keyword: string,
  options?: Partial<PhotoAwardListParams>
): UsePhotoAwardResult<ParsedPhotoAward[]> => {
  const [data, setData] = useState<ParsedPhotoAward[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!keyword.trim()) {
      setData([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await searchPhotoAwards(keyword, options);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [keyword, JSON.stringify(options)]);

  return { data, loading, error, refetch: fetchData };
};

// ============================================
// 5. 지역별 수상작 조회 Hook
// ============================================

export const usePhotoAwardsByRegion = (
  regionCode: string,
  options?: Partial<PhotoAwardListParams>
): UsePhotoAwardResult<ParsedPhotoAward[]> => {
  const [data, setData] = useState<ParsedPhotoAward[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!regionCode) {
      setData([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await fetchPhotoAwardsByRegion(regionCode, options);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [regionCode, JSON.stringify(options)]);

  return { data, loading, error, refetch: fetchData };
};

// ============================================
// 6. 여러 지역 수상작 조회 Hook (Bulk)
// ============================================

export const useMultipleRegionPhotoAwards = (
  regionCodes: string[],
  countPerRegion: number = 5
): UsePhotoAwardResult<ParsedPhotoAward[]> => {
  const [data, setData] = useState<ParsedPhotoAward[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (regionCodes.length === 0) {
      setData([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 병렬로 모든 지역 데이터 가져오기
      const promises = regionCodes.map((code) =>
        fetchPhotoAwardsByRegion(code, {
          numOfRows: countPerRegion,
          arrange: 'C', // 최신순
        })
      );

      const results = await Promise.all(promises);

      // 모든 결과를 하나의 배열로 합치고 날짜순 정렬
      const combined = results.flat().sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime());

      setData(combined);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(regionCodes), countPerRegion]);

  return { data, loading, error, refetch: fetchData };
};

// ============================================
// 7. 특정 카테고리 수상작 필터링 Hook
// ============================================

export const usePhotoAwardsByCategory = (
  category: string, // 예: "스마트폰 부문", "디지털카메라 부문"
  count: number = 10
): UsePhotoAwardResult<ParsedPhotoAward[]> => {
  const [data, setData] = useState<ParsedPhotoAward[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 많은 데이터를 가져와서 필터링 (카테고리별 API 파라미터가 없으므로)
      const items = await fetchPhotoAwardList({
        numOfRows: count * 3, // 충분한 데이터 가져오기
        arrange: 'C',
      });

      const parsed = items.map(parsePhotoAwardItem);
      const filtered = parsed.filter((item) => item.awardCategory.includes(category)).slice(0, count);

      setData(filtered);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category, count]);

  return { data, loading, error, refetch: fetchData };
};
