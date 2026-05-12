import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardTopbar from './DashboardTopbar';
import MobileBottomNav from './MobileBottomNav';

const DashboardLayout = () => (
  <div className="dashboard-shell relative min-h-screen bg-[#080808] text-[#F0EEF8]" data-scroll-section>
    <div className="grain-overlay-fixed opacity-[0.028]" />
    <DashboardSidebar />
    <div className="flex min-h-screen min-w-0 flex-col md:ml-[240px]">
      <DashboardTopbar />
      <div className="flex-1 bg-[#080808] px-4 py-6 pb-24 md:px-8 md:pb-10">
        <Outlet />
      </div>
    </div>
    <MobileBottomNav />
  </div>
);

export default DashboardLayout;
