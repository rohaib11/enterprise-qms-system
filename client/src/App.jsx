// client/src/App.jsx
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import PDIList from './pages/PDIList';
import PDIForm from './pages/PDIForm';
import DailyReport from './pages/DailyReport';
import PlaceholderPage from './pages/PlaceholderPage';
import Login from './pages/Login';

// RCA & SECURITY
import RCAReports from './pages/RCAReports';
import RCAVideos from './pages/RCAVideos';
import Settings from './pages/Settings';

// QA AUDIT REPORTS
import QAAssembly from './pages/QAAssembly';
import QAPaint from './pages/QAPaint';

// DEALERSHIP COMPLAINTS
import ComplaintView from './pages/ComplaintView';
import ComplaintForm from './pages/ComplaintForm';
import ComplaintReport from './pages/ComplaintReport';

// BIG DATA
import BigDataLibrary from './pages/BigDataLibrary';

// ISO COMPLIANCE
import IsoCompliance from './pages/IsoCompliance';

// ASSEMBLY DPU RATIO
import DPUWeld from './pages/DPUWeld';
import DPUPaintQG2 from './pages/DPUPaintQG2';
import DPUTrimLine from './pages/DPUTrimLine';
import DPUChassisLine from './pages/DPUChassisLine';
import DPUFinalLine from './pages/DPUFinalLine';
import DPURework from './pages/DPURework';

// DASHBOARD
import Dashboard from './pages/Dashboard';

// --- ICONS & MENU DATA ---
const DocIcon = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>;
const menuItems = [
  { title: 'Dashboard', icon: <DocIcon />, isLink: true },
  { title: 'PDI', icon: <DocIcon />, subItems: ['PDI List', 'Create', 'Daily Report'] },
  { title: 'Root Cause Analysis', icon: <DocIcon />, subItems: ['View Report', 'Root Cause Analysis Videos'] },
  { title: 'QA Audit Reports', icon: <DocIcon />, subItems: ['Assembly', 'Paint'] },
  { title: 'Dealership Complaint', icon: <DocIcon />, subItems: ['View', 'Create Complaint', 'Report View'] },
  { title: 'Big Data', icon: <DocIcon />, subItems: ['Data Library'] },
  { title: 'ISO Compliance', icon: <DocIcon />, subItems: ['ISO Create'] },
  { title: 'Assembly DPU Ratio', icon: <DocIcon />, subItems: ['Weld', 'Paint QG2', 'Trim-Line', 'Chassis-Line', 'Final-Line', 'Rework'] }
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('sazgar_token');
    if (token) setIsAuthenticated(true);
  }, []);

  const [openMenu, setOpenMenu] = useState(null);               // Changed – no submenu open by default
  const [activeItem, setActiveItem] = useState('Dashboard');     // Changed – Dashboard loads first

  const toggleMenu = (menuTitle) => setOpenMenu(openMenu === menuTitle ? null : menuTitle);

  const handleLogout = () => {
    localStorage.removeItem('sazgar_token');
    localStorage.removeItem('sazgar_user');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const renderContent = () => {
    switch (activeItem) {
      // DASHBOARD
      case 'Dashboard':
        return <Dashboard />;

      case 'PDI List':
        return <PDIList setActiveItem={setActiveItem} />;
      case 'Create':
        return <PDIForm />;
      case 'Daily Report':
        return <DailyReport />;

      case 'View Report':
        return <RCAReports />;
      case 'Root Cause Analysis Videos':
        return <RCAVideos />;

      case 'Assembly':
        return <QAAssembly />;
      case 'Paint':
        return <QAPaint />;

      // DEALERSHIP COMPLAINTS
      case 'View':
        return <ComplaintView setActiveItem={setActiveItem} />;
      case 'Create Complaint':
        return <ComplaintForm />;
      case 'Report View':
        return <ComplaintReport />;

      // BIG DATA
      case 'Data Library':
        return <BigDataLibrary />;

      // ISO COMPLIANCE
      case 'ISO Create':
        return <IsoCompliance />;

      // ASSEMBLY DPU RATIO
      case 'Weld':
        return <DPUWeld />;
      case 'Paint QG2':
        return <DPUPaintQG2 />;
      case 'Trim-Line':
        return <DPUTrimLine />;
      case 'Chassis-Line':
        return <DPUChassisLine />;
      case 'Final-Line':
        return <DPUFinalLine />;
      case 'Rework':
        return <DPURework />;

      // SECURITY
      case 'Settings':
        return <Settings />;

      default:
        return <PlaceholderPage title={activeItem} />;
    }
  };

  return (
    <Layout
      activeItem={activeItem}
      setActiveItem={setActiveItem}
      openMenu={openMenu}
      toggleMenu={toggleMenu}
      menuItems={menuItems}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
}