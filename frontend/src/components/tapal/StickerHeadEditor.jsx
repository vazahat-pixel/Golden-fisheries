import React from 'react';
import { STICKER_HEAD_PRESETS, DEFAULT_STICKER_HEAD } from '../../constants/stickerHead';
import { Building, Phone, MapPin, Tag, RefreshCw } from 'lucide-react';

export const StickerHeadEditor = ({ values = {}, onChange, compact = false }) => {
  const current = {
    companyName: values.companyName ?? DEFAULT_STICKER_HEAD.companyName,
    subtitle: values.subtitle ?? DEFAULT_STICKER_HEAD.subtitle,
    location: values.location ?? DEFAULT_STICKER_HEAD.location,
    phone: values.phone ?? DEFAULT_STICKER_HEAD.phone,
    title: values.title ?? DEFAULT_STICKER_HEAD.title,
  };

  const handleFieldChange = (field, val) => {
    onChange({
      ...current,
      [field]: val,
    });
  };

  const handlePresetChange = (presetId) => {
    const preset = STICKER_HEAD_PRESETS.find(p => p.id === presetId);
    if (preset) {
      onChange({ ...preset.data });
    }
  };

  const handleResetDefault = () => {
    onChange({ ...DEFAULT_STICKER_HEAD });
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Preset selector bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <Tag size={13} className="text-[#6A7051]" />
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Head Preset:</span>
          <select
            className="bg-white border border-slate-300 px-2.5 py-1 text-xs font-semibold rounded-sm text-slate-800 outline-none focus:ring-1 focus:ring-[#6A7051]"
            onChange={(e) => handlePresetChange(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>— Select a preset template —</option>
            {STICKER_HEAD_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handleResetDefault}
          className="text-[10px] text-[#6A7051] hover:text-[#5F6846] font-bold uppercase tracking-wider flex items-center gap-1 hover:underline"
        >
          <RefreshCw size={10} /> Reset Default
        </button>
      </div>

      {/* Editor Fields */}
      <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-3 text-xs`}>
        <div className="flex flex-col">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#6A7051] mb-1 flex items-center gap-1.5">
            <Building size={12} /> Company Name *
          </label>
          <input
            type="text"
            required
            value={current.companyName}
            onChange={(e) => handleFieldChange('companyName', e.target.value)}
            placeholder="e.g. M. K. FISHERIES"
            className="bg-white border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 uppercase focus:ring-1 focus:ring-[#6A7051] outline-none"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#6A7051] mb-1">
            Subtitle / Business Line
          </label>
          <input
            type="text"
            value={current.subtitle}
            onChange={(e) => handleFieldChange('subtitle', e.target.value)}
            placeholder="e.g. WHOLE SALE FISH MERCHANTS"
            className="bg-white border border-slate-200 px-3 py-2 text-xs text-slate-800 uppercase focus:ring-1 focus:ring-[#6A7051] outline-none"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#6A7051] mb-1 flex items-center gap-1.5">
            <MapPin size={12} /> Branch Location / Address
          </label>
          <input
            type="text"
            value={current.location}
            onChange={(e) => handleFieldChange('location', e.target.value)}
            placeholder="e.g. KARWAR & MANGALORE (KARNATAKA)"
            className="bg-white border border-slate-200 px-3 py-2 text-xs text-slate-800 uppercase focus:ring-1 focus:ring-[#6A7051] outline-none"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#6A7051] mb-1 flex items-center gap-1.5">
            <Phone size={12} /> Contact / Mobile Numbers
          </label>
          <input
            type="text"
            value={current.phone}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            placeholder="e.g. Mob : 9019411439, 9663655558"
            className="bg-white border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:ring-1 focus:ring-[#6A7051] outline-none"
          />
        </div>

        <div className={`flex flex-col ${compact ? '' : 'md:col-span-2'}`}>
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#6A7051] mb-1">
            Dispatch Banner Title
          </label>
          <input
            type="text"
            value={current.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            placeholder="e.g. ★ TAPAL / LOGISTICS DISPATCH ★"
            className="bg-white border border-slate-200 px-3 py-2 text-xs font-bold text-[#1e3a8a] uppercase focus:ring-1 focus:ring-[#6A7051] outline-none"
          />
        </div>
      </div>

      {/* Mini Live Preview Box */}
      <div className="border border-dashed border-slate-300 p-3 bg-white text-center rounded-sm">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Sticker Head Live Preview</p>
        <div className="py-1">
          <p className="text-sm font-bold tracking-wide text-[#1e3a8a] uppercase m-0 leading-tight">
            {current.companyName || '—'}
          </p>
          {current.subtitle && (
            <p className="text-[10px] font-bold text-[#1e3a8a] uppercase m-0 leading-tight">
              {current.subtitle}
            </p>
          )}
          {current.location && (
            <p className="text-[9px] font-semibold text-[#1e3a8a] uppercase m-0 leading-tight">
              {current.location}
            </p>
          )}
          {current.phone && (
            <p className="text-[9px] font-semibold text-[#1e3a8a] m-0 leading-tight">
              {current.phone}
            </p>
          )}
          <div className="border-t border-black/30 mt-1 pt-1">
            <p className="text-[10px] font-bold text-[#1e3a8a] tracking-wide m-0">
              {current.title || '★ TAPAL / LOGISTICS DISPATCH ★'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default StickerHeadEditor;
