import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Clock,
  DollarSign,
  Info,
  Heart,
  Share2,
  Navigation,
  Calendar,
  Users,
  ParkingCircle,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import tourApi from '../services/tourApi';
import type { TourItem } from '../services/types';

interface DetailInfo {
  common: any;
  intro: any;
  images: any[];
}

const DetailPage: React.FC = () => {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<DetailInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<TourItem[]>([]);

  // 이미지 갤러리
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    if (contentId) {
      loadDetailData(contentId);
      checkFavoriteStatus(contentId);
    }
  }, [contentId]);

  // 즐겨찾기 상태 확인
  const checkFavoriteStatus = (id: string) => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const isFav = favorites.some((item: any) => item.contentid === id);
    setIsFavorite(isFav);
  };

  const loadDetailData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // 1단계: 공통 정보 먼저 가져오기
      const common = await tourApi.getDetailCommon(id);

      if (!common) {
        throw new Error('상세 정보를 찾을 수 없습니다.');
      }

      // 2단계: contenttypeid를 이용해 나머지 정보 가져오기
      const [intro, images] = await Promise.all([
        tourApi.getDetailIntro(id, common.contenttypeid || '12'),
        tourApi.getDetailImage(id),
      ]);

      setDetail({ common, intro, images });

      // 3단계: 주변 관광지 가져오기 (좌표가 있는 경우)
      if (common?.mapx && common?.mapy) {
        const nearby = await tourApi.getLocationBasedList({
          mapX: common.mapx,
          mapY: common.mapy,
          radius: '5000',
          numOfRows: 4,
        });
        setNearbyPlaces(nearby.filter((item) => item.contentid !== id));
      }
    } catch (err) {
      console.error('상세 정보 로드 실패:', err);
      setError('상세 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = () => {
    if (!detail?.common) return;

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const favoriteItem = {
      contentid: detail.common.contentid,
      title: detail.common.title,
      addr1: detail.common.addr1,
      firstimage: detail.common.firstimage,
      firstimage2: detail.common.firstimage2,
      contenttypeid: detail.common.contenttypeid,
      savedAt: new Date().toISOString(),
    };

    let updatedFavorites;
    if (isFavorite) {
      // 즐겨찾기 제거
      updatedFavorites = favorites.filter((item: any) => item.contentid !== detail.common.contentid);
    } else {
      // 즐겨찾기 추가
      updatedFavorites = [favoriteItem, ...favorites];
    }

    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    setIsFavorite(!isFavorite);
  };

  const handleShare = async () => {
    if (navigator.share && detail?.common) {
      try {
        await navigator.share({
          title: detail.common.title,
          text: detail.common.overview || '한국 여행지 정보',
          url: window.location.href,
        });
      } catch (err) {
        console.log('공유 실패:', err);
      }
    } else {
      // 클립보드 복사
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 복사되었습니다!');
    }
  };

  const getCategoryName = (typeId: string): string => {
    const categories: { [key: string]: string } = {
      '12': '관광지',
      '14': '문화시설',
      '15': '축제/행사',
      '25': '여행코스',
      '28': '레포츠',
      '32': '숙박',
      '38': '쇼핑',
      '39': '음식점',
    };
    return categories[typeId] || '기타';
  };

  // 이미지 갤러리 네비게이션
  const nextImage = () => {
    if (detail?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % detail.images.length);
    }
  };

  const prevImage = () => {
    if (detail?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + detail.images.length) % detail.images.length);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">오류가 발생했습니다</h2>
          <p className="mb-6 text-gray-600">{error || '정보를 찾을 수 없습니다'}</p>
          <button
            onClick={() => navigate(-1)}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const { common, intro, images } = detail;
  const mainImage =
    images[0]?.originimgurl ||
    common.firstimage ||
    common.firstimage2 ||
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200';

  return (
    <div className="min-h-screen bg-white">
      {/* 이미지 갤러리 모달 */}
      {showGallery && images.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <button
            onClick={() => setShowGallery(false)}
            className="absolute top-4 right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <img
            src={images[currentImageIndex]?.originimgurl}
            alt={`${common.title} ${currentImageIndex + 1}`}
            className="max-h-full max-w-full object-contain"
          />

          <button
            onClick={nextImage}
            className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
      )}

      {/* 헤더 */}
      <header className="fixed top-0 right-0 left-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-700 transition-colors hover:text-blue-600"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">돌아가기</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleFavorite}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                  isFavorite
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all hover:bg-blue-50 hover:text-blue-600"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 이미지 */}
      <div className="group relative mt-[73px] h-[60vh] overflow-hidden">
        <img
          src={mainImage}
          alt={common.title}
          className="h-full w-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* 타이틀 오버레이 */}
        <div className="absolute right-0 bottom-0 left-0 p-8 text-white md:p-12">
          <div className="max-w-4xl">
            <span className="mb-4 inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-semibold backdrop-blur-sm">
              {getCategoryName(common.contenttypeid)}
            </span>
            <h1 className="mb-4 text-4xl leading-tight font-bold md:text-6xl">{common.title}</h1>
            {common.addr1 && (
              <p className="flex items-center text-lg text-white/90">
                <MapPin className="mr-2 h-5 w-5" />
                {common.addr1}
              </p>
            )}
          </div>
        </div>

        {/* 이미지 썸네일 */}
        {images.length > 1 && (
          <button
            onClick={() => setShowGallery(true)}
            className="absolute right-8 bottom-8 rounded-lg bg-white/20 px-4 py-2 font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            사진 {images.length}장 모두 보기
          </button>
        )}
      </div>

      {/* 컨텐츠 영역 */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* 메인 컨텐츠 */}
          <div className="space-y-8 lg:col-span-2">
            {/* 개요 */}
            {common.overview && (
              <section className="rounded-2xl border border-gray-200 bg-white p-8">
                <h2 className="mb-4 flex items-center text-2xl font-bold text-gray-900">
                  <Info className="mr-2 h-6 w-6 text-blue-600" />
                  소개
                </h2>
                <div
                  className="leading-relaxed whitespace-pre-wrap text-gray-700"
                  dangerouslySetInnerHTML={{ __html: common.overview }}
                />
              </section>
            )}

            {/* 상세 정보 */}
            <section className="rounded-2xl border border-gray-200 bg-white p-8">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">상세 정보</h2>
              <div className="space-y-4">
                {/* 관광지별 상세 정보 */}
                {intro && Object.keys(intro).length > 0 && (
                  <>
                    {intro.infocenter && (
                      <InfoItem icon={<Phone className="h-5 w-5" />} label="문의" value={intro.infocenter} />
                    )}
                    {intro.usetime && (
                      <InfoItem icon={<Clock className="h-5 w-5" />} label="이용시간" value={intro.usetime} />
                    )}
                    {intro.restdate && (
                      <InfoItem icon={<Calendar className="h-5 w-5" />} label="휴무일" value={intro.restdate} />
                    )}
                    {intro.parking && (
                      <InfoItem icon={<ParkingCircle className="h-5 w-5" />} label="주차" value={intro.parking} />
                    )}
                    {intro.chkpet && (
                      <InfoItem icon={<Users className="h-5 w-5" />} label="반려동물" value={intro.chkpet} />
                    )}
                    {intro.usefeefestival && (
                      <InfoItem
                        icon={<DollarSign className="h-5 w-5" />}
                        label="이용요금"
                        value={intro.usefeefestival}
                      />
                    )}
                  </>
                )}

                {/* 전화번호 */}
                {common.tel && <InfoItem icon={<Phone className="h-5 w-5" />} label="전화번호" value={common.tel} />}
              </div>
            </section>

            {/* 이미지 갤러리 썸네일 */}
            {images.length > 1 && (
              <section>
                <h2 className="mb-6 text-2xl font-bold text-gray-900">사진</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {images.slice(0, 6).map((img, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentImageIndex(index);
                        setShowGallery(true);
                      }}
                      className="group relative aspect-[4/3] overflow-hidden rounded-xl"
                    >
                      <img
                        src={img.originimgurl}
                        alt={`${common.title} ${index + 1}`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                    </button>
                  ))}
                  {images.length > 6 && (
                    <button
                      onClick={() => setShowGallery(true)}
                      className="flex aspect-[4/3] items-center justify-center rounded-xl bg-gray-900 text-xl font-bold text-white transition-colors hover:bg-gray-800"
                    >
                      +{images.length - 6}
                    </button>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 빠른 정보 */}
            <div className="sticky top-24 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
              <h3 className="mb-4 font-bold text-gray-900">빠른 정보</h3>

              {common.addr1 && (
                <div className="mb-4 border-b border-gray-200 pb-4">
                  <p className="mb-1 text-sm text-gray-600">주소</p>
                  <p className="text-gray-900">{common.addr1}</p>
                  {common.addr2 && <p className="mt-1 text-sm text-gray-600">{common.addr2}</p>}
                </div>
              )}

              {common.homepage && (
                <div className="mb-4">
                  <a
                    href={common.homepage.match(/href=["'](.*?)["']/)?.[1] || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center font-medium text-blue-600 hover:text-blue-700"
                  >
                    홈페이지 방문
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </div>
              )}

              {common.mapx && common.mapy && (
                <button
                  onClick={() => {
                    window.open(
                      `https://map.kakao.com/link/map/${common.title},${common.mapy},${common.mapx}`,
                      '_blank'
                    );
                  }}
                  className="flex w-full items-center justify-center space-x-2 rounded-xl bg-white px-4 py-3 font-semibold text-gray-900 transition-all hover:shadow-lg"
                >
                  <Navigation className="h-5 w-5" />
                  <span>길찾기</span>
                </button>
              )}
            </div>

            {/* 주변 관광지 */}
            {nearbyPlaces.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <h3 className="mb-4 font-bold text-gray-900">주변 관광지</h3>
                <div className="space-y-3">
                  {nearbyPlaces.map((place) => (
                    <button
                      key={place.contentid}
                      onClick={() => navigate(`/detail/${place.contentid}`)}
                      className="group w-full rounded-xl p-3 text-left transition-colors hover:bg-gray-50"
                    >
                      <h4 className="mb-1 font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                        {place.title}
                      </h4>
                      <p className="line-clamp-1 text-sm text-gray-600">{place.addr1}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 정보 아이템 컴포넌트
const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => {
  // HTML 태그 제거
  const cleanValue = value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');

  return (
    <div className="flex items-start space-x-3 border-b border-gray-100 py-3 last:border-0">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        {icon}
      </div>
      <div className="flex-1">
        <p className="mb-1 text-sm text-gray-600">{label}</p>
        <p className="whitespace-pre-wrap text-gray-900">{cleanValue}</p>
      </div>
    </div>
  );
};

export default DetailPage;
