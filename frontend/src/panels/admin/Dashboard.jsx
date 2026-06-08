import React, { useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import DashboardHero from './dashboard/DashboardHero';
import DashboardKpiGrid from './dashboard/DashboardKpiGrid';
import DashboardCharts from './dashboard/DashboardCharts';
import DashboardActivityFeed from './dashboard/DashboardActivityFeed';
import {
  buildWeeklyVolumeSeries,
  buildParticularsMix,
  buildTripStatusBreakdown,
  buildRecentActivities,
} from './dashboard/dashboardData';
import './dashboard/dashboardAnimated.css';

const KPI_ROUTES = {
  harvest: '/admin/procurement/harvest',
  dispatch: '/admin/tapals',
  fleet: '/admin/logistics',
  audit: '/admin/procurement/harvest',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { harvestSlips, fetchHarvestSlips, tapals, fetchTapals, trips, fetchTrips } = useAdminStore();

  const loadData = useCallback(() => {
    fetchHarvestSlips();
    fetchTapals();
    fetchTrips();
  }, [fetchHarvestSlips, fetchTapals, fetchTrips]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const metrics = useMemo(() => {
    const totalProcurementWeight = (harvestSlips ?? []).reduce(
      (sum, s) => sum + (parseFloat(s.totalWeight) || 0),
      0
    );
    const activeTripsCount = (trips ?? []).filter((t) =>
      ['In Transit', 'Assigned', 'IN_TRANSIT', 'ASSIGNED', 'ACCEPTED'].includes(t.status)
    ).length;
    const pendingApprovalsCount = (harvestSlips ?? []).filter((s) =>
      ['Pending', 'Pending Approval', 'PENDING', 'PENDING_APPROVAL'].includes(s.status)
    ).length;

    return {
      harvest: totalProcurementWeight,
      dispatch: tapals?.length ?? 0,
      fleet: activeTripsCount,
      audit: pendingApprovalsCount,
    };
  }, [harvestSlips, tapals, trips]);

  const weeklyData = useMemo(
    () => buildWeeklyVolumeSeries(harvestSlips, tapals),
    [harvestSlips, tapals]
  );

  const mixData = useMemo(() => buildParticularsMix(harvestSlips), [harvestSlips]);
  const tripStatusData = useMemo(() => buildTripStatusBreakdown(trips), [trips]);
  const activities = useMemo(
    () => buildRecentActivities(harvestSlips, tapals),
    [harvestSlips, tapals]
  );

  const hasVolumeData =
    weeklyData.some((d) => d.procurement > 0 || d.sales > 0) ||
    (harvestSlips?.length ?? 0) > 0 ||
    (tapals?.length ?? 0) > 0;

  const handleKpiNavigate = (key) => navigate(KPI_ROUTES[key] || '/admin/dashboard');

  return (
    <div className="dash-root space-y-5 pb-12 font-sans">
      <DashboardHero />
      <DashboardKpiGrid metrics={metrics} onNavigate={handleKpiNavigate} />
      <DashboardCharts
        weeklyData={weeklyData}
        mixData={mixData}
        tripStatusData={tripStatusData}
        hasVolumeData={hasVolumeData}
      />
      <DashboardActivityFeed activities={activities} onRefresh={loadData} />
    </div>
  );
};

export default Dashboard;
