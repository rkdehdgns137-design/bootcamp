import React, { useState, useEffect, useRef } from 'react';
import { Mascot } from './components/Mascot';
import { ResultView } from './components/ResultView';
import { ArchiveDrawer } from './components/ArchiveDrawer';
import { DecodeReport, RelationshipType } from './types';
import {
  Upload,
  MessageSquare,
  Clock,
  X,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  ChevronDown,
} from 'lucide-react';

interface RelationshipOption {
  type: RelationshipType;
  title: string;
  desc: string;
  emoji: string;
  activeColor: string;
  badgeBg: string;
  badgeText: string;
}

const RELATIONSHIP_OPTIONS: RelationshipOption[] = [
  {
    type: '연애·썸',
    title: '연애·썸',
    desc: '호감도 및 설렘 지수',
    emoji: '💘',
    activeColor: 'bg-[#6152ee] text-white border-[#6152ee]',
    badgeBg: 'bg-[#f5f3ff]',
    badgeText: 'text-[#6d28d9]',
  },
  {
    type: '소개팅·애프터',
    title: '소개팅·애프터',
    desc: '첫인상과 애프터 호감도',
    emoji: '☕',
    activeColor: 'bg-[#e11d48] text-white border-[#e11d48]',
    badgeBg: 'bg-[#fff1f2]',
    badgeText: 'text-[#be123c]',
  },
  {
    type: '전연인·재회',
    title: '전연인·재회',
    desc: '미련 및 연락 심리 해독',
    emoji: '💔',
    activeColor: 'bg-[#be185d] text-white border-[#be185d]',
    badgeBg: 'bg-[#fdf2f8]',
    badgeText: 'text-[#9d174d]',
  },
  {
    type: '직장·업무',
    title: '직장·업무',
    desc: '업무 뉘앙스와 예의선',
    emoji: '💼',
    activeColor: 'bg-[#2563eb] text-white border-[#2563eb]',
    badgeBg: 'bg-[#edf5ff]',
    badgeText: 'text-[#1d62c5]',
  },
  {
    type: '친구·지인',
    title: '친구·지인',
    desc: '친밀도 및 유대감 체크',
    emoji: '🤝',
    activeColor: 'bg-[#0d9488] text-white border-[#0d9488]',
    badgeBg: 'bg-[#eaf8f1]',
    badgeText: 'text-[#0f766e]',
  },
  {
    type: '가족·친척',
    title: '가족·친척',
    desc: '세대 차이와 숨은 애정',
    emoji: '🏡',
    activeColor: 'bg-[#ea580c] text-white border-[#ea580c]',
    badgeBg: 'bg-[#fff7ed]',
    badgeText: 'text-[#c2410c]',
  },
  {
    type: '중고거래·협상',
    title: '중고거래·협상',
    desc: '매너와 네고 의도 파악',
    emoji: '📦',
    activeColor: 'bg-[#15803d] text-white border-[#15803d]',
    badgeBg: 'bg-[#f0fdf4]',
    badgeText: 'text-[#166534]',
  },
  {
    type: '일상·기타',
    title: '일상·기타',
    desc: '신뢰도 및 일반 의도',
    emoji: '💬',
    activeColor: 'bg-[#d97706] text-white border-[#d97706]',
    badgeBg: 'bg-[#fdf7e9]',
    badgeText: 'text-[#b45309]',
  },
];

