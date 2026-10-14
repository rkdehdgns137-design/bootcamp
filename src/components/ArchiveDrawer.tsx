import React from 'react';
import { DecodeReport } from '../types';
import { X, Clock, ChevronRight, Trash2, Copy, Sparkles } from 'lucide-react';

interface ArchiveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: DecodeReport[];
  onSelectReport: (report: DecodeReport) => void;
  onClearHistory: () => void;
  onShowToast: (msg: string) => void;
}

export const ArchiveDrawer: React.FC<ArchiveDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectReport,
  onClearHistory,
  onShowToast,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 flex justify-between items-center bg-[#faf9f5]">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-[#ff5745]" />
            <h3 className="text-base font-bold text-stone-900 tracking-tight">해독 보관함 ({history.length})</h3>
          </div>
          <div className="flex items-center space-x-2">
            {history.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('보관함의 모든 기록을 삭제하시겠습니까?')) {
                    onClearHistory();
                    onShowToast('보관함이 비워졌습니다.');
                  }
                }}
                className="text-xs text-stone-500 hover:text-red-500 p-1.5 transition"
                title="전체 삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1 divide-y divide-stone-100">
          {history.length === 0 ? (
            <div className="py-12 text-center text-stone-400 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-stone-300" />
              <p className="text-sm font-medium">아직 보관된 해독 결과가 없습니다.</p>
              <p className="text-xs text-stone-400">새로운 대화를 해독하면 이곳에 자동 저장됩니다.</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectReport(item);
                  onClose();
                }}
                className="pt-3.5 first:pt-0 cursor-pointer group flex items-center justify-between p-3.5 rounded-2xl hover:bg-[#faf9f6] border border-transparent hover:border-stone-200 transition-all"
              >
                <div className="space-y-1.5 flex-1 pr-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                      {item.relationshipContext}
                    </span>
                    <span className="text-xs font-bold text-[#ff5745]">
                      {item.affectionScore}% ({item.affectionLevel})
                    </span>
                    <span className="text-[11px] text-stone-400">{item.timestamp}</span>
                  </div>
                  <p className="text-xs font-medium text-stone-700 line-clamp-1">
                    {item.interpretation}
                  </p>
                  <div className="flex gap-1.5">
                    {item.tags.slice(0, 2).map((t, i) => (
                      <span key={i} className="text-[11px] text-stone-500">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 group-hover:translate-x-0.5 transition" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
