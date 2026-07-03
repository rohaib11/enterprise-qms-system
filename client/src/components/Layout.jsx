import React, { useState } from 'react';

export default function Layout({ children, activeItem, setActiveItem, openMenu, toggleMenu, menuItems, onLogout }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#f1f5f9] font-sans text-slate-800">
      
      {/* 1. SIDEBAR */}
      <aside className={`${isCollapsed ? 'w-[88px]' : 'w-[280px]'} bg-slate-900 text-slate-400 flex flex-col shadow-2xl z-20 shrink-0 border-r border-slate-800 transition-all duration-300 ease-in-out`}>
        
        {/* Brand/Logo Area */}
        <div 
          className="h-[70px] flex items-center justify-center px-4 bg-slate-950/50 border-b border-slate-800/50 cursor-pointer hover:bg-slate-900 transition-colors"
          onClick={() => setActiveItem('Dashboard')}
        >
          <div className="flex items-center gap-3 w-full justify-center">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
              <span className="text-white font-bold text-sm">Q</span>
            </div>
            {!isCollapsed && (
              <h1 className="text-[15px] font-bold text-slate-100 tracking-wide whitespace-nowrap overflow-hidden">
                Quality <span className="text-indigo-400">System</span>
              </h1>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar overflow-x-hidden">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold text-slate-500 mb-4 tracking-widest uppercase whitespace-nowrap">
              Main Navigation
            </p>
          )}
          
          <nav className="space-y-1.5">
            {menuItems.map((menu, index) => {
              // Check if parent menu or one of its sub-items is active to highlight parent
              const isActive = activeItem === menu.title || (menu.subItems && menu.subItems.includes(activeItem));
              const isSubOpen = openMenu === menu.title;

              return (
                <div key={index} className="flex flex-col">
                  {/* Parent Menu Item */}
                  <div 
                    onClick={() => {
                      if (menu.isLink) setActiveItem(menu.title);
                      else {
                        toggleMenu(menu.title);
                        if (isCollapsed) setIsCollapsed(false); 
                      }
                    }}
                    className={`px-3 py-2.5 rounded-lg cursor-pointer flex items-center text-sm font-medium transition-all duration-200 ${
                      isActive && !menu.subItems
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                        : isActive ? 'bg-slate-800 text-slate-100' : 'hover:bg-slate-800 hover:text-slate-100'
                    } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                    title={isCollapsed ? menu.title : ""}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                        {menu.icon}
                      </span>
                      {!isCollapsed && <span className="whitespace-nowrap">{menu.title}</span>}
                    </div>
                    {!isCollapsed && !menu.isLink && (
                      <svg className={`w-4 h-4 transition-transform duration-300 shrink-0 ${isSubOpen ? 'rotate-0 text-slate-300' : '-rotate-90 text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>

                  {/* Sub-menu Items */}
                  {!isCollapsed && menu.subItems && isSubOpen && (
                    <div className="mt-1 mb-2 space-y-1">
                      {menu.subItems.map((subItem, subIndex) => {
                        const isSubActive = activeItem === subItem;
                        return (
                          <div 
                            key={subIndex}
                            onClick={() => setActiveItem(subItem)}
                            className={`pl-11 pr-3 py-2 rounded-lg cursor-pointer text-[13px] font-medium transition-all duration-200 flex items-center gap-2 ${
                              isSubActive 
                                ? 'text-indigo-400 bg-slate-800/50' 
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                            }`}
                          >
                            {isSubActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>}
                            <span className="whitespace-nowrap">{subItem}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-[70px] bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 z-10 sticky top-0 shadow-sm">
          
          <div className="flex items-center gap-4">
            {/* Hamburger Fold Button */}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* Dynamic Breadcrumb based on Active Item */}
            <div className="text-sm text-slate-500 font-medium hidden sm:block">
              {activeItem === 'Settings' ? 'Account Settings' : activeItem}
            </div> 
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold text-slate-700 hidden sm:block">Live System</span>
            </div>

            {/* --- SETTINGS BUTTON --- */}
            <button 
              onClick={() => setActiveItem('Settings')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                activeItem === 'Settings' 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
              title="Account Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Divider Line */}
            <div className="w-px h-6 bg-slate-200"></div>

            {/* Logout Button */}
            <button 
              onClick={onLogout}
              className="bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm flex items-center gap-2"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-8">
          <div className="max-w-[1400px] mx-auto animate-fade-in pb-10">
             {children}
          </div>
        </main>
        
      </div>
    </div>
  );
}