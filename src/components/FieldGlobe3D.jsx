import { useState } from 'react';

/**
 * Interactive 3D Perspective Field Deployment Telemetry Stage.
 * Plots Mohamed Rabea's actual verified humanitarian operations footprint from src/content.js:
 *  - Cairo EOC (Hub)
 *  - Qostol & Arqeen (Sudan crisis border crossings)
 *  - Syria–Türkiye (Earthquake response)
 *  - El-Arish (Gaza response logistics)
 * Zero invented statistics or locations. Interactive node selection illuminates signal arcs in 3D space.
 */
const NODES = [
  {
    id: 'cairo',
    code: 'HUB-00',
    x: 34,
    y: 50,
    tagPos: 'bottom',
    coords: '30.04°N / 31.23°E',
    en: {
      place: 'Cairo · EOC Central',
      short: 'Cairo EOC',
      context: 'Egyptian Red Crescent · 2021 — Present',
      detail: 'Emergency Operations Center supervision, volunteer dispatch, operational dashboards, and the EOC Smart Command Center.',
    },
    ar: {
      place: 'القاهرة · مركز العمليات',
      short: 'القاهرة EOC',
      context: 'الهلال الأحمر المصري · 2021 — حتى الآن',
      detail: 'إشراف مركز عمليات الطوارئ، تنسيق فرق المتطوعين، لوحات البيانات التشغيلية، وتطوير منصة إدارة المركز.',
    },
  },
  {
    id: 'sudan',
    code: 'FLD-01',
    x: 28,
    y: 83,
    tagPos: 'bottom',
    coords: '22.00°N / 31.40°E',
    en: {
      place: 'Qostol & Arqeen',
      short: 'Qostol & Arqeen',
      context: 'Sudan Crisis · Border Crossings',
      detail: 'Field deployment supporting refugees at two border crossings during a fast-moving displacement response.',
    },
    ar: {
      place: 'قسطل وأرقين',
      short: 'قسطل وأرقين',
      context: 'أزمة السودان · المعابر الحدودية',
      detail: 'مهمة ميدانية لدعم اللاجئين عند المعبرين الحدوديين خلال استجابة نزوح متسارعة.',
    },
  },
  {
    id: 'syria-turkiye',
    code: 'FLD-02',
    x: 72,
    y: 16,
    tagPos: 'top',
    coords: '37.00°N / 37.00°E',
    en: {
      place: 'Syria–Türkiye',
      short: 'Syria–Türkiye',
      context: 'Earthquake Response',
      detail: 'Assisted relief organization and distribution following the Syria–Türkiye earthquake.',
    },
    ar: {
      place: 'سوريا — تركيا',
      short: 'سوريا — تركيا',
      context: 'استجابة الزلزال',
      detail: 'المشاركة في تنظيم وتوزيع الإغاثة الإنسانية عقب زلزال سوريا وتركيا.',
    },
  },
  {
    id: 'el-arish',
    code: 'FLD-03',
    x: 72,
    y: 44,
    tagPos: 'top',
    coords: '31.13°N / 33.80°E',
    en: {
      place: 'El-Arish',
      short: 'El-Arish',
      context: 'Gaza Response · Logistics',
      detail: 'Supported humanitarian logistics and operational coordination during the Gaza response.',
    },
    ar: {
      place: 'العريش',
      short: 'العريش',
      context: 'استجابة غزة · اللوجستيات والتنسيق',
      detail: 'دعم العمليات اللوجستية والتنسيق الميداني خلال استجابة غزة في العريش.',
    },
  },
];

