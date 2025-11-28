import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  Cloud,
  Camera,
  Star,
  ChevronRight,
  Menu,
  X,
  Search,
  Sun,
  Users,
  CloudRain,
  Cloudy,
  Droplets,
} from 'lucide-react';
import { usePopularTouristSpots, useMultipleAreaTouristSpots, useOngoingFestivals } from '../hooks/useTourAPI';
import { AREA_CODE, CONTENT_TYPE } from '../api/tourAPI';
import type { TouristSpot } from '../types/tourAPI.types';
import { useMultipleWeather } from '../hooks/useWeatherAPI';
import { convertToGrid } from '../api/weatherAPI';
import type { ParsedWeatherData } from '../types/weatherAPI.types';
import { useLatestPhotoAwards } from '../hooks/usePhotoAwardAPI';
import type { ParsedPhotoAward } from '../types/photoAwardAPI.types';

// 컴포넌트에서 사용할 타입 정의
interface HeroSlide {
  id: string | number;
  image: string;
  title: string;
  subtitle: string;
  location: string;
}

interface PopularDestination {
  id: string;
  contentTypeId: string;
  name: string;
  location: string;
  image: string;
  mapx?: string;
  mapy?: string;
  nx?: number;
  ny?: number;
}

interface FestivalDisplay {
  id: string;
  contentTypeId: string;
  name: string;
  location: string;
  date: string;
  status: '진행중' | '예정';
  image: string;
}

