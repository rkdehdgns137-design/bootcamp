import React from 'react';
import { Mascot } from './Mascot';
import { Upload, RotateCcw, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface DecodeErrorViewProps {
  imagePreview?: string | null;
  imageName?: string;
  reason?: string;
  onRetry: () => void;
  onUploadNew: () => void;
  onReset: () => void;
}

export const DecodeErrorView: React.FC<DecodeErrorViewProps> = ({
  imagePreview,
  imageName,
  reason,
  onRetry,
  onUploadNew,
  onReset,
}) => {
  const defaultReason =
    '업로드하신 이미지에서 대화 말풍선이나 텍스트를 충분히 인식하지 못했습니다. 이미지가 너무 흐리거나, 글씨가 잘렸거나, 대화창이 아닌 일반 사진일 수 있습니다.';

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* 1. Apology & Failure Main Card */}
      <div className="bg-white rounded-[28px] p-6 sm:p-7 shadow-sm border border-stone-200/80 text-center space-y-5">
        {/* Mascot with gentle animation */}
        <div className="flex justify-center pt-2">
          <div className="relative">
            <Mascot size={76} />
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1 rounded-full shadow-xs">
              <AlertCircle className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Apology Title & Subtitle */}
        <div className="space-y-1.5">
          <span className="text-xs font-black tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/70 inline-block">
            해독 불가 안내
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight leading-snug">
            대화 내용을 해독해 드리지 못해<br />
            진심으로 죄송합니다
          </h2>
          <p className="text-stone-500 text-xs sm:text-[13px] leading-relaxed max-w-sm mx-auto">
            보내주신 캡처 이미지에서 상대방의 속마음과 호감도를 정확하게 분석할 수 있는 대화 데이터를 찾지 못했습니다.
          </p>
        </div>

        {/* Attached image preview snippet */}
        {imagePreview && (
          <div className="bg-[#faf9f6] border border-stone-200/80 rounded-2xl p-3 flex items-center justify-between text-left max-w-sm mx-auto">
            <div className="flex items-center space-x-3 overflow-hidden">
              <img
                src={imagePreview}
                alt="Failed Screenshot"
                className="w-11 h-11 object-cover rounded-xl border border-stone-200 opacity-70 grayscale-30"
              />
              <div className="truncate">
                <p className="text-xs font-bold text-stone-700 truncate">
                  {imageName || '대화_캡처_이미지.png'}
                </p>
                <p className="text-[11px] text-amber-600 font-semibold mt-0.5">
                  텍스트 판독 실패
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Failure Reason Callout Box */}
        <div className="bg-[#fff9f6] border border-[#fed7aa] rounded-2xl p-4 text-left space-y-1.5 max-w-md mx-auto">
          <div className="flex items-center space-x-1.5 text-stone-900 font-bold text-xs">
            <span className="text-base">💡</span>
            <span>판독 실패 원인</span>
          </div>
          <p className="text-stone-700 text-xs sm:text-[13px] leading-relaxed font-medium pl-6">
            {reason || defaultReason}
          </p>
        </div>

        {/* Helpful Tips Checklist */}
        <div className="bg-[#faf9f6] border border-stone-200/70 rounded-2xl p-4 text-left space-y-2.5 max-w-md mx-auto">
          <p className="text-stone-900 font-black text-xs tracking-tight">
            다음 사항을 확인 후 다시 올려주세요:
          </p>
          <ul className="space-y-1.5 text-xs text-stone-600">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>카카오톡, 라인, 인스타 DM, 문자 등 <strong>대화 말풍선이 보이는 화면</strong>인지 확인해 주세요.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>글씨가 너무 작거나 흐리지 않고 <strong>충분히 확대된 고화질 스크린샷</strong>을 올려주세요.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>음식, 풍경, 인물 사진 등 대화창이 아닌 이미지는 해독할 수 없습니다.</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2 max-w-md mx-auto">
          <button
            type="button"
            onClick={onUploadNew}
            className="w-full py-3.5 px-5 rounded-2xl bg-[#ff5745] hover:bg-[#ff4430] active:scale-[0.99] text-white font-black text-sm shadow-sm transition flex items-center justify-center space-x-2"
          >
            <Upload className="w-4 h-4 stroke-[2.4]" />
            <span>다른 대화 캡처 업로드하기</span>
          </button>

          <button
            type="button"
            onClick={onRetry}
            className="w-full py-3 px-5 rounded-2xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 font-bold text-xs sm:text-sm transition flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>동일한 캡처로 다시 시도</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="w-full py-2.5 text-stone-400 hover:text-stone-700 text-xs font-semibold transition flex items-center justify-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>홈으로 돌아가기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
