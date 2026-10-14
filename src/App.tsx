import React, { useState, useEffect, useRef } from 'react';
import { Mascot } from './components/Mascot';
import { ResultView } from './components/ResultView';
import { ArchiveDrawer } from './components/ArchiveDrawer';
import { PRESET_SAMPLES, PresetSample, createPresetCanvasDataUrl } from './data/presets';
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

export default function App() {
  // State
  const [relationshipContext, setRelationshipContext] = useState<RelationshipType>('연애·썸');
  const [mbti, setMbti] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [activePreset, setActivePreset] = useState<PresetSample | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [report, setReport] = useState<DecodeReport | null>(null);
  const [history, setHistory] = useState<DecodeReport[]>([]);
  const [isArchiveOpen, setIsArchiveOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMbtiOpen, setIsMbtiOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
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

  // Close MBTI picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mbtiContainerRef.current && !mbtiContainerRef.current.contains(e.target as Node)) {
        setIsMbtiOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Process selected file with canvas optimization
  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;

      // Optimize image resolution if too large (improves upload speed & AI recognition)
      const img = new Image();
      img.onload = () => {
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
            setActivePreset(null);
            return;
          }
        }

        setUploadedImage(rawDataUrl);
        setImageName(file.name);
        setActivePreset(null);
      };
      img.onerror = () => {
        setUploadedImage(rawDataUrl);
        setImageName(file.name);
        setActivePreset(null);
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
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
      showToast('이미지가 첨부되었습니다!');
    }
  };

  const handleSelectPreset = (preset: PresetSample) => {
    setActivePreset(preset);
    setRelationshipContext(preset.context);
    if (preset.mbti) setMbti(preset.mbti);
    setImageName(preset.report.imageName || `${preset.name}.png`);
    const simulatedUrl = createPresetCanvasDataUrl(
      preset.name,
      '형님 오늘 결혼식 와주셔서 감사합니데이!!',
      '신행 가서 맛있는 거 많이 묵고 온나!'
    );
    setUploadedImage(simulatedUrl);
    showToast(`'${preset.name}' 예시 캡처가 로드되었습니다!`);
  };

  // Execute Decoding
  const handleStartDecode = async () => {
    if (!uploadedImage && !activePreset) {
      showToast('분석할 대화 화면 캡처를 먼저 업로드해주세요!');
      fileInputRef.current?.click();
      return;
    }

    setIsLoading(true);

    try {
      // If user selected the preset wedding sample without uploading a custom image
      if (activePreset && activePreset.id === 'wedding') {
        await new Promise((r) => setTimeout(r, 600));
        const newReport = {
          ...activePreset.report,
          id: `report-${Date.now()}`,
          timestamp: '방금 전',
        };
        setReport(newReport);
        saveToHistory(newReport);
        setIsLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Call server-side Gemini Vision API route
      const response = await fetch('/api/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: uploadedImage || '',
          relationshipContext,
          mbti,
          sampleType: activePreset?.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`서버 응답 오류 (${response.status})`);
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        const generated = resData.data;
        const newReport: DecodeReport = {
          id: `report-${Date.now()}`,
          timestamp: '방금 전',
          relationshipContext,
          mbti: mbti || undefined,
          imageName: imageName || '대화_캡처.png',
          imagePreview: uploadedImage || undefined,
          affectionScore: generated.affectionScore ?? 80,
          affectionLevel: generated.affectionLevel ?? '호감 감지',
          tags: generated.tags || ['#심리해독', '#말투분석', '#대화프로파일링'],
          interpretation: generated.interpretation || '대화 뉘앙스 분석 결과입니다.',
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
            '상대방의 페이스에 맞추어 무리한 연속 메시지는 자제하는 것이 좋습니다.',
        };

        setReport(newReport);
        saveToHistory(newReport);
      } else {
        throw new Error(resData.error || '분석 데이터를 불러오지 못했습니다.');
      }
    } catch (err: any) {
      console.error('Decoding error:', err);
      showToast(err?.message || '대화 분석 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] flex flex-col justify-between selection:bg-[#ff5745]/20 selection:text-[#ff5745]">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

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
              setActivePreset(null);
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
                <label className="block text-stone-900 font-black text-sm tracking-tight mb-3">
                  스크린샷 첨부
                </label>

                {/* Upload Box */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    uploadedImage
                      ? 'border-[#ff5745]/60 bg-[#fffbf9]'
                      : 'border-[#e6e2d8] hover:border-stone-400 bg-[#fbfaf6]'
                  }`}
                >
                  {uploadedImage ? (
                    <div className="flex items-center justify-between space-x-3">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <img
                          src={uploadedImage}
                          alt="Screenshot"
                          className="w-14 h-14 object-cover rounded-xl border border-stone-200 shadow-2xs"
                        />
                        <div className="text-left">
                          <p className="text-xs font-bold text-stone-800 truncate max-w-[190px]">
                            {imageName || '대화_캡처_이미지.png'}
                          </p>
                          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                            첨부 완료 (클릭하여 변경)
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedImage(null);
                          setImageName('');
                          setActivePreset(null);
                        }}
                        className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2 py-2">
                      {/* Orange/Coral upload icon */}
                      <div className="w-12 h-12 rounded-full bg-[#ffefe9] text-[#ff5745] flex items-center justify-center mb-1">
                        <Upload className="w-5 h-5 stroke-[2.4]" />
                      </div>
                      <p className="text-stone-900 font-bold text-sm tracking-tight">
                        대화 화면 캡처 업로드
                      </p>
                      <p className="text-stone-400 font-medium text-xs tracking-tight">
                        클릭하여 파일 선택 또는 스크린샷 붙여넣기 (Ctrl+V)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. 관계 유형 */}
              <div>
                <label className="block text-stone-900 font-black text-sm tracking-tight mb-3">
                  관계 유형
                </label>

                {/* 2x2 Grid Options */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Option 1: 연애·썸 */}
                  <button
                    type="button"
                    onClick={() => setRelationshipContext('연애·썸')}
                    className={`p-3.5 rounded-2xl text-left transition-all border relative ${
                      relationshipContext === '연애·썸'
                        ? 'bg-[#6152ee] text-white border-[#6152ee] shadow-sm'
                        : 'bg-[#f5f3ff] text-[#6d28d9] border-[#ddd6fe]/70 hover:border-[#6152ee]/50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-black text-sm tracking-tight">연애·썸</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          relationshipContext === '연애·썸' ? 'bg-white' : 'bg-stone-300'
                        }`}
                      />
                    </div>
                    <p
                      className={`text-[11px] font-medium leading-tight ${
                        relationshipContext === '연애·썸' ? 'text-white/80' : 'text-stone-500'
                      }`}
                    >
                      호감도 및 설렘 지수
                    </p>
                  </button>

                  {/* Option 2: 직장·업무 */}
                  <button
                    type="button"
                    onClick={() => setRelationshipContext('직장·업무')}
                    className={`p-3.5 rounded-2xl text-left transition-all border relative ${
                      relationshipContext === '직장·업무'
                        ? 'bg-[#2563eb] text-white border-[#2563eb] shadow-sm'
                        : 'bg-[#edf5ff] text-[#1d62c5] border-[#d0e6ff]/80 hover:border-[#2563eb]/50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-black text-sm tracking-tight">직장·업무</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          relationshipContext === '직장·업무' ? 'bg-white' : 'bg-stone-300'
                        }`}
                      />
                    </div>
                    <p
                      className={`text-[11px] font-medium leading-tight ${
                        relationshipContext === '직장·업무' ? 'text-white/80' : 'text-stone-500'
                      }`}
                    >
                      업무 뉘앙스와 예의선
                    </p>
                  </button>

                  {/* Option 3: 친구·지인 */}
                  <button
                    type="button"
                    onClick={() => setRelationshipContext('친구·지인')}
                    className={`p-3.5 rounded-2xl text-left transition-all border relative ${
                      relationshipContext === '친구·지인'
                        ? 'bg-[#0d9488] text-white border-[#0d9488] shadow-sm'
                        : 'bg-[#eaf8f1] text-[#0f766e] border-[#c6eed9]/80 hover:border-[#0d9488]/50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-black text-sm tracking-tight">친구·지인</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          relationshipContext === '친구·지인' ? 'bg-white' : 'bg-stone-300'
                        }`}
                      />
                    </div>
                    <p
                      className={`text-[11px] font-medium leading-tight ${
                        relationshipContext === '친구·지인' ? 'text-white/80' : 'text-stone-500'
                      }`}
                    >
                      친밀도 및 유대감 체크
                    </p>
                  </button>

                  {/* Option 4: 일상·기타 */}
                  <button
                    type="button"
                    onClick={() => setRelationshipContext('일상·기타')}
                    className={`p-3.5 rounded-2xl text-left transition-all border relative ${
                      relationshipContext === '일상·기타'
                        ? 'bg-[#d97706] text-white border-[#d97706] shadow-sm'
                        : 'bg-[#fdf7e9] text-[#b45309] border-[#fae8b8]/80 hover:border-[#d97706]/50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-black text-sm tracking-tight">일상·기타</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          relationshipContext === '일상·기타' ? 'bg-white' : 'bg-stone-300'
                        }`}
                      />
                    </div>
                    <p
                      className={`text-[11px] font-medium leading-tight ${
                        relationshipContext === '일상·기타' ? 'text-white/80' : 'text-stone-500'
                      }`}
                    >
                      신뢰도 및 거래 의도
                    </p>
                  </button>
                </div>
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
