import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Hotel,
  Home,
  Building2,
  MapPin,
  Star,
  Wifi,
  Coffee,
  Car,
  Search,
  ArrowLeft,
  Filter,
  Grid3x3,
  List as ListIcon,
  Loader2,
  AlertCircle,
  ChevronDown,
  X,
  Phone,
} from 'lucide-react';
import tourApi from '../services/tourApi';
import type { Accommodation } from '../services/types';

const AccommodationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalFiltered, setTotalFiltered] = useState(0); // 필터링된 전체 결과 수

  // 필터 상태
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>(''); // 숙박 타입
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('O'); // 정렬
  const [showFilters, setShowFilters] = useState(false);

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

  // 숙박 타입 (API 응답의 cat3 코드 기준 추정)
  const accommodationTypes = [
    { id: '', label: '전체', icon: Building2 },
    { id: 'hotel', label: '호텔', icon: Building2 },
    { id: 'motel', label: '모텔', icon: Building2 },
    { id: 'pension', label: '펜션', icon: Home },
    { id: 'guesthouse', label: '게스트하우스', icon: Home },
    { id: 'resort', label: '리조트', icon: Hotel },
  ];

  // 정렬 옵션
  const sortOptions = [
    { value: 'O', label: '기본순' },
    { value: 'P', label: '인기순' },
    { value: 'Q', label: '평점순' },
    { value: 'R', label: '리뷰순' },
  ];

  useEffect(() => {
    loadAccommodations(1);
  }, [selectedArea, sortBy]); // selectedType과 searchQuery는 제외 (클라이언트 사이드 필터링)

  const loadAccommodations = async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      console.log('숙박 검색:', {
        selectedArea,
        selectedType,
        sortBy,
        page,
        searchQuery,
      });

      // API 호출 - 많은 데이터를 가져오기
      const response = await tourApi.searchStay({
        areaCode: selectedArea || undefined,
        numOfRows: 100, // 더 많은 결과를 가져와서 클라이언트에서 필터링
        pageNo: page,
        arrange: sortBy as any,
      });

      console.log('숙박 검색 결과:', response);
      console.log(
        '결과 샘플 (처음 3개):',
        response.slice(0, 3).map((r) => ({
          title: r.title,
          addr1: r.addr1,
        }))
      );

      // 클라이언트 사이드 필터링
      let filtered = response;

      // 1. 숙박 타입 필터링 (더 유연하게)
      if (selectedType) {
        console.log('타입 필터 적용:', selectedType);
        filtered = filtered.filter((item) => {
          const title = item.title.toLowerCase();
          const addr = (item.addr1 || '').toLowerCase();
          const type = selectedType.toLowerCase();

          // 타입별 매칭 로직
          switch (type) {
            case 'hotel':
              return title.includes('호텔') || title.includes('hotel');
            case 'motel':
              return title.includes('모텔') || title.includes('motel');
            case 'pension':
              return title.includes('펜션') || title.includes('pension');
            case 'guesthouse':
              return (
                title.includes('게스트') ||
                title.includes('하우스') ||
                title.includes('guest') ||
                title.includes('house')
              );
            case 'resort':
              return title.includes('리조트') || title.includes('resort');
            default:
              return true;
          }
        });
        console.log('타입 필터 후 결과:', filtered.length);
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

      // 3. 페이지네이션 (클라이언트 사이드)
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedResults = filtered.slice(startIndex, endIndex);

      console.log('최종 표시 결과:', paginatedResults.length);
      console.log('전체 필터링된 결과:', filtered.length);

      setTotalFiltered(filtered.length); // 전체 필터링된 결과 수 저장
      setAccommodations(paginatedResults);
      setCurrentPage(page);
    } catch (err) {
      console.error('숙박 로드 실패:', err);
      setError('숙박 정보를 불러오는데 실패했습니다.');
      setAccommodations([]);
    } finally {
      setLoading(false);
    }
  };

  // 검색 핸들러
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    loadAccommodations(1);
  };

  // 필터 초기화
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedArea('');
    setSelectedType('');
    setSortBy('O');
    setCurrentPage(1);
    // 초기화 후 재로드
    setTimeout(() => loadAccommodations(1), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 border-b border-amber-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/')} className="rounded-lg p-2 transition-colors hover:bg-amber-100">
                <ArrowLeft className="h-6 w-6 text-amber-600" />
              </button>
              <div>
                <h1 className="flex items-center gap-2 bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 bg-clip-text text-3xl font-bold text-transparent">
                  <Hotel className="h-8 w-8 text-amber-600" />
                  숙박 검색
                </h1>
                <p className="mt-1 text-sm text-gray-600">완벽한 휴식을 위한 숙소를 찾아보세요</p>
              </div>
            </div>

            {/* 뷰 모드 전환 */}
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-white p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-lg p-2 transition-all ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
                    : 'text-gray-600 hover:bg-amber-50'
                }`}
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-lg p-2 transition-all ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
                    : 'text-gray-600 hover:bg-amber-50'
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
        <div className="mb-8 rounded-2xl border border-amber-100 bg-white/80 p-6 shadow-lg backdrop-blur-xl">
          {/* 검색바 */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="숙소명 또는 지역 검색..."
                className="w-full rounded-xl border border-amber-200 py-4 pr-4 pl-12 text-lg outline-none focus:border-transparent focus:ring-2 focus:ring-amber-500"
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

          {/* 숙박 타입 선택 */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">숙박 타입</h3>
            <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
              {accommodationTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type.id);
                      // 타입 변경 시 페이지 1로 리셋하고 재로드
                      setTimeout(() => loadAccommodations(1), 0);
                    }}
                    className={`rounded-xl border-2 p-4 transition-all ${
                      selectedType === type.id
                        ? 'border-amber-600 bg-amber-50 text-amber-600'
                        : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                    }`}
                  >
                    <Icon className="mx-auto mb-2 h-6 w-6" />
                    <p className="text-sm font-medium">{type.label}</p>
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
                className="w-full rounded-xl border border-amber-200 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-amber-500"
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
                className="w-full rounded-xl border border-amber-200 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-amber-500"
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
          <div className="mt-4 border-t border-amber-100 pt-4">
            <p className="text-sm text-gray-600">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  검색 중...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Hotel className="h-4 w-4 text-amber-600" />
                  <span className="font-semibold text-amber-600">{totalFiltered}개</span>의 숙소를 찾았습니다
                  {totalFiltered > itemsPerPage && (
                    <span className="text-gray-500">(현재 페이지: {accommodations.length}개)</span>
                  )}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-amber-600" />
          </div>
        )}

        {/* 에러 */}
        {error && !loading && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-600" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => loadAccommodations(1)}
              className="mt-4 rounded-xl bg-red-600 px-6 py-2 text-white transition-colors hover:bg-red-700"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 결과 없음 */}
        {!loading && !error && accommodations.length === 0 && (
          <div className="rounded-2xl border border-amber-100 bg-white/80 p-12 text-center backdrop-blur-xl">
            <Hotel className="mx-auto mb-4 h-16 w-16 text-amber-300" />
            <h3 className="mb-2 text-xl font-bold text-gray-900">검색 결과가 없습니다</h3>
            <p className="text-gray-600">다른 지역이나 조건으로 검색해보세요</p>
          </div>
        )}

        {/* 그리드 뷰 */}
        {!loading && !error && accommodations.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {accommodations.map((accommodation, index) => (
              <div
                key={accommodation.contentid || index}
                onClick={() => navigate(`/detail/${accommodation.contentid}`)}
                className="group transform cursor-pointer overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-amber-300 hover:shadow-2xl"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                {/* 이미지 */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100">
                  <img
                    src={
                      accommodation.firstimage ||
                      accommodation.firstimage2 ||
                      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
                    }
                    alt={accommodation.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                {/* 정보 */}
                <div className="p-6">
                  <h3 className="mb-3 line-clamp-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-amber-600">
                    {accommodation.title}
                  </h3>

                  <div className="space-y-2 text-sm text-gray-600">
                    {/* 주소 */}
                    {accommodation.addr1 && (
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 flex-shrink-0 text-amber-600" />
                        <span className="line-clamp-1">{accommodation.addr1}</span>
                      </p>
                    )}

                    {/* 전화번호 */}
                    {accommodation.tel && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 flex-shrink-0 text-amber-600" />
                        <span>{accommodation.tel}</span>
                      </p>
                    )}
                  </div>

                  {/* 편의시설 아이콘 (예시) */}
                  <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                      <Wifi className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                      <Coffee className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                      <Car className="h-4 w-4 text-amber-600" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 리스트 뷰 */}
        {!loading && !error && accommodations.length > 0 && viewMode === 'list' && (
          <div className="space-y-4">
            {accommodations.map((accommodation, index) => (
              <div
                key={accommodation.contentid || index}
                onClick={() => navigate(`/detail/${accommodation.contentid}`)}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-amber-100 bg-white/80 shadow-lg backdrop-blur-xl transition-all hover:border-amber-300 hover:shadow-2xl"
              >
                <div className="flex flex-col md:flex-row">
                  {/* 이미지 */}
                  <div className="relative h-48 flex-shrink-0 overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100 md:h-auto md:w-80">
                    <img
                      src={
                        accommodation.firstimage ||
                        accommodation.firstimage2 ||
                        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
                      }
                      alt={accommodation.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
                      }}
                    />
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 p-6">
                    <h3 className="mb-4 text-2xl font-bold text-gray-900 transition-colors group-hover:text-amber-600">
                      {accommodation.title}
                    </h3>

                    <div className="space-y-3 text-gray-600">
                      {accommodation.addr1 && (
                        <p className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-amber-600" />
                          {accommodation.addr1}
                        </p>
                      )}
                      {accommodation.tel && (
                        <p className="flex items-center gap-2">
                          <Phone className="h-5 w-5 text-amber-600" />
                          {accommodation.tel}
                        </p>
                      )}
                    </div>

                    {/* 편의시설 */}
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1">
                        <Wifi className="h-4 w-4 text-amber-600" />
                        <span className="text-sm text-gray-700">WiFi</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1">
                        <Coffee className="h-4 w-4 text-amber-600" />
                        <span className="text-sm text-gray-700">조식</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1">
                        <Car className="h-4 w-4 text-amber-600" />
                        <span className="text-sm text-gray-700">주차</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {!loading && !error && accommodations.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadAccommodations(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg border border-amber-300 px-4 py-2 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                      onClick={() => loadAccommodations(1)}
                      className="rounded-lg border border-amber-300 px-4 py-2 transition-colors hover:bg-amber-50"
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
                      onClick={() => loadAccommodations(i)}
                      disabled={i === currentPage}
                      className={`rounded-lg px-4 py-2 transition-colors ${
                        i === currentPage
                          ? 'bg-gradient-to-r from-amber-600 to-orange-600 font-semibold text-white'
                          : 'border border-amber-300 hover:bg-amber-50'
                      }`}
                    >
                      {i}
                    </button>
                  );
                }

                return pageButtons;
              })()}

              <button
                onClick={() => loadAccommodations(currentPage + 1)}
                disabled={currentPage * itemsPerPage >= totalFiltered}
                className="rounded-lg border border-amber-300 px-4 py-2 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
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

export default AccommodationPage;