const HomePage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activeSlide, setActiveSlide] = useState<number>(0);

  // 실제 API 호출
  // 인기 여행지 (서울, 부산, 제주, 경기 혼합)
  const { data: multiAreaData, loading: multiAreaLoading } = useMultipleAreaTouristSpots(
    [AREA_CODE.SEOUL, AREA_CODE.BUSAN, AREA_CODE.JEJU, AREA_CODE.GYEONGGI],
    CONTENT_TYPE.TOURIST_SPOT
  );

  // 히어로 슬라이더용 관광지 (제주 - 이미지가 좋은 곳)
  const { data: heroData, loading: heroLoading } = usePopularTouristSpots(AREA_CODE.JEJU, 3);

  // 관광공모전 수상작 조회 (최신 6개)
  const { data: photoAwardsData, loading: photoAwardsLoading } = useLatestPhotoAwards(6);

  // 진행중인 축제 조회 (30일 범위)
  const { data: festivalsData, loading: festivalsLoading } = useOngoingFestivals(null, 30);

  // API 데이터를 컴포넌트에서 사용할 형태로 변환
  const getHeroSlides = (): HeroSlide[] => {
    if (heroLoading || !heroData?.items?.item) {
      return [
        {
          id: 1,
          image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200',
          title: '대한민국의 아름다운 여행지',
          subtitle: '전국 각지의 숨겨진 명소를 찾아보세요',
          location: '대한민국',
        },
      ];
    }

    const items = heroData.items.item;
    const itemsList = Array.isArray(items) ? items.slice(0, 3) : [items];

    return itemsList.map((item, index) => ({
      id: item.contentid || index,
      image:
        item.firstimage ||
        `https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80&auto=format&fit=crop&sig=${index}`,
      title: item.title || '아름다운 여행지',
      subtitle: item.addr1 || '멋진 경치를 감상하세요',
      location: item.addr1?.split(' ')[0] + ' ' + (item.addr1?.split(' ')[1] || ''),
    }));
  };

  const getPopularDestinations = (): PopularDestination[] => {
    if (multiAreaLoading || !multiAreaData) return [];

    const allDestinations: TouristSpot[] = [];

    Object.values(multiAreaData).forEach((areaData) => {
      if (areaData?.items?.item) {
        const items = areaData.items.item;
        const itemsList = Array.isArray(items) ? items : [items];
        allDestinations.push(...itemsList);
      }
    });

    // 최대 8개만 선택 (각 지역에서 골고루)
    return allDestinations.slice(0, 8).map((dest) => {
      // 위경도를 격자좌표로 변환
      let nx: number | undefined;
      let ny: number | undefined;

      if (dest.mapy && dest.mapx) {
        try {
          const latitude = parseFloat(dest.mapy);
          const longitude = parseFloat(dest.mapx);
          if (!isNaN(latitude) && !isNaN(longitude)) {
            const grid = convertToGrid(latitude, longitude);
            nx = grid.nx;
            ny = grid.ny;
          }
        } catch (error) {
          console.error('Grid conversion error:', error);
        }
      }

      return {
        id: dest.contentid,
        contentTypeId: dest.contenttypeid,
        name: dest.title,
        location: dest.addr1?.split(' ').slice(0, 2).join(' ') || '위치정보 없음',
        image: dest.firstimage || dest.firstimage2 || 'https://via.placeholder.com/400x300?text=No+Image',
        mapx: dest.mapx,
        mapy: dest.mapy,
        nx,
        ny,
      };
    });
  };

  const getFestivals = (): FestivalDisplay[] => {
    if (festivalsLoading || !festivalsData?.items?.item) return [];

    const items = festivalsData.items.item;
    const itemsList = Array.isArray(items) ? items : [items];

    return itemsList.slice(0, 6).map((festival) => {
      // 날짜 포맷: YYYYMMDD → YYYY.MM.DD
      const formatDate = (dateStr: string): string => {
        if (!dateStr || dateStr.length !== 8) return dateStr;
        return `${dateStr.substring(0, 4)}.${dateStr.substring(4, 6)}.${dateStr.substring(6, 8)}`;
      };

      // 진행 상태 판단
      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      const startDate = festival.eventstartdate || '';
      const endDate = festival.eventenddate || '';

      let status: '진행중' | '예정' = '예정';
      if (startDate && endDate) {
        if (todayStr >= startDate && todayStr <= endDate) {
          status = '진행중';
        }
      }

      return {
        id: festival.contentid,
        contentTypeId: festival.contenttypeid,
        name: festival.title,
        location: festival.addr1?.split(' ').slice(0, 2).join(' ') || '위치정보 없음',
        date: `${formatDate(festival.eventstartdate)} - ${formatDate(festival.eventenddate)}`,
        status,
        image:
          festival.firstimage ||
          festival.firstimage2 ||
          'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=300&fit=crop',
      };
    });
  };

  const heroSlides: HeroSlide[] = getHeroSlides();
  const popularDestinations: PopularDestination[] = getPopularDestinations();
  const festivals: FestivalDisplay[] = getFestivals();

  // 관광공모전 수상작 (실제 API 데이터 사용)
  const photoAwards: ParsedPhotoAward[] = photoAwardsData || [];

  // 날씨 데이터 조회 (격자좌표가 있는 여행지만)
  const weatherLocations = popularDestinations
    .filter((dest) => dest.nx && dest.ny)
    .map((dest) => ({
      nx: dest.nx!,
      ny: dest.ny!,
      name: dest.id,
    }));

  const { data: weatherData, loading: weatherLoading } = useMultipleWeather(weatherLocations);

  // 날씨 아이콘 선택 헬퍼
  const getWeatherIcon = (weather: ParsedWeatherData | undefined) => {
    if (!weather) return <Cloud className="h-5 w-5 text-gray-400" />;

    // 강수 형태 우선 체크
    if (weather.precipitationType && weather.precipitationType !== '없음') {
      return <CloudRain className="h-5 w-5 text-blue-500" />;
    }

    // 하늘 상태로 판단
    if (weather.skyCondition === '맑음') {
      return <Sun className="h-5 w-5 text-yellow-500" />;
    } else if (weather.skyCondition === '구름많음') {
      return <Cloudy className="h-5 w-5 text-gray-500" />;
    } else if (weather.skyCondition === '흐림') {
      return <Cloud className="h-5 w-5 text-gray-600" />;
    }

    return <Cloud className="h-5 w-5 text-gray-400" />;
  };

  // Auto slide for hero section
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <MapPin className="text-primary-600 h-8 w-8" />
              <span className="text-xl font-bold text-gray-900">한국여행</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden space-x-8 md:flex">
              <a href="#destinations" className="hover:text-primary-600 font-medium text-gray-700">
                여행지
              </a>
              <a href="#festivals" className="hover:text-primary-600 font-medium text-gray-700">
                축제
              </a>
              <a href="#planner" className="hover:text-primary-600 font-medium text-gray-700">
                여행계획
              </a>
              <a href="#weather" className="hover:text-primary-600 font-medium text-gray-700">
                날씨
              </a>
              <a href="#gallery" className="hover:text-primary-600 font-medium text-gray-700">
                갤러리
              </a>
            </nav>

            {/* Search and Mobile Menu */}
            <div className="flex items-center space-x-4">
              <button className="hidden items-center space-x-2 rounded-full bg-gray-100 px-4 py-2 transition hover:bg-gray-200 md:flex">
                <Search className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">검색</span>
              </button>

              <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t bg-white md:hidden">
            <div className="space-y-3 px-4 py-3">
              <a href="#destinations" className="hover:text-primary-600 block font-medium text-gray-700">
                여행지
              </a>
              <a href="#festivals" className="hover:text-primary-600 block font-medium text-gray-700">
                축제
              </a>
              <a href="#planner" className="hover:text-primary-600 block font-medium text-gray-700">
                여행계획
              </a>
              <a href="#weather" className="hover:text-primary-600 block font-medium text-gray-700">
                날씨
              </a>
              <a href="#gallery" className="hover:text-primary-600 block font-medium text-gray-700">
                갤러리
              </a>
              <div className="border-t pt-3">
                <button className="flex w-full items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2">
                  <Search className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600">검색</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section with Slider */}
      <section className="relative h-[500px] overflow-hidden md:h-[600px]">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === activeSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="h-full w-full bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${slide.image})`,
              }}
            >
              <div className="mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
                <div className="animate-fade-in max-w-2xl text-white">
                  <div className="mb-4 flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span className="text-sm md:text-base">{slide.location}</span>
                  </div>
                  <h1 className="mb-4 text-4xl font-bold md:text-6xl">{slide.title}</h1>
                  <p className="mb-8 text-lg text-gray-200 md:text-xl">{slide.subtitle}</p>
                  <button className="bg-primary-600 hover:bg-primary-700 flex items-center space-x-2 rounded-full px-8 py-3 font-medium text-white transition">
                    <span>자세히 보기</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 transform space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === activeSlide ? 'w-8 bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="relative z-10 -mt-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white p-6 shadow-xl md:p-8">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {popularDestinations.length > 0 ? popularDestinations.length : '-'}
                </div>
                <div className="text-sm text-gray-600">표시된 관광지</div>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{festivals.length || '6'}</div>
                <div className="text-sm text-gray-600">진행중/예정 축제</div>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <Camera className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {photoAwards.length > 0 ? photoAwards.length : '-'}
                </div>
                <div className="text-sm text-gray-600">수상작 표시</div>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">2.4M</div>
                <div className="text-sm text-gray-600">월간 방문객</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">인기 여행지</h2>
              <p className="text-gray-600">전국 주요 관광지 추천</p>
            </div>
            <button className="text-primary-600 hover:text-primary-700 hidden items-center space-x-2 font-medium md:flex">
              <span>전체보기</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {multiAreaLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="animate-pulse overflow-hidden rounded-xl bg-white shadow-md">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="mb-2 h-6 rounded bg-gray-200"></div>
                    <div className="h-4 w-2/3 rounded bg-gray-200"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : popularDestinations.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {popularDestinations.map((dest) => (
                <div
                  key={dest.id}
                  className="group cursor-pointer overflow-hidden rounded-xl bg-white shadow-md transition-shadow hover:shadow-xl"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                    {/* 날씨 배지 */}
                    {!weatherLoading && weatherData[dest.id] && (
                      <div className="absolute top-3 right-3 flex items-center space-x-2 rounded-full bg-white/90 px-3 py-1.5 shadow-lg backdrop-blur-sm">
                        {getWeatherIcon(weatherData[dest.id])}
                        {weatherData[dest.id].temperature !== undefined && (
                          <span className="text-sm font-semibold text-gray-900">
                            {Math.round(weatherData[dest.id].temperature!)}°C
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="mb-1 line-clamp-1 text-lg font-bold text-gray-900">{dest.name}</h3>
                    <div className="mb-2 flex items-center text-sm text-gray-600">
                      <MapPin className="mr-1 h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-1">{dest.location}</span>
                    </div>
                    {/* 날씨 상세 정보 */}
                    {!weatherLoading && weatherData[dest.id] && (
                      <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-xs text-gray-500">
                        {weatherData[dest.id].skyCondition && (
                          <span className="flex items-center">{weatherData[dest.id].skyCondition}</span>
                        )}
                        {weatherData[dest.id].humidity !== undefined && (
                          <span className="flex items-center">
                            <Droplets className="mr-1 h-3 w-3" />
                            {Math.round(weatherData[dest.id].humidity!)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <MapPin className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p>관광지 정보를 불러오는 중입니다...</p>
            </div>
          )}

          <button className="text-primary-600 hover:text-primary-700 border-primary-600 mt-6 flex w-full items-center justify-center space-x-2 rounded-lg border py-3 font-medium md:hidden">
            <span>전체보기</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Festivals Section */}
      <section className="bg-gradient-to-br from-purple-50 to-pink-50 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">
                전국 문화축제
                {festivals.length > 0 && <span className="text-primary-600 ml-3 text-2xl">{festivals.length}개</span>}
              </h2>
              <p className="text-gray-600">전국 각지의 다채로운 축제 정보</p>
            </div>
            <button className="text-primary-600 hover:text-primary-700 hidden items-center space-x-2 font-medium md:flex">
              <span>전체보기</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {festivalsLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse overflow-hidden rounded-xl bg-white shadow-md">
                  <div className="h-56 bg-gray-200"></div>
                  <div className="p-5">
                    <div className="mb-3 h-6 rounded bg-gray-200"></div>
                    <div className="mb-2 h-4 rounded bg-gray-200"></div>
                    <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : festivals.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {festivals.map((festival) => (
                <div
                  key={festival.id}
                  className="cursor-pointer overflow-hidden rounded-xl bg-white shadow-md transition-shadow hover:shadow-xl"
                >
                  <div className="relative h-56">
                    <img
                      src={festival.image}
                      alt={festival.name}
                      className="h-full w-full object-cover"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=300&fit=crop';
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <div
                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                          festival.status === '진행중' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                        }`}
                      >
                        {festival.status}
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="mb-2 line-clamp-2 text-xl font-bold text-gray-900">{festival.name}</h3>
                    <div className="mb-2 flex items-center text-sm text-gray-600">
                      <MapPin className="mr-1 h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-1">{festival.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="mr-1 h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-1">{festival.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p>현재 진행중이거나 예정된 축제가 없습니다.</p>
              <p className="mt-2 text-sm">축제 정보를 불러오는 중이거나 데이터가 없습니다.</p>
            </div>
          )}
        </div>
      </section>

      {/* Photo Awards Section */}
      <section className="bg-gray-900 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mb-4 flex items-center justify-center space-x-2">
              <Camera className="h-8 w-8 text-yellow-400" />
              <h2 className="text-3xl font-bold text-white md:text-4xl">관광공모전 수상작</h2>
            </div>
            <p className="text-gray-300">대한민국 관광 사진 공모전 수상작을 만나보세요</p>
          </div>

          {photoAwardsLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-w-4 aspect-h-5 h-96 animate-pulse rounded-xl bg-gray-800"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {photoAwards.slice(0, 3).map((photo) => (
                <div key={photo.id} className="group relative cursor-pointer overflow-hidden rounded-xl shadow-lg">
                  <div className="aspect-w-4 aspect-h-5 relative h-96">
                    <img
                      src={photo.image}
                      alt={photo.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  </div>
                  <div className="absolute right-0 bottom-0 left-0 translate-y-6 transform p-6 text-white transition-transform duration-300 group-hover:translate-y-0">
                    <div className="mb-2 flex items-center space-x-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{photo.awardRank}</span>
                      {photo.awardCategory && <span className="text-xs text-gray-300">· {photo.awardCategory}</span>}
                    </div>
                    <h3 className="mb-1 line-clamp-2 text-xl font-bold">{photo.title}</h3>
                    <p className="mb-2 text-sm text-gray-300">by {photo.photographer}</p>
                    {photo.location && (
                      <div className="flex items-center text-xs text-gray-400">
                        <MapPin className="mr-1 h-3 w-3" />
                        <span className="line-clamp-1">{photo.location}</span>
                      </div>
                    )}
                    {photo.filmDate && <div className="mt-1 text-xs text-gray-400">촬영일: {photo.filmDate}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Weather-based Recommendations */}
      <section className="bg-gradient-to-br from-blue-50 to-cyan-50 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mb-4 flex items-center justify-center space-x-2">
              <Cloud className="h-8 w-8 text-blue-500" />
              <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">날씨 기반 추천</h2>
            </div>
            <p className="text-gray-600">오늘 날씨가 좋은 여행지를 추천해드립니다</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {popularDestinations.slice(0, 6).map((dest) => {
              const weather = weatherData[dest.id];
              const hasWeather = weather && !weatherLoading;

              return (
                <div key={dest.id} className="rounded-xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="mb-1 line-clamp-1 text-lg font-bold text-gray-900">{dest.name}</h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="mr-1 h-3.5 w-3.5 flex-shrink-0" />
                        <span className="line-clamp-1">{dest.location}</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      {hasWeather ? getWeatherIcon(weather) : <Cloud className="h-10 w-10 text-gray-300" />}
                    </div>
                  </div>

                  {hasWeather ? (
                    <div className="space-y-2">
                      {/* 기온 */}
                      {weather.temperature !== undefined && (
                        <div className="flex items-center justify-between border-b border-gray-100 py-2">
                          <span className="text-sm text-gray-600">기온</span>
                          <span className="text-lg font-bold text-gray-900">{Math.round(weather.temperature)}°C</span>
                        </div>
                      )}

                      {/* 하늘 상태 */}
                      {weather.skyCondition && (
                        <div className="flex items-center justify-between border-b border-gray-100 py-2">
                          <span className="text-sm text-gray-600">날씨</span>
                          <span className="text-sm font-medium text-gray-900">{weather.skyCondition}</span>
                        </div>
                      )}

                      {/* 습도 */}
                      {weather.humidity !== undefined && (
                        <div className="flex items-center justify-between border-b border-gray-100 py-2">
                          <span className="text-sm text-gray-600">습도</span>
                          <span className="flex items-center text-sm font-medium text-gray-900">
                            <Droplets className="mr-1 h-3.5 w-3.5 text-blue-500" />
                            {Math.round(weather.humidity)}%
                          </span>
                        </div>
                      )}

                      {/* 추천 메시지 */}
                      {weather.temperature !== undefined && weather.skyCondition && (
                        <div className="pt-2">
                          {weather.skyCondition === '맑음' && weather.temperature >= 15 && weather.temperature <= 25 ? (
                            <div className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-600">
                              ✨ 관광하기 최적의 날씨
                            </div>
                          ) : weather.skyCondition === '맑음' ? (
                            <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600">
                              ☀️ 맑은 날씨, 관광 추천
                            </div>
                          ) : weather.precipitationType && weather.precipitationType !== '없음' ? (
                            <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600">
                              🌧️ 실내 관광지 추천
                            </div>
                          ) : (
                            <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600">
                              ☁️ 관광 가능
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : weatherLoading ? (
                    <div className="space-y-2">
                      <div className="h-8 animate-pulse rounded bg-gray-100"></div>
                      <div className="h-8 animate-pulse rounded bg-gray-100"></div>
                      <div className="h-8 animate-pulse rounded bg-gray-100"></div>
                    </div>
                  ) : (
                    <div className="py-4 text-center text-sm text-gray-400">날씨 정보를 불러올 수 없습니다</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="from-primary-600 rounded-2xl bg-gradient-to-r to-blue-700 p-8 text-center text-white md:p-12">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">나만의 여행 계획을 세워보세요</h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-blue-100">
              AI 기반 추천으로 최적의 여행 코스를 만들고, 실시간 날씨와 혼잡도 정보로 완벽한 여행을 준비하세요.
            </p>
            <button className="text-primary-600 inline-flex items-center space-x-2 rounded-full bg-white px-8 py-3 font-bold transition hover:bg-gray-100">
              <span>여행 계획 시작하기</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 text-gray-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center space-x-2">
                <MapPin className="text-primary-400 h-6 w-6" />
                <span className="text-xl font-bold text-white">한국여행</span>
              </div>
              <p className="text-sm text-gray-400">대한민국 구석구석, 모든 여행 정보를 한곳에서</p>
            </div>

            <div>
              <h4 className="mb-4 font-bold text-white">서비스</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-primary-400 transition">
                    여행지 검색
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-400 transition">
                    축제 정보
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-400 transition">
                    여행 계획
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-400 transition">
                    날씨 정보
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-bold text-white">정보</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-primary-400 transition">
                    공지사항
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-400 transition">
                    이용약관
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-400 transition">
                    개인정보처리방침
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-400 transition">
                    고객센터
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-bold text-white">데이터 제공</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>한국관광공사</li>
                <li>기상청</li>
                <li>문화체육관광부</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2025 한국여행. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
