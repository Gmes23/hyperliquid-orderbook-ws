'use client';

interface Tab {
  id: string;
  label: string;
}

interface TabSelectorProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabSelector({ tabs, activeTab, onTabChange }: TabSelectorProps) {
  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer active:scale-[0.97] ${
            activeTab === tab.id
              ? 'text-white border-b-2 border-orange-500'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}