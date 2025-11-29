import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, X, Loader2, AlertCircle, Grid, List } from 'lucide-react';
import tourApi from '../services/tourApi';
import type { TourItem } from '../services/types';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<TourItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // 필터 상태
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('O'); // O: 제목순 (기본)

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [searchType, setSearchType] = useState<'keyword' | 'category'>('keyword');

  // 카테고리 목록
  const categories = [
    { id: '', label: '전체' },
    { id: '12', label: '관광지' },
    { id: '14', label: '문화시설' },
    { id: '15', label: '축제/행사' },
    { id: '25', label: '여행코스' },
    { id: '28', label: '레포츠' },
    { id: '32', label: '숙박' },
    { id: '38', label: '쇼핑' },
    { id: '39', label: '음식점' },
  ];

  // 지역 목록 (주요 지역만)
  const areas = [
    { code: '', name: '전체' },
    { code: '1', name: '서울' },
    { code: '2', name: '인천' },
    { code: '3', name: '대전' },
    { code: '4', name: '대구' },
    { code: '5', name: '광주' },
    { code: '6', name: '부산' },
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

  // 정렬 옵션
  const sortOptions = [
    { value: 'O', label: '제목순' },
    { value: 'P', label: '인기순' },
    { value: 'Q', label: '평점순' },
    { value: 'R', label: '리뷰순' },
    { value: 'C', label: '수정일순' },
  ];

  // URL 파라미터 변경 시 검색 실행
  useEffect(() => {
    const q = searchParams.get('q');
    const category = searchParams.get('category');

    if (q) {
      setQuery(q);
      setSearchType('keyword');
      performSearch(q, 1);
    } else if (category) {
      // 카테고리만 있는 경우
      setSelectedCategory(category);
      setSearchType('category');
      performCategorySearch(category, 1);
    }
  }, [searchParams]);

  // 카테고리 검색
  const performCategorySearch = async (categoryId: string, page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      console.log('카테고리 검색:', { categoryId, page, selectedArea, sortBy });

      const response = await tourApi.getAreaBasedList({
        contentTypeId: categoryId,
        areaCode: selectedArea || undefined,
        numOfRows: itemsPerPage,
        pageNo: page,
        arrange: sortBy as any,
      });

      console.log('카테고리 검색 결과:', response);

      setResults(response);
      setTotalCount(response.length);
      setCurrentPage(page);

      // 카테고리 이름을 쿼리에 표시
      const categoryName = getCategoryName(categoryId);
      setQuery(categoryName);
    } catch (err) {
      console.error('카테고리 검색 실패:', err);
      setError('검색 중 오류가 발생했습니다. 다시 시도해주세요.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // 검색 실행
  const performSearch = async (searchQuery: string, page: number = 1) => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);

      console.log('키워드 검색:', { searchQuery, page, selectedCategory, selectedArea, sortBy });

      const response = await tourApi.searchKeyword({
        keyword: searchQuery,
        contentTypeId: selectedCategory || undefined,
        areaCode: selectedArea || undefined,
        numOfRows: itemsPerPage,
        pageNo: page,
        arrange: sortBy as any,
      });

      console.log('키워드 검색 결과:', response);

      setResults(response);
      setTotalCount(response.length); // API가 totalCount를 제공하지 않으면 임시로 결과 개수 사용
      setCurrentPage(page);
    } catch (err) {
      console.error('검색 실패:', err);
      setError('검색 중 오류가 발생했습니다. 다시 시도해주세요.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // 검색 핸들러
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  // 필터 변경 시 재검색 (페이지는 1로 리셋)
  useEffect(() => {
    if (query && searchType === 'keyword') {
      console.log('필터 변경으로 재검색:', { selectedCategory, selectedArea, sortBy });
      performSearch(query, 1);
    } else if (selectedCategory && searchType === 'category') {
      console.log('필터 변경으로 카테고리 재검색:', { selectedCategory, selectedArea, sortBy });
      performCategorySearch(selectedCategory, 1);
    }
  }, [selectedCategory, selectedArea, sortBy]);

  // 카테고리 이름 가져오기
  const getCategoryName = (typeId: string): string => {
    const category = categories.find((cat) => cat.id === typeId);
    return category ? category.label : '기타';
  };

  // 상세 페이지로 이동
  const handleItemClick = (item: TourItem) => {
    navigate(`/detail/${item.contentid}`, { state: { item } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 검색 헤더 */}
      <div className="sticky top-0 z-40 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          {/* 로고 및 검색바 */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent transition-opacity hover:opacity-80"
            >
              한국여행
            </button>

            <form onSubmit={handleSearch} className="max-w-2xl flex-1">
              <div className="relative">
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="여행지, 축제, 맛집 검색..."
                  className="w-full rounded-xl border border-gray-300 py-3 pr-4 pl-12 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </form>

            <button
              onClick={handleSearch}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:shadow-lg"
            >
              검색
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 필터 및 정렬 */}
        <div className="mb-6 space-y-4">
          {/* 검색 결과 헤더 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{query && `"${query}" 검색 결과`}</h1>
              {!loading && results.length > 0 && <p className="mt-1 text-gray-600">총 {results.length}개의 결과</p>}
            </div>

            {/* 뷰 모드 전환 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-lg p-2 ${
                  viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-lg p-2 ${
                  viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 필터 */}
          <div className="flex flex-wrap gap-3">
            {/* 카테고리 필터 */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* 지역 필터 */}
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {areas.map((area) => (
                <option key={area.code} value={area.code}>
                  {area.name}
                </option>
              ))}
            </select>

            {/* 정렬 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* 필터 초기화 */}
            {(selectedCategory || selectedArea) && (
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedArea('');
                }}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                <X className="h-4 w-4" />
                필터 초기화
              </button>
            )}
          </div>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
        )}

        {/* 에러 상태 */}
        {error && !loading && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" />
              <div>
                <h4 className="mb-1 font-semibold text-red-900">검색 실패</h4>
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={() => performSearch(query)}
                  className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  다시 시도
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 검색 결과 없음 */}
        {!loading && !error && query && results.length === 0 && (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">검색 결과가 없습니다</h3>
            <p className="text-gray-600">다른 검색어로 시도해보세요</p>
          </div>
        )}

        {/* 검색 결과 - 그리드 뷰 */}
        {!loading && !error && viewMode === 'grid' && results.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((item) => (
              <div
                key={item.contentid}
                onClick={() => handleItemClick(item)}
                className="group transform cursor-pointer overflow-hidden rounded-xl bg-white shadow-md transition-all hover:scale-105 hover:shadow-xl"
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-200">
                  <img
                    src={
                      item.firstimage ||
                      item.firstimage2 ||
                      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800'
                    }
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800';
                    }}
                  />
                </div>
                <div className="p-4">
                  <span className="mb-2 inline-block rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                    {getCategoryName(item.contenttypeid)}
                  </span>
                  <h3 className="mb-2 line-clamp-2 font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                    {item.title}
                  </h3>
                  <p className="flex items-center text-sm text-gray-600">
                    <MapPin className="mr-1 h-4 w-4 flex-shrink-0" />
                    <span className="line-clamp-1">{item.addr1 || '주소 정보 없음'}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 검색 결과 - 리스트 뷰 */}
        {!loading && !error && viewMode === 'list' && results.length > 0 && (
          <div className="space-y-4">
            {results.map((item) => (
              <div
                key={item.contentid}
                onClick={() => handleItemClick(item)}
                className="flex cursor-pointer overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-xl"
              >
                <div className="h-48 w-48 flex-shrink-0 bg-gray-200">
                  <img
                    src={
                      item.firstimage ||
                      item.firstimage2 ||
                      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800'
                    }
                    alt={item.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800';
                    }}
                  />
                </div>
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className="mb-2 inline-block rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                        {getCategoryName(item.contenttypeid)}
                      </span>
                      <h3 className="mb-2 text-xl font-bold text-gray-900 transition-colors hover:text-blue-600">
                        {item.title}
                      </h3>
                      <p className="mb-2 flex items-start text-gray-600">
                        <MapPin className="mt-1 mr-1 h-4 w-4 flex-shrink-0" />
                        <span>{item.addr1 || '주소 정보 없음'}</span>
                      </p>
                      {item.tel && <p className="text-sm text-gray-500">📞 {item.tel}</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {!loading && !error && results.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              {/* 이전 버튼 */}
              <button
                onClick={() => {
                  const nextPage = currentPage - 1;
                  console.log('이전 페이지:', nextPage, 'searchType:', searchType);
                  if (searchType === 'keyword') {
                    performSearch(query, nextPage);
                  } else {
                    performCategorySearch(selectedCategory, nextPage);
                  }
                }}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                이전
              </button>

              {/* 페이지 번호 버튼들 */}
              {(() => {
                // 현재 페이지 기준 앞뒤 2개씩 (총 5개)
                const pageButtons = [];
                const startPage = Math.max(1, currentPage - 2);
                const endPage = currentPage + 2;

                // 첫 페이지로 가기 (현재 페이지가 4 이상일 때만 표시)
                if (currentPage > 3) {
                  pageButtons.push(
                    <button
                      key={1}
                      onClick={() => {
                        console.log('페이지 이동:', 1, 'searchType:', searchType);
                        if (searchType === 'keyword') {
                          performSearch(query, 1);
                        } else {
                          performCategorySearch(selectedCategory, 1);
                        }
                      }}
                      className="rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50"
                    >
                      1
                    </button>
                  );

                  // ... 표시
                  if (currentPage > 4) {
                    pageButtons.push(
                      <span key="dots-start" className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                }

                // 페이지 번호 버튼 생성
                for (let i = startPage; i <= endPage; i++) {
                  pageButtons.push(
                    <button
                      key={i}
                      onClick={() => {
                        console.log('페이지 이동:', i, 'searchType:', searchType);
                        if (searchType === 'keyword') {
                          performSearch(query, i);
                        } else {
                          performCategorySearch(selectedCategory, i);
                        }
                      }}
                      disabled={i === currentPage}
                      className={`rounded-lg px-4 py-2 transition-colors ${
                        i === currentPage
                          ? 'bg-blue-600 font-semibold text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      } ${i === currentPage ? 'cursor-default' : ''}`}
                    >
                      {i}
                    </button>
                  );
                }

                return pageButtons;
              })()}

              {/* 다음 버튼 */}
              <button
                onClick={() => {
                  const nextPage = currentPage + 1;
                  console.log('다음 페이지:', nextPage, 'searchType:', searchType);
                  if (searchType === 'keyword') {
                    performSearch(query, nextPage);
                  } else {
                    performCategorySearch(selectedCategory, nextPage);
                  }
                }}
                disabled={results.length < itemsPerPage}
                className="rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
