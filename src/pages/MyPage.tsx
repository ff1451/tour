import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  Mountain,
  Utensils,
  Hotel,
  Sparkles,
  ChevronRight,
  Search,
  Heart,
  Loader2,
  AlertCircle,
  User,
} from 'lucide-react';
import tourApi from '../services/tourApi';
import type { TourItem, Festival as FestivalType } from '../services/types';

interface PopularDestination {
  id: string;
  title: string;
  location: string;
  image: string;
  category: string;
}

interface Festival {
  id: string;
  title: string;
  date: string;
  location: string;
  status: 'ongoing' | 'upcoming';
}

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [popularDestinations, setPopularDestinations] = useState<PopularDestination[]>([]);
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, []);

  // 초기 데이터 로드 함수
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 병렬로 데이터 요청
      const [touristSpots, culturalFacilities, festivalData] = await Promise.all([
        // 관광지 (서울)
        tourApi.getAreaBasedList({
          areaCode: '1', // 서울
          contentTypeId: '12', // 관광지
          numOfRows: 2,
          arrange: 'P', // 인기순
        }),
        // 문화시설 (서울)
        tourApi.getAreaBasedList({
          areaCode: '1', // 서울
          contentTypeId: '14', // 문화시설
          numOfRows: 2,
          arrange: 'P',
        }),
        // 진행중인 축제 (현재 날짜 기준)
        tourApi.searchFestival({
          eventStartDate: getTodayDate(),
          numOfRows: 3,
          arrange: 'P',
        }),
      ]);

      // 관광지 데이터 변환
      const destinations: PopularDestination[] = [
        ...touristSpots.map((item) => ({
          id: item.contentid,
          title: item.title,
          location: item.addr1 || '위치 정보 없음',
          image:
            item.firstimage || item.firstimage2 || 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
          category: '관광지',
        })),
        ...culturalFacilities.map((item) => ({
          id: item.contentid,
          title: item.title,
          location: item.addr1 || '위치 정보 없음',
          image:
            item.firstimage || item.firstimage2 || 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800',
          category: '문화시설',
        })),
      ];

      setPopularDestinations(destinations);

      // 축제 데이터 변환
      const festivalList: Festival[] = festivalData.map((item: FestivalType) => {
        const today = getTodayDate();
        const isOngoing = item.eventstartdate <= today && item.eventenddate >= today;

        return {
          id: item.contentid,
          title: item.title,
          date: `${formatDate(item.eventstartdate)} - ${formatDate(item.eventenddate)}`,
          location: item.addr1 || '위치 정보 없음',
          status: isOngoing ? ('ongoing' as const) : ('upcoming' as const),
        };
      });

      setFestivals(festivalList);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
      setError('데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
      setPopularDestinations([]);
      setFestivals([]);
    } finally {
      setLoading(false);
    }
  };

  // 검색 핸들러 - SearchPage로 이동
  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    // 검색 기록 저장
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const newHistoryItem = {
      id: Date.now().toString(),
      query: searchQuery,
      timestamp: new Date().toISOString(),
    };
    const updatedHistory = [newHistoryItem, ...searchHistory].slice(0, 50);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));

    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
  };

  // 카테고리 클릭 핸들러 - SearchPage로 이동
  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);

    // 숙박(32)은 전용 페이지로
    if (categoryId === '32') {
      window.location.href = '/accommodations';
      return;
    }

    // 축제(15)는 전용 페이지로
    if (categoryId === '15') {
      window.location.href = '/festivals';
      return;
    }

    // 나머지는 검색 페이지로
    window.location.href = `/search?category=${categoryId}`;
  };

  // 엔터키 검색
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 헬퍼 함수들
  const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    return `${dateStr.substring(0, 4)}.${dateStr.substring(4, 6)}.${dateStr.substring(6, 8)}`;
  };

  const getCategoryName = (id: string): string => {
    const category = categories.find((cat) => cat.id === id);
    return category ? category.label : '';
  };

  const categories = [
    { id: '12', icon: Mountain, label: '관광지', color: 'from-emerald-500 to-teal-600' },
    { id: '14', icon: Sparkles, label: '문화시설', color: 'from-violet-500 to-purple-600' },
    { id: '15', icon: Calendar, label: '축제/행사', color: 'from-rose-500 to-pink-600' },
    { id: '32', icon: Hotel, label: '숙박', color: 'from-blue-500 to-cyan-600' },
    { id: '39', icon: Utensils, label: '음식점', color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 rotate-3 transform items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent">
                한국여행
              </h1>
            </div>

            <nav className="hidden items-center space-x-8 md:flex">
              <a href="/destinations" className="font-medium text-gray-700 transition-colors hover:text-blue-600">
                여행지
              </a>
              <a href="/festivals" className="font-medium text-gray-700 transition-colors hover:text-blue-600">
                축제
              </a>
              <a href="/accommodations" className="font-medium text-gray-700 transition-colors hover:text-blue-600">
                숙박
              </a>
              <a href="/courses" className="font-medium text-gray-700 transition-colors hover:text-blue-600">
                여행코스
              </a>
              <a
                href="/my-trip"
                className="transform rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 font-medium text-white transition-all hover:scale-105 hover:shadow-lg"
              >
                내 여행
              </a>
              <a
                href="/mypage"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
                title="마이페이지"
              >
                <User className="h-5 w-5 text-gray-700" />
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 pt-32 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-fade-in mb-12 text-center">
            <h2 className="mb-6 text-5xl leading-tight font-bold md:text-7xl">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                당신만의
              </span>
              <br />
              <span className="text-gray-900">특별한 여행을 시작하세요</span>
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              대한민국 곳곳의 아름다운 명소와 숨은 보석을 발견하고,
              <br />
              완벽한 여행 계획을 세워보세요
            </p>
          </div>

          {/* Search Bar */}
          <div className="mx-auto mb-16 max-w-3xl">
            <div className="group relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 opacity-20 blur-xl transition-opacity group-hover:opacity-30"></div>
              <div className="relative flex items-center rounded-2xl bg-white p-2 shadow-2xl">
                <Search className="ml-4 h-6 w-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="어디로 여행을 떠나시나요?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-4 py-4 text-lg outline-none"
                />
                <button
                  onClick={handleSearch}
                  className="transform rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg"
                >
                  검색
                </button>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-20 grid grid-cols-2 gap-4 md:grid-cols-5">
            {categories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`group relative transform overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all hover:scale-105 hover:shadow-2xl ${
                  activeCategory === category.id ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'slideUp 0.6s ease-out forwards',
                }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.color} ${
                    activeCategory === category.id ? 'opacity-10' : 'opacity-0'
                  } transition-opacity group-hover:opacity-10`}
                ></div>
                <div
                  className={`h-12 w-12 bg-gradient-to-br ${category.color} mb-4 flex items-center justify-center rounded-xl transition-transform group-hover:scale-110`}
                >
                  <category.icon className="h-6 w-6 text-white" />
                </div>
                <p className="font-semibold text-gray-800">{category.label}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="bg-white/50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h3 className="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">인기 여행지</h3>
              <p className="text-gray-600">많은 여행자들이 찾는 명소를 둘러보세요</p>
            </div>
            <a
              href="/destinations"
              className="hidden items-center space-x-2 font-semibold text-blue-600 transition-all hover:space-x-3 md:flex"
            >
              <span>전체보기</span>
              <ChevronRight className="h-5 w-5" />
            </a>
          </div>

          {/* 로딩 상태 */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
          )}

          {/* 에러 상태 */}
          {error && !loading && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" />
                <div>
                  <h4 className="mb-1 font-semibold text-red-900">데이터 로드 실패</h4>
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={loadInitialData}
                    className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                  >
                    다시 시도
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 데이터 표시 */}
          {!loading && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {popularDestinations.map((place, index) => (
                <div
                  key={place.id}
                  onClick={() => (window.location.href = `/detail/${place.id}`)}
                  className="group relative transform cursor-pointer overflow-hidden rounded-2xl shadow-lg transition-all hover:scale-105 hover:shadow-2xl"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeIn 0.8s ease-out forwards',
                  }}
                >
                  <div className="aspect-[4/5] overflow-hidden bg-gray-200">
                    <img
                      src={place.image}
                      alt={place.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800';
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute right-0 bottom-0 left-0 p-6 text-white">
                    <span className="mb-3 inline-block rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur-sm">
                      {place.category}
                    </span>
                    <h4 className="mb-1 text-xl font-bold">{place.title}</h4>
                    <p className="flex items-center text-sm text-white/90">
                      <MapPin className="mr-1 h-4 w-4" />
                      {place.location}
                    </p>
                  </div>
                  <button className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/30">
                    <Heart className="h-5 w-5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Festivals */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h3 className="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">진행중인 축제</h3>
              <p className="text-gray-600">지금 즐길 수 있는 다채로운 축제를 만나보세요</p>
            </div>
            <a
              href="/festivals"
              className="hidden items-center space-x-2 font-semibold text-blue-600 transition-all hover:space-x-3 md:flex"
            >
              <span>전체보기</span>
              <ChevronRight className="h-5 w-5" />
            </a>
          </div>

          {!loading && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {festivals.length > 0 ? (
                festivals.map((festival, index) => (
                  <div
                    key={festival.id}
                    onClick={() => (window.location.href = `/detail/${festival.id}`)}
                    className="group transform cursor-pointer rounded-2xl bg-white p-6 shadow-lg transition-all hover:scale-105 hover:shadow-2xl"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'slideUp 0.6s ease-out forwards',
                    }}
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                          festival.status === 'ongoing' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {festival.status === 'ongoing' ? '진행중' : '예정'}
                      </span>
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <h4 className="mb-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                      {festival.title}
                    </h4>
                    <p className="mb-3 text-gray-600">{festival.date}</p>
                    <p className="flex items-center text-sm text-gray-500">
                      <MapPin className="mr-1 h-4 w-4" />
                      {festival.location}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-12 text-center text-gray-500">진행중인 축제가 없습니다.</div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-12 md:p-16">
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                  backgroundSize: '40px 40px',
                }}
              ></div>
            </div>
            <div className="relative z-10 text-center text-white">
              <h3 className="mb-6 text-3xl font-bold md:text-5xl">나만의 여행 계획을 세워보세요</h3>
              <p className="mx-auto mb-8 max-w-2xl text-xl text-white/90">
                원하는 여행지를 선택하고, 일정을 구성하고, 완벽한 여행을 만들어보세요
              </p>
              <button className="transform rounded-full bg-white px-8 py-4 text-lg font-bold text-blue-600 transition-all hover:scale-105 hover:shadow-2xl">
                여행 계획 시작하기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 px-4 py-12 text-gray-300 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white">한국여행</h4>
              </div>
              <p className="text-sm text-gray-400">
                대한민국의 아름다운 여행지를
                <br />
                발견하고 공유하세요
              </p>
            </div>

            <div>
              <h5 className="mb-4 font-semibold text-white">여행정보</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    관광지
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    축제·행사
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    숙박
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    음식점
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="mb-4 font-semibold text-white">서비스</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    여행 계획
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    지역별 탐색
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    반려동물 여행
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    여행 코스
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="mb-4 font-semibold text-white">고객지원</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    공지사항
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    자주 묻는 질문
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    이용약관
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    개인정보처리방침
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2024 한국여행. All rights reserved. | Powered by 한국관광공사 TourAPI</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
