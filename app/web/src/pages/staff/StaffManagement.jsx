import React, { useState } from 'react';
import { 
  Users, 
  FileText, 
  Calendar,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import StaffManagement from '../../components/staff/StaffManagement';
import ReportGeneration from '../../components/staff/ReportGeneration';
import ScheduleManagement from '../../components/staff/ScheduleManagement';

const StaffManagementPage = () => {
  const [activeTab, setActiveTab] = useState('staff');

  const tabs = [
    {
      id: 'staff',
      label: 'Staff Management',
      icon: Users,
      description: 'Add, remove, and manage staff members'
    },
    {
      id: 'reports',
      label: 'Report Generation',
      icon: FileText,
      description: 'Generate various business reports'
    },
    {
      id: 'schedule',
      label: 'Schedule Management',
      icon: Calendar,
      description: 'Manage shifts and work schedules'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'staff':
        return <StaffManagement />;
      case 'reports':
        return <ReportGeneration />;
      case 'schedule':
        return <ScheduleManagement />;
      default:
        return <StaffManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Management</h1>
          <p className="text-gray-600">Manage your staff operations and schedules</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                      ${isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon 
                      className={`
                        mr-2 h-5 w-5 transition-colors duration-200
                        ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                      `} 
                    />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Description */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {(() => {
                  const activeTabData = tabs.find(tab => tab.id === activeTab);
                  const Icon = activeTabData?.icon;
                  return Icon ? <Icon className="h-5 w-5 text-gray-400" /> : null;
                })()}
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">
                  {tabs.find(tab => tab.id === activeTab)?.description}
                </p>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffManagementPage;
