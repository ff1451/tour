import { useState, useEffect, useCallback } from 'react';
import * as weatherAPI from '../api/weatherAPI';
import type {
  UltraSrtNcst,
  UltraSrtFcst,
  VilageFcst,
  WeatherAPIResponse,
  UseWeatherResult,
  ParsedWeatherData,
} from '../types/weatherAPI.types';

/**
 * 초단기실황 조회 Hook
 * 매시각 정시 발표, 10분 이후 호출 권장
 */
export const useUltraSrtNcst = (
  nx?: number,
  ny?: number,
  autoFetch: boolean = true
): UseWeatherResult<UltraSrtNcst> & { refetch: () => Promise<void> } => {
  const [data, setData] = useState<WeatherAPIResponse<UltraSrtNcst>['response']['body'] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!nx || !ny) return;

    setLoading(true);
    setError(null);

    try {
      const { baseDate, baseTime } = weatherAPI.getBaseTimeForNcst();
      const result = await weatherAPI.getUltraSrtNcst({
        base_date: baseDate,
        base_time: baseTime,
        nx,
        ny,
      });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [nx, ny]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * 초단기예보 조회 Hook
 * 매시각 30분 발표, 45분 이후 호출 권장
 */
export const useUltraSrtFcst = (
  nx?: number,
  ny?: number,
  autoFetch: boolean = true
): UseWeatherResult<UltraSrtFcst> & { refetch: () => Promise<void> } => {
  const [data, setData] = useState<WeatherAPIResponse<UltraSrtFcst>['response']['body'] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!nx || !ny) return;

    setLoading(true);
    setError(null);

    try {
      const { baseDate, baseTime } = weatherAPI.getBaseTimeForFcst();
      const result = await weatherAPI.getUltraSrtFcst({
        base_date: baseDate,
        base_time: baseTime,
        nx,
        ny,
      });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [nx, ny]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * 단기예보 조회 Hook
 * 하루 8회 발표 (02, 05, 08, 11, 14, 17, 20, 23시)
 */
export const useVilageFcst = (
  nx?: number,
  ny?: number,
  autoFetch: boolean = true
): UseWeatherResult<VilageFcst> & { refetch: () => Promise<void> } => {
  const [data, setData] = useState<WeatherAPIResponse<VilageFcst>['response']['body'] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!nx || !ny) return;

    setLoading(true);
    setError(null);

    try {
      const { baseDate, baseTime } = weatherAPI.getBaseTimeForVilage();
      const result = await weatherAPI.getVilageFcst({
        base_date: baseDate,
        base_time: baseTime,
        nx,
        ny,
      });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [nx, ny]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * 현재 날씨 조회 Hook (초단기실황 + 파싱)
 */
export const useCurrentWeather = (
  nx?: number,
  ny?: number
): {
  data: WeatherAPIResponse<UltraSrtNcst>['response']['body'] | null;
  loading: boolean;
  error: string | null;
  weatherData: ParsedWeatherData | null;
} => {
  const [weatherData, setWeatherData] = useState<ParsedWeatherData | null>(null);
  const { data, loading, error } = useUltraSrtNcst(nx, ny);

  useEffect(() => {
    if (data?.items?.item) {
      const items = data.items.item;
      const itemsList = Array.isArray(items) ? items : [items];
      const parsed = weatherAPI.parseWeatherData(itemsList);
      setWeatherData(parsed);
    }
  }, [data]);

  return { data, loading, error, weatherData };
};

/**
 * 예보 날씨 조회 Hook (초단기예보 + 파싱)
 */
export const useForecastWeather = (
  nx?: number,
  ny?: number
): {
  data: WeatherAPIResponse<UltraSrtFcst>['response']['body'] | null;
  loading: boolean;
  error: string | null;
  weatherData: ParsedWeatherData | null;
} => {
  const [weatherData, setWeatherData] = useState<ParsedWeatherData | null>(null);
  const { data, loading, error } = useUltraSrtFcst(nx, ny);

  useEffect(() => {
    if (data?.items?.item) {
      const items = data.items.item;
      const itemsList = Array.isArray(items) ? items : [items];
      const parsed = weatherAPI.parseWeatherData(itemsList);
      setWeatherData(parsed);
    }
  }, [data]);

  return { data, loading, error, weatherData };
};

/**
 * 위경도로 날씨 조회 Hook
 */
export const useWeatherByLocation = (
  latitude?: number,
  longitude?: number,
  type: 'current' | 'forecast' = 'current'
): {
  data: null;
  loading: boolean;
  error: string | null;
  weatherData: ParsedWeatherData | null;
} => {
  const [grid, setGrid] = useState<{ nx: number; ny: number } | null>(null);
  const [weatherData, setWeatherData] = useState<ParsedWeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 위경도를 격자좌표로 변환
  useEffect(() => {
    if (latitude && longitude) {
      try {
        const converted = weatherAPI.convertToGrid(latitude, longitude);
        setGrid(converted);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Grid conversion error');
      }
    }
  }, [latitude, longitude]);

  // 격자좌표로 날씨 조회
  const currentWeather = useCurrentWeather(grid?.nx, grid?.ny);
  const forecastWeather = useForecastWeather(grid?.nx, grid?.ny);

  useEffect(() => {
    if (type === 'current') {
      setWeatherData(currentWeather.weatherData);
      setLoading(currentWeather.loading);
      setError(currentWeather.error);
    } else {
      setWeatherData(forecastWeather.weatherData);
      setLoading(forecastWeather.loading);
      setError(forecastWeather.error);
    }
  }, [type, currentWeather, forecastWeather]);

  return {
    data: null,
    loading,
    error,
    weatherData,
  };
};

/**
 * 여러 지역의 날씨 조회 Hook
 */
export const useMultipleWeather = (
  locations: Array<{ nx: number; ny: number; name: string }>
): {
  data: Record<string, ParsedWeatherData>;
  loading: boolean;
  error: string | null;
} => {
  const [data, setData] = useState<Record<string, ParsedWeatherData>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (locations.length === 0) return;

    const fetchAllWeather = async () => {
      setLoading(true);
      setError(null);

      try {
        const { baseDate, baseTime } = weatherAPI.getBaseTimeForNcst();

        const results = await Promise.all(
          locations.map((loc) =>
            weatherAPI.getUltraSrtNcst({
              base_date: baseDate,
              base_time: baseTime,
              nx: loc.nx,
              ny: loc.ny,
            })
          )
        );

        const weatherMap: Record<string, ParsedWeatherData> = {};
        locations.forEach((loc, index) => {
          const items = results[index]?.items?.item;
          if (items) {
            const itemsList = Array.isArray(items) ? items : [items];
            weatherMap[loc.name] = weatherAPI.parseWeatherData(itemsList);
          }
        });

        setData(weatherMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAllWeather();
  }, [locations.map((l) => `${l.nx},${l.ny},${l.name}`).join('|')]);

  return { data, loading, error };
};
