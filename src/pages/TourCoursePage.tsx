import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Map,
  MapPin,
  Clock,
  Compass,
  ArrowLeft,
  Search,
  Filter,
  Grid3x3,
  List as ListIcon,
  Loader2,
  AlertCircle,
  X,
  Navigation,
  TrendingUp,
  Heart,
  Share2,
  Route as RouteIcon,
} from 'lucide-react';
import tourApi from '../services/tourApi';
import type { TourItem } from '../services/types';

const TourCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [courses, setCourses] = useState<TourItem[]>([]);
  const [allCourses, setAllCourses] = useState<TourItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalFiltered, setTotalFiltered] = useState(0);

  // 필터 상태
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('O');

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // 지역 목록
  const areas = [
    { code: '', name: '전국' },
    { code: '1', name: '서울' },
    { code: '2', name: '인천' },
    { code: '6', name: '부산' },
    { code: '4', name: '대구' },
    { code: '5', name: '광주' },
    { code: '3', name: '대전' },
    { code: '7', name: '울산' },
    { code: '8', name: '세종' },
    { code: '31', name: '경기' },
    { code: '32', name: '강원' },
    { code: '33', name: '충북' },
    { code: '34', name: '충남' },
    { code: '35', name: '경북' },
    { code: '36', name: '경남' },
    { code: '37', name: '전북' },
    { code: '38', name: '전남' },
    { code: '39', name: '제주' },
  ];

  // 테마 (코스 제목에서 추출되는 키워드)
  const themes = [
    { id: '', label: '전체', icon: Compass },
    { id: '역사', label: '역사문화', icon: MapPin },
    { id: '자연', label: '자연탐방', icon: TrendingUp },
    { id: '도보', label: '도보여행', icon: Navigation },
    { id: '드라이브', label: '드라이브', icon: RouteIcon },
    { id: '맛집', label: '맛집투어', icon: Heart },
  ];

  // 정렬 옵션
  const sortOptions = [
    { value: 'O', label: '기본순' },
    { value: 'P', label: '인기순' },
    { value: 'Q', label: '평점순' },
    { value: 'R', label: '리뷰순' },
  ];

  // API 호출이 필요한 필터
  useEffect(() => {
    loadCourses(1);
  }, [selectedArea, sortBy]);

  // 클라이언트 사이드 필터링
  useEffect(() => {
    if (allCourses.length === 0) return;
    applyClientFilters();
  }, [selectedTheme, searchQuery]);

  const loadCourses = async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      console.log('여행 코스 API 호출:', {
        selectedArea,
        sortBy,
        page,
      });

      const response = await tourApi.searchTourCourse({
        areaCode: selectedArea || undefined,
        numOfRows: 100, // 더 많은 결과
        pageNo: 1,
        arrange: sortBy as any,
      });

      console.log('여행 코스 결과:', response.length, '개');

      // 전체 데이터 저장
      setAllCourses(response);

      // 클라이언트 사이드 필터링
      let filtered = response;

      // 1. 테마 필터링
      if (selectedTheme) {
        console.log('테마 필터 적용:', selectedTheme);
        filtered = filtered.filter((item) => {
          const title = item.title.toLowerCase();
          return (
            title.includes(selectedTheme.toLowerCase()) ||
            (item.addr1 && item.addr1.toLowerCase().includes(selectedTheme.toLowerCase()))
          );
        });
        console.log('테마 필터 후 결과:', filtered.length);
      }

      // 2. 검색어 필터링
      if (searchQuery.trim()) {
        console.log('검색어 필터 적용:', searchQuery);
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (item) => item.title.toLowerCase().includes(query) || (item.addr1 && item.addr1.toLowerCase().includes(query))
        );
        console.log('검색어 필터 후 결과:', filtered.length);
      }

      // 3. 페이지네이션
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedResults = filtered.slice(startIndex, endIndex);

      console.log('최종 표시 결과:', paginatedResults.length);

      setTotalFiltered(filtered.length);
      setCourses(paginatedResults);
      setCurrentPage(page);
    } catch (err) {
      console.error('여행 코스 로드 실패:', err);
      setError('여행 코스 정보를 불러오는데 실패했습니다.');
      setCourses([]);
      setAllCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // 클라이언트 필터링 함수
  const applyClientFilters = (page: number = 1) => {
    console.log('클라이언트 필터 적용:', { selectedTheme, searchQuery, page });

    let filtered = [...allCourses];

    // 1. 테마 필터링
    if (selectedTheme) {
      console.log('테마 필터 적용:', selectedTheme);
      filtered = filtered.filter((item) => {
        const title = item.title.toLowerCase();
        return (
          title.includes(selectedTheme.toLowerCase()) ||
          (item.addr1 && item.addr1.toLowerCase().includes(selectedTheme.toLowerCase()))
        );
      });
      console.log('테마 필터 후 결과:', filtered.length);
    }

    // 2. 검색어 필터링
    if (searchQuery.trim()) {
      console.log('검색어 필터 적용:', searchQuery);
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) => item.title.toLowerCase().includes(query) || (item.addr1 && item.addr1.toLowerCase().includes(query))
      );
      console.log('검색어 필터 후 결과:', filtered.length);
    }

    // 3. 페이지네이션
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedResults = filtered.slice(startIndex, endIndex);

    console.log('클라이언트 필터 최종 결과:', paginatedResults.length);

    setTotalFiltered(filtered.length);
    setCourses(paginatedResults);
    setCurrentPage(page);
  };

  // 검색 핸들러
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    loadCourses(1);
  };

  // 필터 초기화
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedArea('');
    setSelectedTheme('');
    setSortBy('O');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 border-b border-blue-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/')} className="rounded-lg p-2 transition-colors hover:bg-blue-100">
                <ArrowLeft className="h-6 w-6 text-blue-600" />
              </button>
              <div>
                <h1 className="flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
                  <RouteIcon className="h-8 w-8 text-blue-600" />
                  여행 코스
                </h1>
                <p className="mt-1 text-sm text-gray-600">테마별 여행 코스를 찾아보세요</p>
              </div>
            </div>

            {/* 뷰 모드 전환 */}
            <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-white p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-lg p-2 transition-all ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-blue-50'
                }`}
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-lg p-2 transition-all ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-blue-50'
                }`}
              >
                <ListIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 검색 및 필터 */}
        <div className="mb-8 rounded-2xl border border-blue-100 bg-white/80 p-6 shadow-lg backdrop-blur-xl">
          {/* 검색바 */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="코스명 또는 지역 검색..."
                className="w-full rounded-xl border border-blue-200 py-4 pr-4 pl-12 text-lg outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              )}
            </div>
          </form>

          {/* 테마 선택 */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">여행 테마</h3>
            <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
              {themes.map((theme) => {
                const Icon = theme.icon;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`rounded-xl border-2 p-4 transition-all ${
                      selectedTheme === theme.id
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    <Icon className="mx-auto mb-2 h-6 w-6" />
                    <p className="text-sm font-medium">{theme.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 필터 및 정렬 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* 지역 */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">지역</label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full rounded-xl border border-blue-200 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                {areas.map((area) => (
                  <option key={area.code} value={area.code}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 정렬 */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">정렬</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-xl border border-blue-200 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 초기화 */}
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-3 font-medium transition-colors hover:bg-gray-200"
              >
                <X className="h-5 w-5" />
                필터 초기화
              </button>
            </div>
          </div>

          {/* 결과 카운트 */}
          <div className="mt-4 border-t border-blue-100 pt-4">
            <p className="text-sm text-gray-600">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  검색 중...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <RouteIcon className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-600">{totalFiltered}개</span>의 여행 코스를 찾았습니다
                  {totalFiltered > itemsPerPage && (
                    <span className="text-gray-500">(현재 페이지: {courses.length}개)</span>
                  )}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
        )}

        {/* 에러 */}
        {error && !loading && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-600" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => loadCourses(1)}
              className="mt-4 rounded-xl bg-red-600 px-6 py-2 text-white transition-colors hover:bg-red-700"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 결과 없음 */}
        {!loading && !error && courses.length === 0 && (
          <div className="rounded-2xl border border-blue-100 bg-white/80 p-12 text-center backdrop-blur-xl">
            <RouteIcon className="mx-auto mb-4 h-16 w-16 text-blue-300" />
            <h3 className="mb-2 text-xl font-bold text-gray-900">검색 결과가 없습니다</h3>
            <p className="text-gray-600">다른 지역이나 테마로 검색해보세요</p>
          </div>
        )}

        {/* 그리드 뷰 */}
        {!loading && !error && courses.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, index) => (
              <div
                key={course.contentid || index}
                onClick={() => navigate(`/detail/${course.contentid}`)}
                className="group transform cursor-pointer overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-blue-300 hover:shadow-2xl"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                {/* 이미지 */}
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100">
                  <img
                    src={
                      course.firstimage ||
                      course.firstimage2 ||
                      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'
                    }
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* 코스 뱃지 */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-1 rounded-full bg-blue-600/90 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
                      <RouteIcon className="h-4 w-4" />
                      <span>코스</span>
                    </div>
                  </div>
                </div>

                {/* 정보 */}
                <div className="p-6">
                  <h3 className="mb-3 line-clamp-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                    {course.title}
                  </h3>

                  <div className="space-y-2 text-sm text-gray-600">
                    {/* 주소 */}
                    {course.addr1 && (
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 flex-shrink-0 text-blue-600" />
                        <span className="line-clamp-1">{course.addr1}</span>
                      </p>
                    )}
                  </div>

                  {/* 액션 버튼 */}
                  <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: 즐겨찾기
                      }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2 transition-colors hover:bg-blue-100"
                    >
                      <Heart className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">저장</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: 공유
                      }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-50 px-4 py-2 transition-colors hover:bg-gray-100"
                    >
                      <Share2 className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">공유</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 리스트 뷰 */}
        {!loading && !error && courses.length > 0 && viewMode === 'list' && (
          <div className="space-y-4">
            {courses.map((course, index) => (
              <div
                key={course.contentid || index}
                onClick={() => navigate(`/detail/${course.contentid}`)}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-blue-100 bg-white/80 shadow-lg backdrop-blur-xl transition-all hover:border-blue-300 hover:shadow-2xl"
              >
                <div className="flex flex-col md:flex-row">
                  {/* 이미지 */}
                  <div className="relative h-48 flex-shrink-0 overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 md:h-auto md:w-80">
                    <img
                      src={
                        course.firstimage ||
                        course.firstimage2 ||
                        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'
                      }
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800';
                      }}
                    />

                    {/* 코스 뱃지 */}
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center gap-1 rounded-full bg-blue-600/90 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
                        <RouteIcon className="h-4 w-4" />
                        <span>코스</span>
                      </div>
                    </div>
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 p-6">
                    <h3 className="mb-4 text-2xl font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                      {course.title}
                    </h3>

                    <div className="space-y-3 text-gray-600">
                      {course.addr1 && (
                        <p className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-blue-600" />
                          {course.addr1}
                        </p>
                      )}
                    </div>

                    {/* 액션 버튼 */}
                    <div className="mt-4 flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 transition-colors hover:bg-blue-100"
                      >
                        <Heart className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">저장하기</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 transition-colors hover:bg-gray-100"
                      >
                        <Share2 className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-600">공유하기</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {!loading && !error && courses.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => applyClientFilters(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg border border-blue-300 px-4 py-2 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                이전
              </button>

              {(() => {
                const pageButtons = [];
                const startPage = Math.max(1, currentPage - 2);
                const endPage = currentPage + 2;

                if (currentPage > 3) {
                  pageButtons.push(
                    <button
                      key={1}
                      onClick={() => applyClientFilters(1)}
                      className="rounded-lg border border-blue-300 px-4 py-2 transition-colors hover:bg-blue-50"
                    >
                      1
                    </button>
                  );
                  if (currentPage > 4) {
                    pageButtons.push(
                      <span key="dots-start" className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                }

                for (let i = startPage; i <= endPage; i++) {
                  pageButtons.push(
                    <button
                      key={i}
                      onClick={() => applyClientFilters(i)}
                      disabled={i === currentPage}
                      className={`rounded-lg px-4 py-2 transition-colors ${
                        i === currentPage
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-white'
                          : 'border border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {i}
                    </button>
                  );
                }

                return pageButtons;
              })()}

              <button
                onClick={() => applyClientFilters(currentPage + 1)}
                disabled={currentPage * itemsPerPage >= totalFiltered}
                className="rounded-lg border border-blue-300 px-4 py-2 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 애니메이션 */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default TourCoursePage;
