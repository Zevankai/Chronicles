import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabPanelProps {
  tabs: Tab[];
  children: React.ReactNode[];
  defaultTab?: string;
  twoRows?: boolean;
}

export function TabPanel({ tabs, children, defaultTab, twoRows = false }: TabPanelProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

  const activeIndex = tabs.findIndex((t) => t.id === activeTab);

  if (twoRows && tabs.length > 4) {
    const mid = Math.ceil(tabs.length / 2);
    const row1 = tabs.slice(0, mid);
    const row2 = tabs.slice(mid);

    return (
      <div className="tabs">
        <div className="tab-list tab-list-two-rows">
          <div className="tab-row">
            {row1.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="tab-row">
            {row2.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="tab-panel">
          {children[activeIndex] ?? null}
        </div>
      </div>
    );
  }

  return (
    <div className="tabs">
      <div className="tab-list">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-panel">
        {children[activeIndex] ?? null}
      </div>
    </div>
  );
}
