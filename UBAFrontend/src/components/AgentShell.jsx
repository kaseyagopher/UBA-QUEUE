import { Outlet } from 'react-router-dom';
import NavbarAgent from './NavbarAgent.jsx';
import { useState } from 'react';

export default function AgentShell() {
  const [navCollapsed, setNavCollapsed] = useState(false);

  return (
    <div className="h-screen flex bg-customRed">
      {/* Sidebar */}
      <div className={`h-screen ${navCollapsed ? 'w-20' : 'w-96'} bg-customRed flex justify-center transition-all duration-300 ease-in-out`}>
        <NavbarAgent collapsed={navCollapsed} onToggle={() => setNavCollapsed(p => !p)} />
      </div>

      {/* Contenu Principal */}
      <div className="bg-white w-full p-0 transition-all duration-300">
          <Outlet />
      </div>
    </div>
  );
}
