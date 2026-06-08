import React from 'react';
import { Calendar, TrendingUp, PieChart as PieIcon, BarChart3 } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { EmptyChartSvg } from './DashboardSvgs';

const CHART_TOOLTIP = {
  contentStyle: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(62,39,35,0.12)',
    fontSize: '11px',
    fontWeight: 600,
  },
  labelStyle: { fontWeight: 800, color: '#6A7051' },
};

const ChartEmpty = ({ message }) => (
  <div className="dash-empty-chart">
    <EmptyChartSvg />
    <p className="text-xs font-semibold text-center max-w-xs">{message}</p>
  </div>
);

const DashboardCharts = ({ weeklyData, mixData, tripStatusData, hasVolumeData }) => {
  const hasMix = mixData.length > 0;
  const hasTrips = tripStatusData.length > 0;
  const totalProc = weeklyData.reduce((s, d) => s + d.procurement, 0);
  const totalSales = weeklyData.reduce((s, d) => s + d.sales, 0);
  const maxDay = weeklyData.reduce(
    (best, d) => (d.procurement + d.sales > (best?.procurement || 0) + (best?.sales || 0) ? d : best),
    weeklyData[0]
  );

  return (
    <div className="space-y-4 dash-stagger">
      {/* Summary metrics strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {[
          { label: '7-Day Procurement', value: `${totalProc.toLocaleString()} kg`, pct: totalProc + totalSales > 0 ? (totalProc / (totalProc + totalSales)) * 100 : 0 },
          { label: '7-Day Dispatch', value: `${totalSales.toLocaleString()} kg`, pct: totalProc + totalSales > 0 ? (totalSales / (totalProc + totalSales)) * 100 : 0 },
          { label: 'Peak Day', value: maxDay?.fullDate || '—', pct: 100 },
          { label: 'Categories', value: String(mixData.length), pct: Math.min(mixData.length * 16, 100) },
        ].map((m) => (
          <div key={m.label} className="dash-chart-panel dash-chart-panel--compact">
            <p className="text-[8px] font-black uppercase tracking-wider text-text-muted">{m.label}</p>
            <p className="text-sm font-black text-brand-olive mt-0.5 tabular-nums">{m.value}</p>
            <div className="dash-metric-bar mt-2">
              <div className="dash-metric-bar__fill" style={{ width: `${m.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Volume trends — large area chart */}
        <div className="xl:col-span-7 dash-chart-panel">
          <div className="dash-chart-panel__head flex flex-wrap justify-between items-start gap-2">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive flex items-center gap-1.5">
                <TrendingUp size={14} className="text-[#C5A021]" /> Volume Trends
              </h3>
              <p className="text-[10px] font-medium text-text-secondary mt-0.5">
                Procurement vs sales dispatched — weekly weight comparison
              </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#6A7051] flex items-center gap-1 bg-[#6A7051]/10 px-2 py-1 rounded-md">
              <Calendar size={11} /> Last 7 Days
            </span>
          </div>
          <div className="dash-chart-panel__body h-[320px]">
            {!hasVolumeData ? (
              <ChartEmpty message="No volume data yet. Create a harvest slip or sales tapal to see animated trends." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProcurement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6A7051" stopOpacity={0.55} />
                      <stop offset="95%" stopColor="#6A7051" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C5A021" stopOpacity={0.55} />
                      <stop offset="95%" stopColor="#C5A021" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8C4CF" />
                  <XAxis dataKey="name" stroke="#6A7051" fontSize={11} tickLine={false} fontWeight={700} />
                  <YAxis stroke="#6A7051" fontSize={11} tickLine={false} fontWeight={700} />
                  <Tooltip {...CHART_TOOLTIP} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 700, paddingTop: 8 }} />
                  <Area
                    type="monotone"
                    name="Farmer Receipts (kg)"
                    dataKey="procurement"
                    stroke="#6A7051"
                    strokeWidth={2.5}
                    fill="url(#colorProcurement)"
                    animationDuration={1200}
                    animationEasing="ease-out"
                  />
                  <Area
                    type="monotone"
                    name="Buyer Shipments (kg)"
                    dataKey="sales"
                    stroke="#C5A021"
                    strokeWidth={2.5}
                    fill="url(#colorSales)"
                    animationDuration={1400}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Particulars mix — donut */}
        <div className="xl:col-span-5 dash-chart-panel">
          <div className="dash-chart-panel__head">
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive flex items-center gap-1.5">
              <PieIcon size={14} className="text-[#C5A021]" /> Particulars Mix
            </h3>
            <p className="text-[10px] font-medium text-text-secondary mt-0.5">
              Fish & shrimp category ratio from harvest volumes
            </p>
          </div>
          <div className="dash-chart-panel__body h-[320px]">
            {!hasMix ? (
              <ChartEmpty message="Stock mix chart appears when harvest slips include line items." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mixData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={1000}
                    animationEasing="ease-out"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#6A7051', strokeWidth: 1 }}
                  >
                    {mixData.map((entry) => (
                      <Cell key={entry.fullName} fill={entry.fill} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    {...CHART_TOOLTIP}
                    formatter={(v, _n, props) => [`${v} kg`, props.payload.fullName]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Second row — bar + fleet status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="dash-chart-panel">
          <div className="dash-chart-panel__head">
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive flex items-center gap-1.5">
              <BarChart3 size={14} /> Daily Volume Breakdown
            </h3>
            <p className="text-[10px] font-medium text-text-secondary mt-0.5">Side-by-side procurement & dispatch per day</p>
          </div>
          <div className="dash-chart-panel__body h-[260px]">
            {!hasVolumeData ? (
              <ChartEmpty message="Daily bars populate from your last 7 days of operations." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} barGap={4} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8C4CF" />
                  <XAxis dataKey="name" stroke="#6A7051" fontSize={11} tickLine={false} fontWeight={700} />
                  <YAxis stroke="#6A7051" fontSize={11} tickLine={false} fontWeight={700} />
                  <Tooltip {...CHART_TOOLTIP} />
                  <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 700 }} />
                  <Bar
                    dataKey="procurement"
                    name="Procurement (kg)"
                    fill="#6A7051"
                    radius={[4, 4, 0, 0]}
                    animationDuration={900}
                  />
                  <Bar
                    dataKey="sales"
                    name="Dispatch (kg)"
                    fill="#C5A021"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1100}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="dash-chart-panel">
          <div className="dash-chart-panel__head">
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive flex items-center gap-1.5">
              <TrendingUp size={14} className="text-emerald-600" /> Fleet Status Distribution
            </h3>
            <p className="text-[10px] font-medium text-text-secondary mt-0.5">Trip lifecycle breakdown across logistics</p>
          </div>
          <div className="dash-chart-panel__body h-[260px]">
            {!hasTrips ? (
              <ChartEmpty message="Assign drivers to tapals to populate fleet status analytics." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={tripStatusData}
                  layout="vertical"
                  margin={{ top: 8, right: 24, left: 8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E8C4CF" />
                  <XAxis type="number" stroke="#6A7051" fontSize={11} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#6A7051" fontSize={11} tickLine={false} width={72} fontWeight={700} />
                  <Tooltip {...CHART_TOOLTIP} />
                  <Bar dataKey="value" name="Trips" radius={[0, 6, 6, 0]} animationDuration={800}>
                    {tripStatusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