export function FieldGlobe3D({ rtl = false }) {
  const [activeId, setActiveId] = useState('cairo');
  const active = NODES.find((n) => n.id === activeId) || NODES[0];
  const info = rtl ? active.ar : active.en;
  const hub = NODES[0];

  return (
    <div className="fg3d-shell" dir={rtl ? 'rtl' : 'ltr'}>
      <div className="fg3d-head">
        <div>
          <span className="ec-tag">{rtl ? 'خريطة الانتشار الميداني' : 'FIELD DEPLOYMENT TOPOLOGY'}</span>
          <h3>{rtl ? 'حيث اختُبرت الأنظمة على أرض الواقع.' : 'Where systems met field reality.'}</h3>
        </div>
        <div className="fg3d-tabs" role="tablist" aria-label={rtl ? 'مواقع المهام الميدانية' : 'Field deployment locations'}>
          {NODES.map((node) => {
            const loc = rtl ? node.ar : node.en;
            const isActive = node.id === activeId;
            return (
              <button
                key={node.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`fg3d-tab${isActive ? ' is-active' : ''}`}
                onClick={() => setActiveId(node.id)}
              >
                <b>{node.code}</b>
                <span>{loc.place}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="fg3d-grid-layout">
        {/* 3D Perspective Tilted Coordinate Plane */}
        <div className="fg3d-stage" aria-hidden="true">
          <div className="fg3d-plane">
            <svg viewBox="0 0 100 100" className="fg3d-svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="fgArcActive" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C0C0C0" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#E10600" stopOpacity="1" />
                </linearGradient>
              </defs>
              {/* Calibrated tactical coordinate grid */}
              {[15, 30, 45, 60, 75, 90].map((v) => (
                <g key={v}>
                  <line x1={v} y1="0" x2={v} y2="100" className="fg3d-gridline" />
                  <line x1="0" y1={v} x2="100" y2={v} className="fg3d-gridline" />
                </g>
              ))}
              {/* Radar concentric rings centered on Cairo EOC */}
              <circle cx={hub.x} cy={hub.y} r="14" className="fg3d-ring" />
              <circle cx={hub.x} cy={hub.y} r="28" className="fg3d-ring fg3d-ring--dashed" />
              <circle cx={hub.x} cy={hub.y} r="44" className="fg3d-ring" />

              {/* Signal arcs from Cairo EOC hub to each deployment */}
              {NODES.slice(1).map((node) => {
                const mx = (hub.x + node.x) / 2 + (node.y < hub.y ? -8 : 8);
                const my = (hub.y + node.y) / 2 - 12;
                const isSelected = activeId === node.id || activeId === 'cairo';
                return (
                  <path
                    key={node.id}
                    d={`M ${hub.x} ${hub.y} Q ${mx} ${my} ${node.x} ${node.y}`}
                    className={`fg3d-arc${isSelected ? ' is-lit' : ''}`}
                    stroke={isSelected ? 'url(#fgArcActive)' : 'rgba(192,192,192,0.2)'}
                  />
                );
              })}
            </svg>

            {/* Elevated 3D Pins */}
            {NODES.map((node) => {
              const isSelected = node.id === activeId;
              const loc = rtl ? node.ar : node.en;
              return (
                <button
                  key={node.id}
                  type="button"
                  tabIndex={-1}
                  className={`fg3d-pin${isSelected ? ' is-active' : ''}${node.id === 'cairo' ? ' is-hub' : ''}`}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  onClick={() => setActiveId(node.id)}
                >
                  <i className="fg3d-pin-pulse" />
                  <i className="fg3d-pin-dot" />
                  <span className={`fg3d-pin-tag${node.tagPos === 'bottom' ? ' is-below' : ''}`}>{loc.short}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Node Telemetry Readout */}
        <div className="fg3d-readout" role="tabpanel">
          <div className="fg3d-readout-top">
            <span className="fg3d-code">{active.code}</span>
            <span className="fg3d-coords" dir="ltr">{active.coords}</span>
          </div>
          <h4>{info.place}</h4>
          <small>{info.context}</small>
          <p>{info.detail}</p>
          <div className="fg3d-status-bar">
            <i aria-hidden="true" />
            <span>{rtl ? 'سجل ميداني موثّق · الهلال الأحمر المصري' : 'VERIFIED FIELD RECORD · ERC'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
