import React, { useState } from 'react';
import { X, PlayCircle, ExternalLink, Copy, Check } from 'lucide-react';
import { VideoResource } from '../../domain/curriculum/CompetenceMatrix.js';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoResource | null;
  goalTitle?: string;
  goalId?: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  video,
  goalTitle,
  goalId,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !video) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(video.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API is restricted
      const textarea = document.createElement('textarea');
      textarea.value = video.url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenExternal = () => {
    window.open(video.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 sm:p-6 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 shrink-0">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              {goalId && (
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  {goalId} {goalTitle ? `· ${goalTitle}` : ''}
                </span>
              )}
              <h3 className="text-base sm:text-lg font-bold text-white truncate">
                Videoforklaring
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Lukk videovindu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Innhold */}
        <div className="py-5 space-y-4">
          <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/60">
            <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/50 mb-2">
              Kanal: {video.channel}
            </span>
            <h4 className="text-base font-bold text-slate-100 mb-1">{video.title}</h4>
            <p className="text-xs text-slate-400">
              Anbefalt teoriforklaring og eksempelløsning tilpasset kompetansemålet i 1T.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200 leading-relaxed">
            💡 Videoen åpnes direkte hos YouTube i en ny fane, eller du kan kopiere lenken om nettleseren din blokkerer eksterne vinduer.
          </div>
        </div>

        {/* Handlinger */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-2.5 justify-end">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Lenke kopiert!' : 'Kopier lenke'}</span>
          </button>
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              // Sikrer at window.open kalles som fallback i webviews/PWAs
              handleOpenExternal();
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-600/25 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Åpne på YouTube</span>
          </a>
        </div>
      </div>
    </div>
  );
};
