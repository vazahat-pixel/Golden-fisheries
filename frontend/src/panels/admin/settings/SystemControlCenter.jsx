import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Building2,
  Hash,
  Palette,
  Printer,
  Sliders,
  Save,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';
import { AdminPageHeader, AdminCard, AdminBtn } from '../shared/adminUi';
import { useSystemSettingsStore } from '../../../store/systemSettingsStore';
import { FormField } from '../../../design-system/components/FormField';
import { Input } from '../../../design-system/components/Input';

const TABS = [
  { id: 'branding', label: 'Branding', icon: Building2 },
  { id: 'numbering', label: 'Prefixes & IDs', icon: Hash },
  { id: 'themes', label: 'Color themes', icon: Palette },
  { id: 'print', label: 'Print & layout', icon: Printer },
  { id: 'panels', label: 'Panel controls', icon: Sliders },
];

function ColorField({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase text-text-muted">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 rounded border border-card-border cursor-pointer"
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-9 px-2 text-xs border border-card-border rounded bg-white text-gray-900"
        />
      </div>
    </label>
  );
}

function NumField({ label, value, onChange, min, max }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase text-text-muted">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        className="h-9 px-2 text-xs border border-card-border rounded bg-white text-gray-900"
      />
    </label>
  );
}

export default function SystemControlCenter() {
  const { settings, loaded, saving, fetchSettings, saveSection, resetSection } =
    useSystemSettingsStore();
  const [tab, setTab] = useState('branding');
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    fetchSettings().catch(() => toast.error('Could not load system settings'));
  }, [fetchSettings]);

  useEffect(() => {
    if (settings && loaded) {
      setDraft(JSON.parse(JSON.stringify(settings)));
    }
  }, [settings, loaded, tab]);

  const patchDraft = (section, key, value) => {
    setDraft((d) => ({
      ...d,
      [section]: {
        ...d[section],
        [key]: value,
      },
    }));
  };

  const patchNested = (section, group, key, value) => {
    setDraft((d) => ({
      ...d,
      [section]: {
        ...d[section],
        [group]: {
          ...d[section]?.[group],
          [key]: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    if (!draft) return;
    try {
      await saveSection(tab, draft[tab]);
      toast.success('Saved — all apps update live via socket');
    } catch (e) {
      toast.error(e?.message || 'Save failed');
    }
  };

  const handleReset = async () => {
    if (!window.confirm(`Reset "${tab}" to factory defaults?`)) return;
    try {
      await resetSection(tab);
      toast.success('Section reset');
    } catch (e) {
      toast.error(e?.message || 'Reset failed');
    }
  };

  if (!draft) {
    return (
      <div className="p-8 flex justify-center">
        <RefreshCw className="animate-spin text-brand-olive" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <AdminPageHeader
        title="System control"
        subtitle="Prefixes, themes, print layouts & panel behaviour — saved to database, applied in real time"
        badge="Super Admin"
      />

      <div className="flex flex-wrap gap-2 border-b border-card-border pb-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase rounded-lg border transition-colors ${
                tab === t.id
                  ? 'bg-brand-olive text-white border-brand-olive'
                  : 'bg-white border-card-border text-text-muted hover:border-brand-olive/40'
              }`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      <AdminCard className="p-6 space-y-5">
        {tab === 'branding' && (
          <>
            {[
              ['companyName', 'Company name'],
              ['legalName', 'Legal name'],
              ['tagline', 'Tagline'],
              ['logoUrl', 'Logo URL'],
              ['supportPhone', 'Support phone'],
              ['supportEmail', 'Support email'],
              ['address', 'Address'],
            ].map(([key, label]) => (
              <FormField key={key} label={label}>
                <Input
                  value={draft.branding?.[key] || ''}
                  onChange={(e) => patchDraft('branding', key, e.target.value)}
                />
              </FormField>
            ))}
          </>
        )}

        {tab === 'numbering' && (
          <div className="space-y-3">
            <p className="text-xs text-text-muted">
              New documents use these prefixes (existing numbers unchanged). Example:{' '}
              <strong>{Object.values(draft.numbering || {})[0]?.prefix}-0001</strong>
            </p>
            <div className="overflow-x-auto border border-card-border rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-2">Document</th>
                    <th className="p-2">Prefix</th>
                    <th className="p-2">Pad</th>
                    <th className="p-2">Counter key</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(draft.numbering || {}).map(([id, row]) => (
                    <tr key={id} className="border-t border-card-border">
                      <td className="p-2 font-medium">{row.label || id}</td>
                      <td className="p-2">
                        <input
                          className="w-20 h-8 px-1 border border-card-border rounded uppercase text-gray-900"
                          value={row.prefix || ''}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              numbering: {
                                ...d.numbering,
                                [id]: { ...row, prefix: e.target.value.toUpperCase() },
                              },
                            }))
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min={2}
                          max={8}
                          className="w-14 h-8 px-1 border border-card-border rounded text-gray-900"
                          value={row.pad ?? 4}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              numbering: {
                                ...d.numbering,
                                [id]: { ...row, pad: Number(e.target.value) },
                              },
                            }))
                          }
                        />
                      </td>
                      <td className="p-2 text-text-muted font-mono">{row.key || id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'themes' && (
          <div className="grid gap-8 md:grid-cols-2">
            {['admin', 'driver', 'restaurant', 'fishmall'].map((panel) => (
              <div key={panel} className="space-y-3 p-4 border border-card-border rounded-lg">
                <h3 className="text-xs font-black uppercase text-brand-olive">{panel} theme</h3>
                {Object.entries(draft.themes?.[panel] || {}).map(([key, val]) =>
                  typeof val === 'string' && val.startsWith('#') ? (
                    <ColorField
                      key={key}
                      label={key}
                      value={val}
                      onChange={(v) => patchNested('themes', panel, key, v)}
                    />
                  ) : null
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'print' && (
          <div className="space-y-6">
            {Object.entries(draft.print || {}).map(([docKey, cfg]) => (
              <div key={docKey} className="p-4 border border-card-border rounded-lg space-y-3">
                <h3 className="text-xs font-black uppercase text-brand-olive">{docKey}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(cfg || {}).map(([k, v]) =>
                    typeof v === 'number' ? (
                      <NumField
                        key={k}
                        label={k}
                        value={v}
                        onChange={(n) =>
                          setDraft((d) => ({
                            ...d,
                            print: {
                              ...d.print,
                              [docKey]: { ...cfg, [k]: n },
                            },
                          }))
                        }
                      />
                    ) : typeof v === 'boolean' ? (
                      <label key={k} className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={!!v}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              print: {
                                ...d.print,
                                [docKey]: { ...cfg, [k]: e.target.checked },
                              },
                            }))
                          }
                        />
                        {k}
                      </label>
                    ) : (
                      <label key={k} className="flex flex-col gap-1 text-xs">
                        <span className="font-bold uppercase text-text-muted">{k}</span>
                        <input
                          className="h-9 px-2 border border-card-border rounded text-gray-900"
                          value={String(v ?? '')}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              print: {
                                ...d.print,
                                [docKey]: { ...cfg, [k]: e.target.value },
                              },
                            }))
                          }
                        />
                      </label>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'panels' && (
          <div className="space-y-6">
            {Object.entries(draft.panels || {}).map(([panelKey, cfg]) => (
              <div key={panelKey} className="p-4 border border-card-border rounded-lg space-y-3">
                <h3 className="text-xs font-black uppercase text-brand-olive">{panelKey}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(cfg || {}).map(([k, v]) =>
                    typeof v === 'number' ? (
                      <NumField
                        key={k}
                        label={k}
                        value={v}
                        onChange={(n) =>
                          setDraft((d) => ({
                            ...d,
                            panels: {
                              ...d.panels,
                              [panelKey]: { ...cfg, [k]: n },
                            },
                          }))
                        }
                      />
                    ) : typeof v === 'boolean' ? (
                      <label key={k} className="flex items-center gap-2 text-xs col-span-2">
                        <input
                          type="checkbox"
                          checked={!!v}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              panels: {
                                ...d.panels,
                                [panelKey]: { ...cfg, [k]: e.target.checked },
                              },
                            }))
                          }
                        />
                        {k}
                      </label>
                    ) : (
                      <label key={k} className="flex flex-col gap-1 text-xs">
                        <span className="font-bold uppercase text-text-muted">{k}</span>
                        <input
                          className="h-9 px-2 border border-card-border rounded text-gray-900"
                          value={String(v ?? '')}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              panels: {
                                ...d.panels,
                                [panelKey]: { ...cfg, [k]: e.target.value },
                              },
                            }))
                          }
                        />
                      </label>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-4 border-t border-card-border">
          <AdminBtn onClick={handleSave} loading={saving}>
            <Save size={14} className="inline mr-1" /> Save {TABS.find((t) => t.id === tab)?.label}
          </AdminBtn>
          <AdminBtn variant="outline" onClick={handleReset} disabled={saving}>
            <RotateCcw size={14} className="inline mr-1" /> Reset tab
          </AdminBtn>
        </div>
      </AdminCard>
    </div>
  );
}
