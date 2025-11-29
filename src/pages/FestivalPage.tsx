import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  Search,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import tourApi from '../services/tourApi';
import type { Festival } from '../services/types';

const FestivalPage: React.FC = () => {
  const navigate = useNavigate();

  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 필터 상태
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [viewMode, setViewMode] = useState<'calendar' | 'grid'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

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

  // 월 목록
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    loadFestivals();
  }, [selectedMonth, selectedYear, selectedArea]);

  const loadFestivals = async () => {
    try {
      setLoading(true);
      setError(null);

      // 선택한 월의 시작일과 종료일
      const startDate = `${selectedYear}${String(selectedMonth).padStart(2, '0')}01`;
      const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
      const endDate = `${selectedYear}${String(selectedMonth).padStart(2, '0')}${String(lastDay).padStart(2, '0')}`;

      console.log('축제 검색:', { startDate, endDate, selectedArea });

      const response = await tourApi.searchFestival({
        eventStartDate: startDate,
        eventEndDate: endDate,
        areaCode: selectedArea || undefined,
        numOfRows: 100,
        pageNo: 1,
        arrange: 'P', // 인기순
      });

      console.log('축제 검색 결과:', response);
      setFestivals(response);
    } catch (err) {
      console.error('축제 로드 실패:', err);
      setError('축제 정보를 불러오는데 실패했습니다.');
      setFestivals([]);
    } finally {
      setLoading(false);
    }
  };

  // 월 변경
  const changeMonth = (delta: number) => {
    let newMonth = selectedMonth + delta;
    let newYear = selectedYear;

    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  // 검색 필터링
  const filteredFestivals = festivals.filter((festival) => {
    if (!searchQuery.trim()) return true;
    return festival.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // 축제 상태 확인
  const getFestivalStatus = (festival: Festival): 'upcoming' | 'ongoing' | 'ended' => {
    const today = new Date();
    const startDate = festival.eventstartdate
      ? new Date(
          parseInt(festival.eventstartdate.substring(0, 4)),
          parseInt(festival.eventstartdate.substring(4, 6)) - 1,
          parseInt(festival.eventstartdate.substring(6, 8))
        )
      : null;
    const endDate = festival.eventenddate
      ? new Date(
          parseInt(festival.eventenddate.substring(0, 4)),
          parseInt(festival.eventenddate.substring(4, 6)) - 1,
          parseInt(festival.eventenddate.substring(6, 8))
        )
      : null;

    if (!startDate || !endDate) return 'upcoming';

    if (today < startDate) return 'upcoming';
    if (today > endDate) return 'ended';
    return 'ongoing';
  };

  // 날짜 포맷팅
  const formatDate = (dateStr: string): string => {
    if (!dateStr || dateStr.length < 8) return '';
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}.${month}.${day}`;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 border-b border-purple-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/')} className="rounded-lg p-2 transition-colors hover:bg-purple-100">
                <ArrowLeft className="h-6 w-6 text-purple-600" />
              </button>
              <div>
                <h1 className="flex items-center gap-2 bg-linear-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-3xl font-bold text-transparent">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                  축제 & 행사
                </h1>
                <p className="mt-1 text-sm text-gray-600">전국의 다채로운 축제와 행사를 한눈에</p>
              </div>
            </div>

            {/* 뷰 모드 전환 */}
            <div className="flex items-center gap-2 rounded-xl border border-purple-200 bg-white p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-lg p-2 transition-all ${
                  viewMode === 'grid'
                    ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white'
                    : 'text-gray-600 hover:bg-purple-50'
                }`}
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`rounded-lg p-2 transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white'
                    : 'text-gray-600 hover:bg-purple-50'
                }`}
              >
                <CalendarIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 필터 섹션 */}
        <div className="mb-8 rounded-2xl border border-purple-100 bg-white/80 p-6 shadow-lg backdrop-blur-xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* 검색 */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="축제명 검색..."
                  className="w-full rounded-xl border border-purple-200 py-3 pr-4 pl-12 outline-none focus:border-transparent focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* 월 선택 */}
            <div className="flex items-center gap-2">
              <button onClick={() => changeMonth(-1)} className="rounded-lg p-2 transition-colors hover:bg-purple-100">
                <ChevronLeft className="h-5 w-5 text-purple-600" />
              </button>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="flex-1 rounded-xl border border-purple-200 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-purple-500"
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {selectedYear}년 {month}월
                  </option>
                ))}
              </select>
              <button onClick={() => changeMonth(1)} className="rounded-lg p-2 transition-colors hover:bg-purple-100">
                <ChevronRight className="h-5 w-5 text-purple-600" />
              </button>
            </div>

            {/* 지역 선택 */}
            <div>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full rounded-xl border border-purple-200 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-purple-500"
              >
                {areas.map((area) => (
                  <option key={area.code} value={area.code}>
                    📍 {area.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 결과 카운트 */}
          <div className="mt-4 border-t border-purple-100 pt-4">
            <p className="text-sm text-gray-600">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  검색 중...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span className="font-semibold text-purple-600">{filteredFestivals.length}개</span>의 축제가 있습니다
                </span>
              )}
            </p>
          </div>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
          </div>
        )}

        {/* 에러 상태 */}
        {error && !loading && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-600" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadFestivals}
              className="mt-4 rounded-xl bg-red-600 px-6 py-2 text-white transition-colors hover:bg-red-700"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 결과 없음 */}
        {!loading && !error && filteredFestivals.length === 0 && (
          <div className="rounded-2xl border border-purple-100 bg-white/80 p-12 text-center backdrop-blur-xl">
            <CalendarIcon className="mx-auto mb-4 h-16 w-16 text-purple-300" />
            <h3 className="mb-2 text-xl font-bold text-gray-900">검색 결과가 없습니다</h3>
            <p className="text-gray-600">다른 월이나 지역을 선택해보세요</p>
          </div>
        )}

        {/* 그리드 뷰 */}
        {!loading && !error && filteredFestivals.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFestivals.map((festival, index) => {
              const status = getFestivalStatus(festival);

              return (
                <div
                  key={festival.contentid || index}
                  onClick={() => navigate(`/detail/${festival.contentid}`)}
                  className="group transform cursor-pointer overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-purple-300 hover:shadow-2xl"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {/* 이미지 */}
                  <div className="relative aspect-4/3 overflow-hidden bg-linear-to-br from-purple-100 to-pink-100">
                    <img
                      src={
                        festival.firstimage ||
                        festival.firstimage2 ||
                        'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800'
                      }
                      alt={festival.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800';
                      }}
                    />

                    {/* 상태 배지 */}
                    <div className="absolute top-4 right-4">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold backdrop-blur-sm ${
                          status === 'ongoing'
                            ? 'bg-green-500/90 text-white'
                            : status === 'upcoming'
                              ? 'bg-blue-500/90 text-white'
                              : 'bg-gray-500/90 text-white'
                        }`}
                      >
                        {status === 'ongoing' ? '🎉 진행중' : status === 'upcoming' ? '📅 예정' : '종료'}
                      </span>
                    </div>

                    {/* 그라디언트 오버레이 */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                  </div>

                  {/* 정보 */}
                  <div className="p-6">
                    <h3 className="mb-3 line-clamp-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-purple-600">
                      {festival.title}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-600">
                      {/* 날짜 */}
                      {festival.eventstartdate && festival.eventenddate && (
                        <p className="flex items-center gap-2">
                          <Clock className="h-4 w-4 shrink-0 text-purple-600" />
                          <span className="line-clamp-1">
                            {formatDate(festival.eventstartdate)} ~ {formatDate(festival.eventenddate)}
                          </span>
                        </p>
                      )}

                      {/* 장소 */}
                      {festival.addr1 && (
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0 text-purple-600" />
                          <span className="line-clamp-1">{festival.addr1}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 캘린더 뷰 */}
        {!loading && !error && filteredFestivals.length > 0 && viewMode === 'calendar' && (
          <div className="rounded-2xl border border-purple-100 bg-white/80 p-6 backdrop-blur-xl">
            <div className="space-y-4">
              {filteredFestivals.map((festival, index) => {
                const status = getFestivalStatus(festival);

                return (
                  <div
                    key={festival.contentid || index}
                    onClick={() => navigate(`/detail/${festival.contentid}`)}
                    className="group flex cursor-pointer gap-4 rounded-xl border border-transparent p-4 transition-all hover:border-purple-300 hover:bg-purple-50"
                  >
                    {/* 날짜 박스 */}
                    <div className="h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-linear-to-br from-purple-600 to-pink-600 text-white">
                      <span className="text-2xl font-bold">{festival.eventstartdate?.substring(6, 8) || '00'}</span>
                      <span className="text-xs">{festival.eventstartdate?.substring(4, 6) || '00'}월</span>
                    </div>

                    {/* 정보 */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-start justify-between gap-4">
                        <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-purple-600">
                          {festival.title}
                        </h3>
                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                            status === 'ongoing'
                              ? 'bg-green-100 text-green-700'
                              : status === 'upcoming'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {status === 'ongoing' ? '진행중' : status === 'upcoming' ? '예정' : '종료'}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        {festival.eventstartdate && festival.eventenddate && (
                          <p className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-purple-600" />
                            {formatDate(festival.eventstartdate)} ~ {formatDate(festival.eventenddate)}
                          </p>
                        )}
                        {festival.addr1 && (
                          <p className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-purple-600" />
                            {festival.addr1}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 애니메이션 키프레임 */}
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

export default FestivalPage;
