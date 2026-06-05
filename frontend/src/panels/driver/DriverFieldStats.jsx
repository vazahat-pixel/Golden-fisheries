import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { useDriverStore } from '../../store/driverStore';
import { FieldPageWrap } from '../../design-system/field-app';
import { FieldPillTabs } from '../../design-system/field-app/FieldPillTabs';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

export default function DriverFieldStats() {
  const navigate = useNavigate();
  const { myTrips, fetchMyTrips } = useDriverStore();
  const [range, setRange] = React.useState('monthly');

  React.useEffect(() => {
    fetchMyTrips();
  }, [fetchMyTrips]);

  const chartData = useMemo(() => {
    const counts = MONTHS.map((m, i) => ({ name: m, value: 0, index: i }));
    (myTrips || []).forEach((t) => {
      const d = t.createdAt ? new Date(t.createdAt) : new Date();
      const m = d.getMonth();
      if (m < 6) counts[m].value += 1;
    });
    return counts;
  }, [myTrips]);

  const total = chartData.reduce((s, c) => s + c.value, 0);
  const highlight = chartData.reduce((best, c) => (c.value > best.value ? c : best), chartData[0]);

  return (
    <FieldPageWrap subtitle="Trip statistics">
      <button
        type="button"
        onClick={() => navigate('/driver/dashboard')}
        className="fa-muted flex items-center gap-2 text-xs font-semibold mb-2 fa-tap"
      >
        <ArrowLeft size={16} /> Back
      </button>
      <h1 className="text-xl font-semibold tracking-tight mb-4">Statistics</h1>

      <FieldPillTabs
        options={[
          { label: 'Daily', value: 'daily' },
          { label: 'Weekly', value: 'weekly' },
          { label: 'Monthly', value: 'monthly' },
        ]}
        value={range}
        onChange={setRange}
      />

      <div className="fa-surface p-5 mt-4 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs fa-muted">Total trips</p>
            <p className="text-2xl font-bold mt-1">{total}</p>
          </div>
          <div className="flex items-center gap-1 text-[var(--fa-accent)] text-sm font-semibold">
            <TrendingUp size={18} />
            <span>Active</span>
          </div>
        </div>

        {total === 0 ? (
          <p className="text-center text-sm fa-muted py-10">No trip data yet — complete runs to see stats here.</p>
        ) : (
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="18%">
                <XAxis dataKey="name" tick={{ fill: '#8b8b8b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8b8b8b', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
                <Bar dataKey="value" radius={[8, 8, 4, 4]}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.value > 0 && entry.name === highlight.name ? '#c9a962' : 'rgba(255,255,255,0.1)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="fa-surface p-4">
          <p className="text-[10px] fa-muted uppercase">Completed</p>
          <p className="text-lg font-bold mt-1">{myTrips?.filter((t) => ['DELIVERED', 'CLOSED'].includes(t.status)).length || 0}</p>
        </div>
        <div className="fa-surface p-4">
          <p className="text-[10px] fa-muted uppercase">In progress</p>
          <p className="text-lg font-bold mt-1">
            {myTrips?.filter((t) => ['ASSIGNED', 'STARTED', 'PICKED'].includes(t.status)).length || 0}
          </p>
        </div>
      </div>
    </FieldPageWrap>
  );
}
