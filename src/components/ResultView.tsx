import React, { useState } from 'react';
import { DecodeReport } from '../types';
import { Check, Copy, AlertCircle, Sparkles, ArrowLeft, RefreshCw } from 'lucide-react';
import { Mascot } from './Mascot';

interface ResultViewProps {
  report: DecodeReport;
  onReset: () => void;
  onRetry?: () => void;
  onShowToast: (message: string) => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ report, onReset, onRetry, onShowToast }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string, label: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedKey(key);
    onShowToast(`"${label}" 답장이 복사되었습니다!`);
    setTimeout(() => {
      setCopiedKey(null);
    }, 1800);
  };

  const handleCopySummary = () => {
    const summary = `[톡해독 프로파일링 결과 요약]
• 관계 맥락: ${report.relationshipContext}
• 호감/친밀도: ${report.affectionScore}% (${report.affectionLevel})
• 성향 태그: ${report.tags.join(' ')}
• 핵심 속마음: ${report.interpretation}
• 추천 답장 (${report.replies.charm.title}): ${report.replies.charm.content}
• 주의사항: ${report.warning}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(summary);
    }
    onShowToast('결과 요약이 클립보드에 복사되었습니다!');
  };

  // Dedicated View for Decode Failure with Apology & Reason Explanation
  if (report.isDecodeFailed) {
    return (
      <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
        {/* 1. Apology & Failure Announcement Header */}
        <div className="bg-white rounded-[26px] p-6 shadow-sm border border-stone-200/80 text-center relative overflow-hidden">
          <div className="inline-flex p-3 rounded-2xl bg-amber-50/80 border border-amber-200/60 mb-3.5">
            <Mascot size={58} mood="apologetic" />
          </div>
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-rose-50 text-[#e11d48] font-bold text-xs mb-2 border border-rose-100">
              ⚠️ 해독 불가 안내
            </span>
          </div>
          <h2 className="text-stone-900 font-black text-xl tracking-tight mb-2">
            대화 내용을 해독하지 못했습니다
          </h2>

          {/* Sincere Apology Callout */}
          <div className="mt-3.5 p-4 rounded-2xl bg-[#fff7f5] border border-[#ff5745]/20 text-left space-y-1">
            <div className="text-xs font-bold text-[#c53020] flex items-center space-x-1">
              <span>🙇‍♂️</span>
              <span>사과 말씀드립니다</span>
            </div>
            <p className="text-stone-800 font-semibold text-xs sm:text-[13px] leading-relaxed">
              {report.apology ||
                '대화 내용을 명확하게 판독해 드리지 못해 진심으로 사과드립니다. 선명한 대화 화면 캡처로 다시 시도해 주시면 정밀하게 분석해 드리겠습니다.'}
            </p>
          </div>
        </div>

        {/* 2. Detailed Failure Reason */}
        <div className="bg-white rounded-[26px] p-6 shadow-sm border border-stone-200/80 space-y-3.5">
          <div className="flex items-center space-x-2 text-stone-800 font-bold text-sm">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>해독 실패 상세 사유</span>
          </div>
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 text-stone-800 text-xs sm:text-sm font-semibold leading-relaxed">
            {report.failureReason ||
              '업로드된 이미지에서 카카오톡 또는 메신저 대화 말풍선이나 텍스트를 감지할 수 없습니다.'}
          </div>

          {report.imagePreview && (
            <div className="pt-2 border-t border-stone-100 space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500 font-bold">
                <span>분석을 시도한 업로드 캡처</span>
                <span className="text-[11px] text-stone-400 truncate max-w-[180px]">
                  {report.imageName || '캡처 이미지'}
                </span>
              </div>
              <div className="relative rounded-xl overflow-hidden border border-stone-200 max-h-48 bg-stone-900/5 flex items-center justify-center p-2">
                <img
                  src={report.imagePreview}
                  alt="Upload preview"
                  className="max-h-44 object-contain rounded-lg w-auto"
                />
              </div>
            </div>
          )}
        </div>

        {/* 3. Practical Guidance Checklist */}
        <div className="bg-[#fef9ee] rounded-[26px] p-6 border border-[#fde8c3]/80 space-y-3">
          <div className="flex items-center space-x-2 text-[#b45309] font-bold text-xs tracking-tight">
            <Sparkles className="w-3.5 h-3.5" />
            <span>이렇게 캡처하시면 정확하게 해독할 수 있어요</span>
          </div>
          <ul className="text-stone-800 text-xs sm:text-[13px] space-y-2.5 font-medium">
            <li className="flex items-start space-x-2">
              <span className="text-[#ff5745] font-black text-sm leading-none">•</span>
              <span>
                <strong>대화 말풍선과 텍스트</strong>가 온전히 보이는 메신저 화면 스크린샷
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-[#ff5745] font-black text-sm leading-none">•</span>
              <span>
                다른 기기 화면을 카메라로 찍은 사진보다는 <strong>기기 자체 캡처 기능</strong> 권장
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-[#ff5745] font-black text-sm leading-none">•</span>
              <span>
                글씨가 너무 작거나 흐릿하지 않은 <strong>원본 고화질 이미지</strong>
              </span>
            </li>
          </ul>
        </div>

        {/* 4. Action Buttons */}
        <div className="flex items-center space-x-3 pt-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 py-3.5 px-4 bg-[#e9e8e4] hover:bg-[#deddd8] active:scale-[0.98] text-stone-800 font-bold text-sm rounded-2xl transition-all shadow-xs text-center flex items-center justify-center space-x-1.5"
            >
              <RefreshCw className="w-4 h-4 text-stone-600" />
              <span>다시 시도</span>
            </button>
          )}
          <button
            onClick={onReset}
            className="flex-1 py-3.5 px-4 bg-[#ff5745] hover:bg-[#e04433] active:scale-[0.98] text-white font-bold text-sm rounded-2xl transition-all shadow-sm text-center flex items-center justify-center space-x-1.5"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
            <span>다른 캡처 업로드하기</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* 1. 호감 및 친밀도 지수 Card */}
      <div className="bg-white rounded-[26px] p-6 shadow-sm border border-stone-200/80">
        <div className="flex justify-between items-center mb-3">
          <span className="text-stone-700 font-bold text-sm tracking-tight">호감 및 친밀도 지수</span>
          <span className="text-[#ff5745] font-bold text-sm tracking-tight">{report.affectionLevel}</span>
        </div>

        {/* Large Score Metric */}
        <div className="flex items-baseline mb-4">
          <span className="text-5xl font-black text-stone-900 tracking-tight">{report.affectionScore}</span>
          <span className="text-[#ff5745] font-bold text-2xl ml-1.5">%</span>
        </div>

        {/* Coral Progress Bar */}
        <div className="w-full bg-[#f1f0ee] h-2.5 rounded-full overflow-hidden mb-5">
          <div
            className="bg-[#ff5745] h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(100, Math.max(5, report.affectionScore))}%` }}
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {report.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-3.5 py-1 rounded-xl bg-[#f4f3ef] text-stone-700 text-xs font-bold tracking-tight"
            >
              {tag.startsWith('#') ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      </div>

      {/* 2. 행간 및 속마음 해석 Card */}
      <div className="bg-white rounded-[26px] p-6 shadow-sm border border-stone-200/80">
        <div className="flex justify-between items-center mb-3">
          <div className="text-stone-500 font-bold text-xs tracking-tight">행간 및 속마음 해석</div>
          {report.chatType === 'group' && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
              👥 그룹·단톡방 분석
            </span>
          )}
        </div>
        {report.groupAtmosphere && (
          <div className="mb-3 px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200/80 text-xs font-semibold text-stone-700">
            💬 <span className="font-bold text-stone-900">단톡방 분위기:</span> {report.groupAtmosphere}
          </div>
        )}
        <p className="text-stone-900 font-bold text-[14px] sm:text-[15px] leading-relaxed tracking-tight">
          {report.interpretation}
        </p>
      </div>

      {/* 2-1. 단톡방 참여자별 속마음 분석 (다수 참여 대화일 때 표시) */}
      {report.participants && report.participants.length > 0 && (
        <div className="bg-white rounded-[26px] p-6 shadow-sm border border-stone-200/80 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-stone-500 font-bold text-xs tracking-tight">
              참여자별 스탠스 & 속마음 ({report.participants.length}명)
            </span>
            <span className="text-[11px] font-bold text-[#ff5745]">개별 인물 해독</span>
          </div>
          <div className="space-y-2.5">
            {report.participants.map((person, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#faf9f6] border border-stone-200/70 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs sm:text-[13px] text-stone-900 flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff5745]" />
                    <span>{person.name}</span>
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-stone-200/70 text-stone-700">
                    {person.roleOrStance}
                  </span>
                </div>
                <p className="text-xs text-stone-700 font-medium leading-relaxed pl-3 border-l-2 border-[#ff5745]/40">
                  {person.subtext}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. 상황별 맞춤 답장 Card */}
      <div className="bg-white rounded-[26px] p-6 shadow-sm border border-stone-200/80 space-y-3.5">
        <div className="text-stone-500 font-bold text-xs tracking-tight">상황별 맞춤 답장</div>

        {/* Option 1: 호감 자극형 */}
        <div className="bg-[#faf9f6] rounded-2xl p-4 sm:p-4.5 border border-stone-200/60">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-[#5b4bf5] font-bold text-xs sm:text-[13px] tracking-tight">
              {report.replies.charm.title}
            </span>
            <button
              onClick={() => handleCopy(report.replies.charm.content, 'charm', report.replies.charm.title)}
              className="inline-flex items-center space-x-1 px-3 py-1 bg-white hover:bg-stone-100 active:scale-95 text-stone-700 text-xs font-bold rounded-lg border border-stone-200 shadow-2xs transition-all"
            >
              {copiedKey === 'charm' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
              <span>{copiedKey === 'charm' ? '완료' : '복사'}</span>
            </button>
          </div>
          <p className="text-stone-800 font-semibold text-xs sm:text-[13.5px] leading-relaxed tracking-tight">
            {report.replies.charm.content}
          </p>
        </div>

        {/* Option 2: 무난·표준형 */}
        <div className="bg-[#faf9f6] rounded-2xl p-4 sm:p-4.5 border border-stone-200/60">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-[#2563eb] font-bold text-xs sm:text-[13px] tracking-tight">
              {report.replies.standard.title}
            </span>
            <button
              onClick={() => handleCopy(report.replies.standard.content, 'standard', report.replies.standard.title)}
              className="inline-flex items-center space-x-1 px-3 py-1 bg-white hover:bg-stone-100 active:scale-95 text-stone-700 text-xs font-bold rounded-lg border border-stone-200 shadow-2xs transition-all"
            >
              {copiedKey === 'standard' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
              <span>{copiedKey === 'standard' ? '완료' : '복사'}</span>
            </button>
          </div>
          <p className="text-stone-800 font-semibold text-xs sm:text-[13.5px] leading-relaxed tracking-tight">
            {report.replies.standard.content}
          </p>
        </div>

        {/* Option 3: 정중한 마무리형 */}
        <div className="bg-[#faf9f6] rounded-2xl p-4 sm:p-4.5 border border-stone-200/60">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-stone-700 font-bold text-xs sm:text-[13px] tracking-tight">
              {report.replies.polite.title}
            </span>
            <button
              onClick={() => handleCopy(report.replies.polite.content, 'polite', report.replies.polite.title)}
              className="inline-flex items-center space-x-1 px-3 py-1 bg-white hover:bg-stone-100 active:scale-95 text-stone-700 text-xs font-bold rounded-lg border border-stone-200 shadow-2xs transition-all"
            >
              {copiedKey === 'polite' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
              <span>{copiedKey === 'polite' ? '완료' : '복사'}</span>
            </button>
          </div>
          <p className="text-stone-800 font-semibold text-xs sm:text-[13.5px] leading-relaxed tracking-tight">
            {report.replies.polite.content}
          </p>
        </div>
      </div>

      {/* 4. 대화 시 주의사항 Card (Screenshot 3 Yellow card) */}
      <div className="bg-[#fef9ee] rounded-[26px] p-6 border border-[#fde8c3]/80 space-y-2.5">
        <div className="text-[#d97706] font-bold text-xs tracking-tight">대화 시 주의사항</div>
        <p className="text-stone-900 font-bold text-xs sm:text-[13.5px] leading-relaxed tracking-tight">
          {report.warning}
        </p>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center space-x-3 pt-2">
        <button
          onClick={onReset}
          className="flex-1 py-3.5 px-4 bg-[#e9e8e4] hover:bg-[#deddd8] active:scale-[0.98] text-stone-800 font-bold text-sm rounded-2xl transition-all shadow-xs text-center"
        >
          새로운 캡처 해독
        </button>
        <button
          onClick={handleCopySummary}
          className="flex-1 py-3.5 px-4 bg-[#1c1b1a] hover:bg-[#2b2a28] active:scale-[0.98] text-white font-bold text-sm rounded-2xl transition-all shadow-sm text-center"
        >
          결과 요약 복사
        </button>
      </div>
    </div>
  );
};