export default function App() {
  // State
  const [relationshipContext, setRelationshipContext] = useState<RelationshipType>('연애·썸');
  const [isRelationshipOpen, setIsRelationshipOpen] = useState<boolean>(false);
  const [mbti, setMbti] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [report, setReport] = useState<DecodeReport | null>(null);
  const [history, setHistory] = useState<DecodeReport[]>([]);
  const [isArchiveOpen, setIsArchiveOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMbtiOpen, setIsMbtiOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const relationshipContainerRef = useRef<HTMLDivElement | null>(null);
  const mbtiContainerRef = useRef<HTMLDivElement | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('talk_decoder_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load history', e);
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (newReport: DecodeReport) => {
    setHistory((prev) => {
      const updated = [newReport, ...prev.filter((p) => p.id !== newReport.id)].slice(0, 30);
      try {
        localStorage.setItem('talk_decoder_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save history', e);
      }
      return updated;
    });
  };

  // Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // Clipboard Paste (Ctrl+V) handler for convenience
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            showToast('클립보드 스크린샷이 첨부되었습니다!');
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (mbtiContainerRef.current && !mbtiContainerRef.current.contains(target)) {
        setIsMbtiOpen(false);
      }
      if (relationshipContainerRef.current && !relationshipContainerRef.current.contains(target)) {
        setIsRelationshipOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Process selected file with canvas optimization
  const processFile = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/') && !/\.(png|jpe?g|webp|gif|bmp|heic|heif)$/i.test(file.name)) {
      showToast('이미지 파일(PNG, JPG, WebP 등)만 업로드할 수 있습니다.');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      showToast('이미지를 읽는 중 오류가 발생했습니다.');
    };
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) return;

      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const optimized = canvas.toDataURL('image/jpeg', 0.88);
              setUploadedImage(optimized);
              setImageName(file.name);
              showToast('대화 캡처가 등록되었습니다!');
              return;
            }
          }
        } catch (err) {
          console.warn('Canvas optimization fallback:', err);
        }

        setUploadedImage(rawDataUrl);
        setImageName(file.name);
        showToast('대화 캡처가 등록되었습니다!');
      };

      img.onerror = () => {
        setUploadedImage(rawDataUrl);
        setImageName(file.name);
        showToast('대화 캡처가 등록되었습니다!');
      };

      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Execute Decoding
  const handleStartDecode = async () => {
    if (!uploadedImage) {
      showToast('분석할 대화 화면 캡처를 먼저 업로드해주세요!');
      fileInputRef.current?.click();
      return;
    }

    setIsLoading(true);

    try {
      // Call server-side Gemini Vision API route
      const response = await fetch('/api/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: uploadedImage,
          relationshipContext,
          mbti,
        }),
      });

      if (!response.ok) {
        throw new Error(`서버 응답 오류 (${response.status})`);
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        const generated = resData.data;
        const isFailed = Boolean(generated.isDecodeFailed || resData.isDecodeFailed);

        const newReport: DecodeReport = {
          id: `report-${Date.now()}`,
          timestamp: '방금 전',
          relationshipContext,
          mbti: mbti || undefined,
          imageName: imageName || '대화_캡처.png',
          imagePreview: uploadedImage || undefined,
          isDecodeFailed: isFailed,
          failureReason:
            generated.failureReason ||
            (isFailed
              ? '이미지 내 대화 말풍선이나 텍스트를 감지할 수 없습니다. 대화창이 포함된 선명한 스크린샷인지 확인해 주세요.'
              : undefined),
          apology:
            generated.apology ||
            (isFailed
              ? '대화 내용을 명확하게 해독해 드리지 못해 진심으로 사과드립니다. 선명한 캡처로 다시 시도해 주시면 정밀하게 분석해 드리겠습니다.'
              : undefined),
          chatType: generated.chatType,
          groupAtmosphere: generated.groupAtmosphere,
          participants: generated.participants,
          affectionScore: generated.affectionScore ?? (isFailed ? 0 : 80),
          affectionLevel: generated.affectionLevel ?? (isFailed ? '판독 실패' : '호감 감지'),
          tags: generated.tags || (isFailed ? ['#판독실패', '#이미지확인필요', '#재시도권장'] : ['#심리해독', '#말투분석', '#대화프로파일링']),
          interpretation:
            generated.interpretation ||
            (isFailed
              ? '대화 화면을 정상적으로 인식하지 못하여 행간 및 심리 분석을 진행할 수 없었습니다.'
              : '대화 뉘앙스 분석 결과입니다.'),
          replies: generated.replies || {
            charm: {
              title: '호감 자극형',
              content: '오늘 너무 고마웠어! 다음에 맛있는 거 먹으러 가자 ㅎㅎ',
              color: 'purple',
            },
            standard: {
              title: '무난·표준형',
              content: '응응 일정 편하게 마치고 시간 될 때 연락 줘~',
              color: 'blue',
            },
            polite: {
              title: '정중한 마무리형',
              content: '확인 감사합니다! 좋은 하루 보내세요.',
              color: 'slate',
            },
          },
          warning:
            generated.warning ||
            (isFailed
              ? '대화 텍스트와 상대방 닉네임이 잘 보이도록 캡처한 이미지를 등록해 주세요.'
              : '상대방의 페이스에 맞추어 무리한 연속 메시지는 자제하는 것이 좋습니다.'),
        };

        setReport(newReport);
        if (!isFailed) {
          saveToHistory(newReport);
        } else {
          showToast('대화 해독에 실패하였습니다. 원인 및 사과 안내를 확인해 주세요.');
        }
      } else {
        throw new Error(resData.failureReason || resData.error || '분석 데이터를 불러오지 못했습니다.');
      }
    } catch (err: any) {
      console.error('Decoding error:', err);
      // Apologetic failure report when network or runtime error occurs
      const failReport: DecodeReport = {
        id: `report-fail-${Date.now()}`,
        timestamp: '방금 전',
        relationshipContext,
        mbti: mbti || undefined,
        imageName: imageName || '대화_캡처.png',
        imagePreview: uploadedImage || undefined,
        isDecodeFailed: true,
        failureReason:
          err?.message ||
          '서버 통신 지연 또는 일시적인 네트워크 오류로 인해 이미지 분석을 완료하지 못했습니다.',
        apology:
          '서비스 이용에 불편을 끼쳐드려 진심으로 사과드립니다. 네트워크 상태를 확인하시거나 잠시 후 다시 시도해 주시기 바랍니다.',
        affectionScore: 0,
        affectionLevel: '통신 지연',
        tags: ['#통신오류', '#잠시후재시도', '#안내확인'],
        interpretation: '서버와의 통신 연결 상태로 인해 대화 이미지를 분석하지 못했습니다.',
        replies: {
          charm: {
            title: '호감 자극형',
            content: '재시도 후 분석 결과가 제공됩니다.',
            color: 'purple',
          },
          standard: {
            title: '무난·표준형',
            content: '재시도 후 분석 결과가 제공됩니다.',
            color: 'blue',
          },
          polite: {
            title: '정중한 마무리형',
            content: '재시도 후 분석 결과가 제공됩니다.',
            color: 'slate',
          },
        },
        warning: '네트워크 상태를 점검하신 뒤 다시 시도해 주세요.',
      };
      setReport(failReport);
      showToast('해독에 실패하였습니다. 원인 및 사과 안내를 확인해 주세요.');
    } finally {
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] flex flex-col justify-between selection:bg-[#ff5745]/20 selection:text-[#ff5745]">
      {/* Main Container */}
      <main className="max-w-[480px] w-full mx-auto px-4 pt-5 pb-28">
        {/* If viewing results, show ResultView */}
        {report ? (
          <ResultView
            report={report}
            onReset={() => {
              setReport(null);
              setUploadedImage(null);
              setImageName('');
            }}
            onRetry={() => {
              setReport(null);
              handleStartDecode();
            }}
            onShowToast={showToast}
          />
        ) : (
          /* Input Form matching Screenshot 2 */
          <div className="space-y-4">
            {/* Top Banner Card with Mascot */}
            <div className="bg-white rounded-[28px] p-6 shadow-sm border border-stone-200/80 flex items-center justify-between">
              <div className="space-y-1.5 pr-2">
                <span className="text-[#ff5745] font-black text-xs tracking-wider block">
                  CONTEXT INSIGHTS
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight leading-snug">
                  대화 캡처를 올리고<br />
                  속마음을 읽어보세요
                </h1>
                <p className="text-stone-500 font-medium text-xs sm:text-[13px] leading-relaxed pt-0.5">
                  말투, 띄어쓰기, 답장 간격에 담긴 진짜 뉘앙스를 측정합니다.
                </p>
              </div>

              {/* Red Mascot */}
              <div className="flex-shrink-0">
                <Mascot size={68} />
              </div>
            </div>

            {/* Main Form Container */}
            <div className="bg-white rounded-[28px] p-6 sm:p-7 shadow-sm border border-stone-200/80 space-y-6">
              {/* 1. 스크린샷 첨부 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-stone-900 font-black text-sm tracking-tight">
                    대화 화면 캡처 첨부
                  </label>
                  {uploadedImage && (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      ✓ 첨부 완료
                    </span>
                  )}
                </div>

                {/* Upload Box with native accessible file input overlay */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={handleDrop}
                  className={`relative rounded-2xl transition-all ${
                    uploadedImage
                      ? 'border-2 border-[#ff5745]/60 bg-[#fffbf9] p-4'
                      : 'border-2 border-dashed border-[#e6e2d8] hover:border-[#ff5745]/60 bg-[#fbfaf6] hover:bg-[#fffbf9] p-6 text-center'
                  }`}
                >
                  {uploadedImage ? (
                    <div className="flex items-center justify-between space-x-3">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <img
                          src={uploadedImage}
                          alt="Screenshot"
                          className="w-14 h-14 object-cover rounded-xl border border-stone-200 shadow-2xs flex-shrink-0"
                        />
                        <div className="text-left min-w-0">
                          <p className="text-xs font-bold text-stone-800 truncate">
                            {imageName || '대화_캡처_이미지.png'}
                          </p>
                          <label className="inline-block mt-1 text-[11px] text-[#ff5745] hover:text-[#e04030] font-bold cursor-pointer underline">
                            다른 사진으로 변경
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handleFileChange}
                              onClick={(e) => {
                                (e.currentTarget as HTMLInputElement).value = '';
                              }}
                            />
                          </label>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedImage(null);
                          setImageName('');
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                          showToast('첨부된 이미지가 제거되었습니다.');
                        }}
                        className="p-2 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition"
                        title="이미지 삭제"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center space-y-2.5 cursor-pointer py-2 select-none">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileChange}
                        onClick={(e) => {
                          (e.currentTarget as HTMLInputElement).value = '';
                        }}
                      />
                      <div className="w-12 h-12 rounded-full bg-[#ffefe9] text-[#ff5745] flex items-center justify-center mb-0.5 shadow-2xs">
                        <Upload className="w-5 h-5 stroke-[2.4]" />
                      </div>
                      <p className="text-stone-900 font-bold text-sm tracking-tight">
                        대화 화면 캡처 업로드
                      </p>
                      <p className="text-stone-400 font-medium text-xs tracking-tight">
                        클릭하여 사진 선택 · 파일 드래그 앤 드롭 · 붙여넣기 (Ctrl+V)
                      </p>
                      <span className="inline-flex items-center text-[11px] font-bold text-[#ff5745] bg-[#fff0ed] px-3 py-1 rounded-full">
                        카톡 · 라인 · 인스타DM · 문자 모두 지원
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* 2. 관계 유형 */}
              <div ref={relationshipContainerRef} className="relative">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-stone-900 font-black text-sm tracking-tight">
                    관계 유형
                  </label>
                  <span className="text-xs font-semibold text-stone-400">필수 선택</span>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsRelationshipOpen(!isRelationshipOpen)}
                    className="w-full bg-[#faf9f6] border border-[#e8e4dc] hover:border-stone-400 focus:border-[#ff5745] rounded-2xl px-4 py-3 text-left transition flex items-center justify-between focus:outline-none pr-12 cursor-pointer"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      {(() => {
                        const current =
                          RELATIONSHIP_OPTIONS.find((opt) => opt.type === relationshipContext) ||
                          RELATIONSHIP_OPTIONS[0];
                        return (
                          <>
                            <span className="text-base">{current.emoji}</span>
                            <span className="text-sm font-bold text-stone-900 tracking-tight">
                              {current.title}
                            </span>
                            <span className="text-xs font-medium text-stone-500 truncate">
                              ({current.desc})
                            </span>
                          </>
                        );
                      })()}
                    </div>

                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                      <ChevronDown
                        className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${
                          isRelationshipOpen ? 'rotate-180 text-[#ff5745]' : ''
                        }`}
                      />
                    </div>
                  </button>
                </div>

                {/* Dropdown Options (클릭 시 펼쳐지는 형태) */}
                {isRelationshipOpen && (
                  <div className="mt-2.5 p-3 bg-[#faf9f6] border border-[#e8e4dc] rounded-2xl shadow-sm animate-in fade-in duration-150">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <span className="text-[11px] font-bold text-stone-500">
                        대화 상대와의 관계 유형을 선택하세요
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsRelationshipOpen(false)}
                        className="text-[11px] font-bold text-stone-600 hover:text-stone-900 px-2 py-0.5 rounded-md hover:bg-stone-200 transition"
                      >
                        닫기
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-h-[360px] overflow-y-auto pr-0.5">
                      {RELATIONSHIP_OPTIONS.map((item) => {
                        const isSelected = relationshipContext === item.type;
                        return (
                          <button
                            key={item.type}
                            type="button"
                            onClick={() => {
                              setRelationshipContext(item.type);
                              setIsRelationshipOpen(false);
                            }}
                            className={`p-3 rounded-2xl text-left transition-all border relative cursor-pointer active:scale-95 ${
                              isSelected
                                ? item.activeColor + ' shadow-sm'
                                : `${item.badgeBg} ${item.badgeText} border-stone-200/80 hover:border-stone-400`
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-black text-sm tracking-tight flex items-center gap-1.5">
                                <span>{item.emoji}</span>
                                <span>{item.title}</span>
                              </span>
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isSelected ? 'bg-white' : 'bg-stone-300'
                                }`}
                              />
                            </div>
                            <p
                              className={`text-[11px] font-medium leading-tight ${
                                isSelected ? 'text-white/80' : 'text-stone-500'
                              }`}
                            >
                              {item.desc}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. 상대방 성향 (MBTI) */}
              <div ref={mbtiContainerRef} className="relative">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-stone-900 font-black text-sm tracking-tight">
                    상대방 성향 (MBTI)
                  </label>
                  <span className="text-xs font-semibold text-stone-400">선택 사항</span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={mbti}
                    onFocus={() => setIsMbtiOpen(true)}
                    onClick={() => setIsMbtiOpen(true)}
                    onChange={(e) => setMbti(e.target.value.toUpperCase())}
                    placeholder="예: ENFP, ISTJ (클릭하여 선택 또는 직접 입력)"
                    className="w-full bg-[#faf9f6] border border-[#e8e4dc] rounded-2xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#ff5745] transition pr-16"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                    {mbti && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMbti('');
                        }}
                        className="p-1 text-stone-400 hover:text-stone-700 rounded-full transition"
                        title="선택 초기화"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMbtiOpen(!isMbtiOpen);
                      }}
                      className="p-1 text-stone-400 hover:text-stone-700 rounded-full transition"
                      title="MBTI 선택 목록 열기/닫기"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isMbtiOpen ? 'rotate-180 text-[#ff5745]' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* All 16 MBTI Types Grid (입력하려 할 때 드롭다운으로 표시) */}
                {isMbtiOpen && (
                  <div className="mt-2.5 p-3 bg-[#faf9f6] border border-[#e8e4dc] rounded-2xl shadow-sm animate-in fade-in duration-150">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <span className="text-[11px] font-bold text-stone-500">
                        원하는 MBTI를 터치하세요 (다시 누르면 해제)
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsMbtiOpen(false)}
                        className="text-[11px] font-bold text-stone-600 hover:text-stone-900 px-2 py-0.5 rounded-md hover:bg-stone-200 transition"
                      >
                        닫기
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        'INTJ', 'INTP', 'ENTJ', 'ENTP',
                        'INFJ', 'INFP', 'ENFJ', 'ENFP',
                        'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
                        'ISTP', 'ISFP', 'ESTP', 'ESFP',
                      ].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setMbti(mbti === type ? '' : type);
                          }}
                          className={`text-xs font-bold py-2 rounded-xl transition-all duration-150 active:scale-95 text-center ${
                            mbti === type
                              ? 'bg-[#ff5745] text-white shadow-xs font-black'
                              : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200/70'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit CTA Button */}
              <button
                type="button"
                disabled={isLoading}
                onClick={handleStartDecode}
                className="w-full py-4 px-6 rounded-2xl bg-[#ff5745] hover:bg-[#ff4430] active:scale-[0.99] text-white font-black text-base shadow-sm tracking-tight transition flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>속마음 정밀 해독 중...</span>
                  </>
                ) : (
                  <span>속마음 해독 시작하기</span>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Pill Navigation Bar */}
      <nav className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-full shadow-lg border border-stone-200/90 flex items-center space-x-2">
          {/* 해독하기 Tab */}
          <button
            type="button"
            onClick={() => setReport(null)}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-full font-bold text-xs sm:text-[13px] transition ${
              !report
                ? 'bg-[#ff5745] text-white shadow-2xs'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>해독하기</span>
          </button>

          {/* 보관함 Tab */}
          <button
            type="button"
            onClick={() => setIsArchiveOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-full font-bold text-xs sm:text-[13px] text-stone-600 hover:bg-stone-100 transition"
          >
            <Clock className="w-4 h-4 text-stone-500" />
            <span>보관함 ({history.length})</span>
          </button>
        </div>
      </nav>

      {/* Archive History Drawer */}
      <ArchiveDrawer
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        history={history}
        onSelectReport={(selected) => {
          setReport(selected);
          setIsArchiveOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onClearHistory={() => setHistory([])}
        onShowToast={showToast}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="bg-stone-900 text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-xl flex items-center space-x-2 border border-stone-800">
            <Sparkles className="w-3.5 h-3.5 text-[#ff5745]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
