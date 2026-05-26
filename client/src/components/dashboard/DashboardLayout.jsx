import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardTopbar from './DashboardTopbar';
import MobileBottomNav from './MobileBottomNav';

const DashboardLayout = () => (
  <div className="dashboard-shell relative flex h-[100dvh] overflow-hidden bg-[#080808] text-[#F0EEF8]">
    <div className="grain-overlay-fixed opacity-[0.028]" />
    <DashboardSidebar />
    <div className="flex min-h-0 min-w-0 flex-1 flex-col md:ml-[240px]">
      <DashboardTopbar />
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-[#080808] px-4 py-6 pb-24 md:px-8 md:pb-10">
        <Outlet />
      </div>
    </div>
    <MobileBottomNav />
  </div>
);

export default DashboardLayout;
