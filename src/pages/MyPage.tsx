import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Heart,
  History,
  Calendar,
  ArrowLeft,
  MapPin,
  Hotel,
  Utensils,
  Camera,
  Sparkles,
  Trash2,
  ExternalLink,
  Edit3,
  Save,
  X,
  Mail,
  Phone,
  MapPinned,
  Award,
  TrendingUp,
  Clock,
  Star,
} from 'lucide-react';
import type { TourItem } from '../services/types';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  avatar?: string;
  joinDate: string;
}

interface FavoriteItem extends TourItem {
  savedAt: string;
}

interface SearchHistory {
  id: string;
  query: string;
  timestamp: string;
}

interface TripStats {
  totalTrips: number;
  totalDays: number;
  totalBudget: number; // 실제 사용 예산
  plannedBudget: number; // 계획된 예산
  visitedCities: string[];
}

const MyPage: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'favorites' | 'history' | 'trips' | 'stats'>('profile');
  const [isEditing, setIsEditing] = useState(false);

  // 프로필
  const [profile, setProfile] = useState<UserProfile>({
    name: '여행자',
    email: 'traveler@example.com',
    phone: '010-1234-5678',
    location: '서울',
    bio: '여행을 사랑하는 여행자입니다',
    joinDate: '2024-01-01',
  });

  const [editProfile, setEditProfile] = useState<UserProfile>(profile);

  // 즐겨찾기
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // 검색 기록
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);

  // 여행 통계
  const [tripStats, setTripStats] = useState<TripStats>({
    totalTrips: 0,
    totalDays: 0,
    totalBudget: 0,
    plannedBudget: 0,
    visitedCities: [],
  });

  // 로컬스토리지에서 데이터 로드
  useEffect(() => {
    loadAllData();
  }, []);

  // 데이터 로드 함수
  const loadAllData = () => {
    // 프로필
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile(parsed);
      setEditProfile(parsed);
    }

    // 즐겨찾기
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    // 검색 기록
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }

    // 여행 통계
    const savedTrips = localStorage.getItem('myTrips');
    if (savedTrips) {
      const trips = JSON.parse(savedTrips);
      calculateStats(trips);
    }
  };

  // 페이지 포커스 시 데이터 새로고침 (다른 페이지에서 돌아올 때)
  useEffect(() => {
    const handleFocus = () => {
      loadAllData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // 여행 통계 계산
  const calculateStats = (trips: any[]) => {
    const totalTrips = trips.length;
    const totalDays = trips.reduce((sum, trip) => sum + trip.days.length, 0);

    // 계획된 예산 (각 여행의 budget 필드 합계)
    const plannedBudget = trips.reduce((sum, trip) => sum + (trip.budget || 0), 0);

    // 실제 사용한 예산 (각 일정 아이템의 budget 합계)
    const totalBudget = trips.reduce((sum, trip) => {
      const tripBudget = trip.days.reduce((daySum: number, day: any) => {
        const dayBudget = day.items.reduce((itemSum: number, item: any) => {
          return itemSum + (item.budget || 0);
        }, 0);
        return daySum + dayBudget;
      }, 0);
      return sum + tripBudget;
    }, 0);

    const cities = new Set<string>();
    trips.forEach((trip) => {
      // 여행 제목에서 도시명 추출 (간단한 예시)
      const title = trip.title.toLowerCase();
      if (title.includes('서울')) cities.add('서울');
      if (title.includes('부산')) cities.add('부산');
      if (title.includes('제주')) cities.add('제주');
      if (title.includes('강릉')) cities.add('강릉');
      if (title.includes('전주')) cities.add('전주');
      if (title.includes('경주')) cities.add('경주');
      if (title.includes('여수')) cities.add('여수');
      if (title.includes('속초')) cities.add('속초');
    });

    setTripStats({
      totalTrips,
      totalDays,
      totalBudget,
      plannedBudget,
      visitedCities: Array.from(cities),
    });
  };

  // 프로필 저장
  const saveProfile = () => {
    setProfile(editProfile);
    localStorage.setItem('userProfile', JSON.stringify(editProfile));
    setIsEditing(false);
  };

  // 즐겨찾기 삭제
  const removeFavorite = (contentId: string) => {
    const updated = favorites.filter((item) => item.contentid !== contentId);
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  // 검색 기록 삭제
  const removeSearchHistory = (id: string) => {
    const updated = searchHistory.filter((item) => item.id !== id);
    setSearchHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
  };

  // 검색 기록 전체 삭제
  const clearSearchHistory = () => {
    if (confirm('모든 검색 기록을 삭제하시겠습니까?')) {
      setSearchHistory([]);
      localStorage.setItem('searchHistory', JSON.stringify([]));
    }
  };

  // 탭 메뉴
  const tabs = [
    { id: 'profile', label: '프로필', icon: User },
    { id: 'favorites', label: '즐겨찾기', icon: Heart, count: favorites.length },
    { id: 'history', label: '검색 기록', icon: History, count: searchHistory.length },
    { id: 'trips', label: '내 여행', icon: Calendar, count: tripStats.totalTrips },
    { id: 'stats', label: '통계', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 border-b border-indigo-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/')} className="rounded-lg p-2 transition-colors hover:bg-indigo-100">
                <ArrowLeft className="h-6 w-6 text-indigo-600" />
              </button>
              <div>
                <h1 className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent">
                  <User className="h-8 w-8 text-indigo-600" />
                  마이페이지
                </h1>
                <p className="mt-1 text-sm text-gray-600">나의 여행 정보를 관리하세요</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* 사이드바 - 탭 메뉴 */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 rounded-2xl border border-indigo-100 bg-white/80 p-6 shadow-lg backdrop-blur-xl">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex w-full items-center justify-between rounded-xl p-4 transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{tab.label}</span>
                      </div>
                      {tab.count !== undefined && tab.count > 0 && (
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600'
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 빠른 링크 */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">빠른 이동</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/my-trip')}
                    className="flex w-full items-center gap-2 rounded-lg p-2 text-sm text-gray-600 transition-colors hover:bg-gray-100"
                  >
                    <Calendar className="h-4 w-4" />
                    여행 계획
                  </button>
                  <button
                    onClick={() => navigate('/destinations')}
                    className="flex w-full items-center gap-2 rounded-lg p-2 text-sm text-gray-600 transition-colors hover:bg-gray-100"
                  >
                    <MapPin className="h-4 w-4" />
                    여행지 탐색
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 메인 - 콘텐츠 */}
          <div className="lg:col-span-3">
            {/* 프로필 탭 */}
            {activeTab === 'profile' && (
              <div className="rounded-2xl border border-indigo-100 bg-white/80 p-8 shadow-lg backdrop-blur-xl">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">프로필</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
                    >
                      <Edit3 className="h-4 w-4" />
                      수정
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditProfile(profile);
                          setIsEditing(false);
                        }}
                        className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 transition-colors hover:bg-gray-200"
                      >
                        <X className="h-4 w-4" />
                        취소
                      </button>
                      <button
                        onClick={saveProfile}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
                      >
                        <Save className="h-4 w-4" />
                        저장
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {/* 아바타 */}
                  <div className="flex items-center gap-6">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-3xl font-bold text-white">
                      {profile.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{profile.name}</h3>
                      <p className="text-gray-600">회원 가입: {new Date(profile.joinDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* 프로필 정보 */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        <User className="mr-1 inline h-4 w-4" />
                        이름
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editProfile.name}
                          onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <p className="rounded-xl bg-gray-50 px-4 py-3 text-gray-900">{profile.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        <Mail className="mr-1 inline h-4 w-4" />
                        이메일
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editProfile.email}
                          onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })}
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <p className="rounded-xl bg-gray-50 px-4 py-3 text-gray-900">{profile.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        <Phone className="mr-1 inline h-4 w-4" />
                        전화번호
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editProfile.phone}
                          onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <p className="rounded-xl bg-gray-50 px-4 py-3 text-gray-900">{profile.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        <MapPinned className="mr-1 inline h-4 w-4" />
                        위치
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editProfile.location}
                          onChange={(e) => setEditProfile({ ...editProfile, location: e.target.value })}
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <p className="rounded-xl bg-gray-50 px-4 py-3 text-gray-900">{profile.location}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">소개</label>
                    {isEditing ? (
                      <textarea
                        value={editProfile.bio}
                        onChange={(e) => setEditProfile({ ...editProfile, bio: e.target.value })}
                        rows={4}
                        className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="rounded-xl bg-gray-50 px-4 py-3 text-gray-900">{profile.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 즐겨찾기 탭 */}
            {activeTab === 'favorites' && (
              <div className="rounded-2xl border border-indigo-100 bg-white/80 p-8 shadow-lg backdrop-blur-xl">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                    <Heart className="h-6 w-6 text-red-500" />
                    즐겨찾기
                  </h2>
                  <span className="text-sm text-gray-600">{favorites.length}개</span>
                </div>

                {favorites.length === 0 ? (
                  <div className="py-12 text-center">
                    <Heart className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                    <p className="text-gray-500">아직 즐겨찾기한 여행지가 없습니다</p>
                    <button
                      onClick={() => navigate('/destinations')}
                      className="mt-4 rounded-lg bg-indigo-600 px-6 py-2 text-white transition-colors hover:bg-indigo-700"
                    >
                      여행지 둘러보기
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {favorites.map((item) => (
                      <div
                        key={item.contentid}
                        className="group overflow-hidden rounded-xl border border-gray-200 bg-gray-50 transition-all hover:bg-gray-100"
                      >
                        <div className="flex gap-3 p-4">
                          {item.firstimage && (
                            <img src={item.firstimage} alt={item.title} className="h-24 w-24 rounded-lg object-cover" />
                          )}
                          <div className="flex-1">
                            <h3 className="mb-2 line-clamp-2 font-bold text-gray-900">{item.title}</h3>
                            {item.addr1 && (
                              <p className="mb-2 flex items-center gap-1 text-sm text-gray-600">
                                <MapPin className="h-3 w-3" />
                                {item.addr1}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              저장일: {new Date(item.savedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => navigate(`/detail/${item.contentid}`)}
                              className="rounded-lg p-2 text-indigo-600 transition-colors hover:bg-indigo-50"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => removeFavorite(item.contentid)}
                              className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 검색 기록 탭 */}
            {activeTab === 'history' && (
              <div className="rounded-2xl border border-indigo-100 bg-white/80 p-8 shadow-lg backdrop-blur-xl">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                    <History className="h-6 w-6 text-indigo-600" />
                    검색 기록
                  </h2>
                  {searchHistory.length > 0 && (
                    <button
                      onClick={clearSearchHistory}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      전체 삭제
                    </button>
                  )}
                </div>

                {searchHistory.length === 0 ? (
                  <div className="py-12 text-center">
                    <History className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                    <p className="text-gray-500">검색 기록이 없습니다</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {searchHistory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{item.query}</span>
                          <span className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</span>
                        </div>
                        <button
                          onClick={() => removeSearchHistory(item.id)}
                          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 내 여행 탭 */}
            {activeTab === 'trips' && (
              <div className="rounded-2xl border border-indigo-100 bg-white/80 p-8 shadow-lg backdrop-blur-xl">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                    <Calendar className="h-6 w-6 text-indigo-600" />내 여행
                  </h2>
                  <button
                    onClick={() => navigate('/my-trip')}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
                  >
                    <Calendar className="h-4 w-4" />
                    여행 관리
                  </button>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 p-6 text-white">
                    <div className="mb-2 flex items-center justify-between">
                      <Calendar className="h-8 w-8" />
                      <span className="text-3xl font-bold">{tripStats.totalTrips}</span>
                    </div>
                    <p className="text-sm text-white/80">총 여행 수</p>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-white">
                    <div className="mb-2 flex items-center justify-between">
                      <Clock className="h-8 w-8" />
                      <span className="text-3xl font-bold">{tripStats.totalDays}</span>
                    </div>
                    <p className="text-sm text-white/80">총 여행 일수</p>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 p-6 text-white">
                    <div className="mb-2 flex items-center justify-between">
                      <MapPinned className="h-8 w-8" />
                      <span className="text-3xl font-bold">{tripStats.visitedCities.length}</span>
                    </div>
                    <p className="text-sm text-white/80">방문 도시</p>
                  </div>
                </div>

                {tripStats.visitedCities.length > 0 && (
                  <div className="rounded-xl bg-gray-50 p-6">
                    <h3 className="mb-3 font-bold text-gray-900">방문한 도시</h3>
                    <div className="flex flex-wrap gap-2">
                      {tripStats.visitedCities.map((city) => (
                        <span
                          key={city}
                          className="rounded-full border border-indigo-200 bg-white px-3 py-1 text-sm font-medium text-indigo-600"
                        >
                          {city}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 통계 탭 */}
            {activeTab === 'stats' && (
              <div className="rounded-2xl border border-indigo-100 bg-white/80 p-8 shadow-lg backdrop-blur-xl">
                <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                  여행 통계
                </h2>

                <div className="space-y-6">
                  {/* 예산 카드 */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* 계획된 예산 */}
                    <div className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white">
                      <div className="mb-2 flex items-center justify-between">
                        <Award className="h-8 w-8" />
                        <span className="text-2xl font-bold">{tripStats.plannedBudget.toLocaleString()}원</span>
                      </div>
                      <p className="text-sm text-white/80">계획된 예산</p>
                    </div>

                    {/* 실제 사용 예산 */}
                    <div className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
                      <div className="mb-2 flex items-center justify-between">
                        <Award className="h-8 w-8" />
                        <span className="text-2xl font-bold">{tripStats.totalBudget.toLocaleString()}원</span>
                      </div>
                      <p className="text-sm text-white/80">실제 사용 예산</p>
                    </div>

                    {/* 남은 예산 */}
                    <div
                      className={`bg-gradient-to-r ${
                        tripStats.plannedBudget - tripStats.totalBudget >= 0
                          ? 'from-purple-500 to-pink-500'
                          : 'from-red-500 to-orange-500'
                      } rounded-xl p-6 text-white`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <Award className="h-8 w-8" />
                        <span className="text-2xl font-bold">
                          {(tripStats.plannedBudget - tripStats.totalBudget).toLocaleString()}원
                        </span>
                      </div>
                      <p className="text-sm text-white/80">
                        {tripStats.plannedBudget - tripStats.totalBudget >= 0 ? '남은 예산' : '초과 예산'}
                      </p>
                    </div>
                  </div>

                  {/* 뱃지 */}
                  <div>
                    <h3 className="mb-4 font-bold text-gray-900">여행 뱃지</h3>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div
                        className={`rounded-xl p-4 text-center ${
                          tripStats.totalTrips >= 1 ? 'border-2 border-indigo-600 bg-indigo-50' : 'bg-gray-100'
                        }`}
                      >
                        <div
                          className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${
                            tripStats.totalTrips >= 1 ? 'bg-indigo-600' : 'bg-gray-300'
                          }`}
                        >
                          <Camera className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-xs font-semibold">첫 여행</p>
                      </div>

                      <div
                        className={`rounded-xl p-4 text-center ${
                          tripStats.totalTrips >= 5 ? 'border-2 border-purple-600 bg-purple-50' : 'bg-gray-100'
                        }`}
                      >
                        <div
                          className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${
                            tripStats.totalTrips >= 5 ? 'bg-purple-600' : 'bg-gray-300'
                          }`}
                        >
                          <Star className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-xs font-semibold">여행 마니아</p>
                      </div>

                      <div
                        className={`rounded-xl p-4 text-center ${
                          tripStats.visitedCities.length >= 5 ? 'border-2 border-pink-600 bg-pink-50' : 'bg-gray-100'
                        }`}
                      >
                        <div
                          className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${
                            tripStats.visitedCities.length >= 5 ? 'bg-pink-600' : 'bg-gray-300'
                          }`}
                        >
                          <MapPinned className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-xs font-semibold">도시 탐험가</p>
                      </div>

                      <div
                        className={`rounded-xl p-4 text-center ${
                          tripStats.totalDays >= 30 ? 'border-2 border-yellow-600 bg-yellow-50' : 'bg-gray-100'
                        }`}
                      >
                        <div
                          className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${
                            tripStats.totalDays >= 30 ? 'bg-yellow-600' : 'bg-gray-300'
                          }`}
                        >
                          <Award className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-xs font-semibold">여행 달인</p>
                      </div>
                    </div>
                  </div>

                  {/* 활동 요약 */}
                  <div className="rounded-xl bg-gray-50 p-6">
                    <h3 className="mb-4 font-bold text-gray-900">활동 요약</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">즐겨찾기</span>
                        <span className="font-semibold text-gray-900">{favorites.length}개</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">검색 기록</span>
                        <span className="font-semibold text-gray-900">{searchHistory.length}개</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">계획한 여행</span>
                        <span className="font-semibold text-gray-900">{tripStats.totalTrips}개</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
