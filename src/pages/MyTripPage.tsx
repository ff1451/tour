import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  MapPin,
  Clock,
  DollarSign,
  Users,
  ArrowLeft,
  Search,
  Loader2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Hotel,
  Utensils,
  Camera,
  ShoppingBag,
  Sparkles,
  Download,
  Share2,
} from 'lucide-react';
import tourApi from '../services/tourApi';
import type { TourItem } from '../services/types';

interface TripDay {
  id: string;
  date: string;
  items: TripItem[];
}

interface TripItem {
  id: string;
  type: 'destination' | 'accommodation' | 'restaurant' | 'activity' | 'custom';
  title: string;
  address?: string;
  time?: string;
  duration?: string;
  budget?: number;
  memo?: string;
  contentId?: string;
  image?: string;
}

interface Trip {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  days: TripDay[];
  createdAt: string;
}

const MyTripPage: React.FC = () => {
  const navigate = useNavigate();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 새 여행 생성 폼
  const [newTripTitle, setNewTripTitle] = useState('');
  const [newTripStartDate, setNewTripStartDate] = useState('');
  const [newTripEndDate, setNewTripEndDate] = useState('');
  const [newTripTravelers, setNewTripTravelers] = useState(1);
  const [newTripBudget, setNewTripBudget] = useState(0);

  // 검색
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TourItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // 드래그 앤 드롭
  const [draggedItem, setDraggedItem] = useState<TripItem | null>(null);
  const [draggedFromDay, setDraggedFromDay] = useState<string | null>(null);

  // 로컬스토리지에서 여행 목록 로드
  useEffect(() => {
    const savedTrips = localStorage.getItem('myTrips');
    if (savedTrips) {
      const parsedTrips = JSON.parse(savedTrips);
      setTrips(parsedTrips);
      if (parsedTrips.length > 0) {
        setCurrentTrip(parsedTrips[0]);
      }
    }
  }, []);

  // 여행 목록 저장
  const saveTrips = (updatedTrips: Trip[]) => {
    localStorage.setItem('myTrips', JSON.stringify(updatedTrips));
    setTrips(updatedTrips);
  };

  // 새 여행 생성
  const createTrip = () => {
    if (!newTripTitle || !newTripStartDate || !newTripEndDate) {
      alert('여행 제목과 날짜를 입력해주세요.');
      return;
    }

    const start = new Date(newTripStartDate);
    const end = new Date(newTripEndDate);
    const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const days: TripDay[] = [];
    for (let i = 0; i < dayCount; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      days.push({
        id: `day-${i + 1}`,
        date: date.toISOString().split('T')[0],
        items: [],
      });
    }

    const newTrip: Trip = {
      id: Date.now().toString(),
      title: newTripTitle,
      startDate: newTripStartDate,
      endDate: newTripEndDate,
      travelers: newTripTravelers,
      budget: newTripBudget,
      days,
      createdAt: new Date().toISOString(),
    };

    const updatedTrips = [newTrip, ...trips];
    saveTrips(updatedTrips);
    setCurrentTrip(newTrip);
    setIsCreating(false);

    // 폼 초기화
    setNewTripTitle('');
    setNewTripStartDate('');
    setNewTripEndDate('');
    setNewTripTravelers(1);
    setNewTripBudget(0);
  };

  // 여행지 검색
  const searchDestinations = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const results = await tourApi.searchKeyword({
        keyword: searchQuery,
        numOfRows: 10,
        pageNo: 1,
      });
      setSearchResults(results);
    } catch (error) {
      console.error('검색 실패:', error);
    } finally {
      setSearching(false);
    }
  };

  // 검색 결과를 일정에 추가
  const addSearchResultToDay = (result: TourItem, dayId: string) => {
    if (!currentTrip) return;

    const newItem: TripItem = {
      id: Date.now().toString(),
      type: 'destination',
      title: result.title,
      address: result.addr1,
      contentId: result.contentid,
      image: result.firstimage || result.firstimage2,
    };

    const updatedTrip = {
      ...currentTrip,
      days: currentTrip.days.map((day) => (day.id === dayId ? { ...day, items: [...day.items, newItem] } : day)),
    };

    setCurrentTrip(updatedTrip);
    const updatedTrips = trips.map((t) => (t.id === currentTrip.id ? updatedTrip : t));
    saveTrips(updatedTrips);
  };

  // 커스텀 아이템 추가
  const addCustomItem = (dayId: string, type: TripItem['type']) => {
    if (!currentTrip) return;

    const typeLabels = {
      custom: '새 일정',
      accommodation: '숙소',
      restaurant: '식당',
      activity: '액티비티',
      destination: '여행지',
    };

    const newItem: TripItem = {
      id: Date.now().toString(),
      type,
      title: typeLabels[type],
      time: '09:00',
    };

    const updatedTrip = {
      ...currentTrip,
      days: currentTrip.days.map((day) => (day.id === dayId ? { ...day, items: [...day.items, newItem] } : day)),
    };

    setCurrentTrip(updatedTrip);
    const updatedTrips = trips.map((t) => (t.id === currentTrip.id ? updatedTrip : t));
    saveTrips(updatedTrips);
  };

  // 아이템 삭제
  const deleteItem = (dayId: string, itemId: string) => {
    if (!currentTrip) return;

    const updatedTrip = {
      ...currentTrip,
      days: currentTrip.days.map((day) =>
        day.id === dayId ? { ...day, items: day.items.filter((item) => item.id !== itemId) } : day
      ),
    };

    setCurrentTrip(updatedTrip);
    const updatedTrips = trips.map((t) => (t.id === currentTrip.id ? updatedTrip : t));
    saveTrips(updatedTrips);
  };

  // 아이템 수정
  const updateItem = (dayId: string, itemId: string, updates: Partial<TripItem>) => {
    if (!currentTrip) return;

    const updatedTrip = {
      ...currentTrip,
      days: currentTrip.days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              items: day.items.map((item) => (item.id === itemId ? { ...item, ...updates } : item)),
            }
          : day
      ),
    };

    setCurrentTrip(updatedTrip);
    const updatedTrips = trips.map((t) => (t.id === currentTrip.id ? updatedTrip : t));
    saveTrips(updatedTrips);
  };

  // 드래그 시작
  const handleDragStart = (item: TripItem, fromDayId: string) => {
    setDraggedItem(item);
    setDraggedFromDay(fromDayId);
  };

  // 드롭
  const handleDrop = (toDayId: string) => {
    if (!currentTrip || !draggedItem || !draggedFromDay) return;

    // 같은 날짜면 무시
    if (draggedFromDay === toDayId) {
      setDraggedItem(null);
      setDraggedFromDay(null);
      return;
    }

    const updatedTrip = {
      ...currentTrip,
      days: currentTrip.days.map((day) => {
        // 원래 날짜에서 제거
        if (day.id === draggedFromDay) {
          return {
            ...day,
            items: day.items.filter((item) => item.id !== draggedItem.id),
          };
        }
        // 새 날짜에 추가
        if (day.id === toDayId) {
          return {
            ...day,
            items: [...day.items, draggedItem],
          };
        }
        return day;
      }),
    };

    setCurrentTrip(updatedTrip);
    const updatedTrips = trips.map((t) => (t.id === currentTrip.id ? updatedTrip : t));
    saveTrips(updatedTrips);

    setDraggedItem(null);
    setDraggedFromDay(null);
  };

  // 여행 삭제
  const deleteTrip = (tripId: string) => {
    if (!confirm('이 여행 계획을 삭제하시겠습니까?')) return;

    const updatedTrips = trips.filter((t) => t.id !== tripId);
    saveTrips(updatedTrips);

    if (currentTrip?.id === tripId) {
      setCurrentTrip(updatedTrips[0] || null);
    }
  };

  // 총 예산 계산
  const calculateTotalBudget = () => {
    if (!currentTrip) return 0;
    return currentTrip.days.reduce((total, day) => {
      return (
        total +
        day.items.reduce((dayTotal, item) => {
          return dayTotal + (item.budget || 0);
        }, 0)
      );
    }, 0);
  };

  // 타입별 아이콘
  const getTypeIcon = (type: TripItem['type']) => {
    switch (type) {
      case 'accommodation':
        return Hotel;
      case 'restaurant':
        return Utensils;
      case 'activity':
        return Sparkles;
      case 'destination':
        return Camera;
      default:
        return MapPin;
    }
  };

  // 날짜 포맷
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getMonth() + 1}/${date.getDate()} (${days[date.getDay()]})`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 border-b border-purple-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/')} className="rounded-lg p-2 transition-colors hover:bg-purple-100">
                <ArrowLeft className="h-6 w-6 text-purple-600" />
              </button>
              <div>
                <h1 className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-3xl font-bold text-transparent">
                  <Calendar className="h-8 w-8 text-purple-600" />
                  나의 여행 계획
                </h1>
                <p className="mt-1 text-sm text-gray-600">완벽한 여행을 위한 일정을 만들어보세요</p>
              </div>
            </div>

            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-medium text-white transition-all hover:shadow-lg"
            >
              <Plus className="h-5 w-5" />새 여행 만들기
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* 사이드바 - 여행 목록 */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 rounded-2xl border border-purple-100 bg-white/80 p-6 shadow-lg backdrop-blur-xl">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
                <Calendar className="h-5 w-5 text-purple-600" />내 여행 목록
              </h2>

              {trips.length === 0 ? (
                <div className="py-8 text-center">
                  <Calendar className="mx-auto mb-3 h-12 w-12 text-purple-300" />
                  <p className="text-sm text-gray-500">아직 여행 계획이 없습니다</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trips.map((trip) => (
                    <div
                      key={trip.id}
                      onClick={() => setCurrentTrip(trip)}
                      className={`cursor-pointer rounded-xl p-4 transition-all ${
                        currentTrip?.id === trip.id
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <h3 className="line-clamp-1 font-semibold">{trip.title}</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTrip(trip.id);
                          }}
                          className={`rounded p-1 hover:bg-white/20 ${
                            currentTrip?.id === trip.id ? 'text-white' : 'text-gray-400'
                          }`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className={`text-sm ${currentTrip?.id === trip.id ? 'text-white/80' : 'text-gray-600'}`}>
                        {formatDate(trip.startDate)} ~ {formatDate(trip.endDate)}
                      </p>
                      <p className={`mt-1 text-xs ${currentTrip?.id === trip.id ? 'text-white/70' : 'text-gray-500'}`}>
                        {trip.days.length}일 · {trip.travelers}명
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 메인 - 여행 상세 */}
          <div className="lg:col-span-3">
            {!currentTrip ? (
              <div className="rounded-2xl border border-purple-100 bg-white/80 p-12 text-center shadow-lg backdrop-blur-xl">
                <Calendar className="mx-auto mb-4 h-20 w-20 text-purple-300" />
                <h3 className="mb-2 text-2xl font-bold text-gray-900">여행 계획을 시작해보세요</h3>
                <p className="mb-6 text-gray-600">새 여행을 만들어 나만의 완벽한 일정을 계획하세요</p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 font-medium text-white transition-all hover:shadow-lg"
                >
                  <Plus className="h-5 w-5" />첫 여행 만들기
                </button>
              </div>
            ) : (
              <>
                {/* 여행 정보 */}
                <div className="mb-6 rounded-2xl border border-purple-100 bg-white/80 p-6 shadow-lg backdrop-blur-xl">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h2 className="mb-2 text-2xl font-bold text-gray-900">{currentTrip.title}</h2>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(currentTrip.startDate)} ~ {formatDate(currentTrip.endDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {currentTrip.travelers}명
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          예산: {currentTrip.budget.toLocaleString()}원
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-purple-600">
                          <DollarSign className="h-4 w-4" />
                          사용: {calculateTotalBudget().toLocaleString()}원
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowSearch(!showSearch)}
                        className="rounded-lg bg-purple-100 p-2 transition-colors hover:bg-purple-200"
                      >
                        <Search className="h-5 w-5 text-purple-600" />
                      </button>
                      <button className="rounded-lg bg-gray-100 p-2 transition-colors hover:bg-gray-200">
                        <Share2 className="h-5 w-5 text-gray-600" />
                      </button>
                      <button className="rounded-lg bg-gray-100 p-2 transition-colors hover:bg-gray-200">
                        <Download className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* 검색 바 */}
                  {showSearch && (
                    <div className="mt-4 rounded-xl bg-purple-50 p-4">
                      <div className="mb-3 flex gap-2">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && searchDestinations()}
                          placeholder="여행지 검색..."
                          className="flex-1 rounded-lg border border-purple-200 px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                          onClick={searchDestinations}
                          disabled={searching}
                          className="rounded-lg bg-purple-600 px-6 py-2 text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                        >
                          {searching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                        </button>
                      </div>

                      {searchResults.length > 0 && (
                        <div className="max-h-60 space-y-2 overflow-y-auto">
                          {searchResults.map((result) => (
                            <div
                              key={result.contentid}
                              className="flex cursor-pointer items-center gap-3 rounded-lg bg-white p-3 hover:bg-gray-50"
                            >
                              {result.firstimage && (
                                <img
                                  src={result.firstimage}
                                  alt={result.title}
                                  className="h-16 w-16 rounded-lg object-cover"
                                />
                              )}
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{result.title}</p>
                                <p className="text-xs text-gray-500">{result.addr1}</p>
                              </div>
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    addSearchResultToDay(result, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                                className="rounded-lg border border-purple-200 px-3 py-1 text-sm"
                              >
                                <option value="">추가</option>
                                {currentTrip.days.map((day, idx) => (
                                  <option key={day.id} value={day.id}>
                                    Day {idx + 1}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 일정 */}
                <div className="space-y-6">
                  {currentTrip.days.map((day, dayIndex) => (
                    <div
                      key={day.id}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(day.id)}
                      className="overflow-hidden rounded-2xl border border-purple-100 bg-white/80 shadow-lg backdrop-blur-xl"
                    >
                      {/* Day 헤더 */}
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold">Day {dayIndex + 1}</h3>
                            <p className="text-sm text-white/80">{formatDate(day.date)}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => addCustomItem(day.id, 'custom')}
                              className="rounded-lg bg-white/20 p-2 transition-colors hover:bg-white/30"
                            >
                              <Plus className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Day 아이템 */}
                      <div className="p-4">
                        {day.items.length === 0 ? (
                          <div className="py-8 text-center text-gray-400">
                            <MapPin className="mx-auto mb-2 h-12 w-12 opacity-50" />
                            <p className="text-sm">일정을 추가해보세요</p>
                            <div className="mt-4 flex justify-center gap-2">
                              <button
                                onClick={() => addCustomItem(day.id, 'destination')}
                                className="rounded-lg bg-purple-50 px-3 py-1 text-sm text-purple-600 hover:bg-purple-100"
                              >
                                여행지
                              </button>
                              <button
                                onClick={() => addCustomItem(day.id, 'accommodation')}
                                className="rounded-lg bg-purple-50 px-3 py-1 text-sm text-purple-600 hover:bg-purple-100"
                              >
                                숙소
                              </button>
                              <button
                                onClick={() => addCustomItem(day.id, 'restaurant')}
                                className="rounded-lg bg-purple-50 px-3 py-1 text-sm text-purple-600 hover:bg-purple-100"
                              >
                                식당
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {day.items.map((item, itemIndex) => {
                              const Icon = getTypeIcon(item.type);
                              return (
                                <div
                                  key={item.id}
                                  draggable
                                  onDragStart={() => handleDragStart(item, day.id)}
                                  className="group cursor-move rounded-xl border-2 border-transparent bg-gray-50 p-4 transition-all hover:border-purple-300 hover:bg-gray-100"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="flex items-center gap-2">
                                      <GripVertical className="h-5 w-5 text-gray-400" />
                                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 font-bold text-white">
                                        {itemIndex + 1}
                                      </div>
                                    </div>

                                    {item.image && (
                                      <img
                                        src={item.image}
                                        alt={item.title}
                                        className="h-16 w-16 rounded-lg object-cover"
                                      />
                                    )}

                                    <div className="flex-1">
                                      <div className="mb-2 flex items-center gap-2">
                                        <Icon className="h-4 w-4 text-purple-600" />
                                        <input
                                          type="text"
                                          value={item.title}
                                          onChange={(e) => updateItem(day.id, item.id, { title: e.target.value })}
                                          className="flex-1 rounded border-none bg-transparent font-semibold text-gray-900 outline-none focus:bg-white focus:px-2 focus:py-1"
                                        />
                                      </div>

                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        <input
                                          type="time"
                                          value={item.time || ''}
                                          onChange={(e) => updateItem(day.id, item.id, { time: e.target.value })}
                                          className="rounded border border-gray-200 px-2 py-1"
                                        />
                                        <input
                                          type="text"
                                          value={item.duration || ''}
                                          onChange={(e) => updateItem(day.id, item.id, { duration: e.target.value })}
                                          placeholder="소요시간"
                                          className="rounded border border-gray-200 px-2 py-1"
                                        />
                                        <input
                                          type="number"
                                          value={item.budget || ''}
                                          onChange={(e) =>
                                            updateItem(day.id, item.id, { budget: Number(e.target.value) })
                                          }
                                          placeholder="예산"
                                          className="rounded border border-gray-200 px-2 py-1"
                                        />
                                        <input
                                          type="text"
                                          value={item.address || ''}
                                          onChange={(e) => updateItem(day.id, item.id, { address: e.target.value })}
                                          placeholder="주소"
                                          className="rounded border border-gray-200 px-2 py-1"
                                        />
                                      </div>

                                      <textarea
                                        value={item.memo || ''}
                                        onChange={(e) => updateItem(day.id, item.id, { memo: e.target.value })}
                                        placeholder="메모..."
                                        className="mt-2 w-full resize-none rounded border border-gray-200 px-2 py-1 text-sm"
                                        rows={2}
                                      />
                                    </div>

                                    <button
                                      onClick={() => deleteItem(day.id, item.id)}
                                      className="rounded-lg p-2 text-gray-400 opacity-0 transition-colors group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 새 여행 만들기 모달 */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">새 여행 만들기</h2>
              <button
                onClick={() => setIsCreating(false)}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">여행 제목</label>
                <input
                  type="text"
                  value={newTripTitle}
                  onChange={(e) => setNewTripTitle(e.target.value)}
                  placeholder="예: 제주도 힐링 여행"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">시작일</label>
                  <input
                    type="date"
                    value={newTripStartDate}
                    onChange={(e) => setNewTripStartDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">종료일</label>
                  <input
                    type="date"
                    value={newTripEndDate}
                    onChange={(e) => setNewTripEndDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">여행 인원</label>
                  <input
                    type="number"
                    value={newTripTravelers}
                    onChange={(e) => setNewTripTravelers(Number(e.target.value))}
                    min="1"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">총 예산 (원)</label>
                  <input
                    type="number"
                    value={newTripBudget}
                    onChange={(e) => setNewTripBudget(Number(e.target.value))}
                    min="0"
                    step="10000"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setIsCreating(false)}
                className="flex-1 rounded-xl bg-gray-100 px-6 py-3 font-medium transition-colors hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={createTrip}
                className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-medium text-white transition-all hover:shadow-lg"
              >
                만들기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTripPage;
