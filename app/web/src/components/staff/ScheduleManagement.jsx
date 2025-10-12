import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  CalendarDays, 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Building,
  MapPin
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

const ScheduleManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('week'); // week, month, day

  useEffect(() => {
    // Simulate loading schedule data
    const loadScheduleData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setScheduleData({
        totalShifts: 45,
        activeShifts: 42,
        upcomingShiftsCount: 8,
        departments: ['Customer Service', 'Inventory', 'Sales', 'Support', 'Operations'],
        shifts: [
          {
            id: 'SHIFT-001',
            staffId: 'STAFF-001',
            staffName: 'John Smith',
            department: 'Customer Service',
            position: 'Customer Service Representative',
            startTime: '09:00',
            endTime: '17:00',
            date: '2024-01-15',
            status: 'scheduled',
            location: 'Main Office',
            notes: 'Regular shift'
          },
          {
            id: 'SHIFT-002',
            staffId: 'STAFF-002',
            staffName: 'Sarah Johnson',
            department: 'Inventory',
            position: 'Inventory Manager',
            startTime: '08:00',
            endTime: '16:00',
            date: '2024-01-15',
            status: 'scheduled',
            location: 'Warehouse',
            notes: 'Inventory check day'
          },
          {
            id: 'SHIFT-003',
            staffId: 'STAFF-003',
            staffName: 'Mike Wilson',
            department: 'Sales',
            position: 'Sales Representative',
            startTime: '10:00',
            endTime: '18:00',
            date: '2024-01-15',
            status: 'confirmed',
            location: 'Main Office',
            notes: 'Sales meeting at 2 PM'
          },
          {
            id: 'SHIFT-004',
            staffId: 'STAFF-004',
            staffName: 'Emily Davis',
            department: 'Support',
            position: 'Technical Support Specialist',
            startTime: '12:00',
            endTime: '20:00',
            date: '2024-01-15',
            status: 'scheduled',
            location: 'Remote',
            notes: 'Remote work day'
          },
          {
            id: 'SHIFT-005',
            staffId: 'STAFF-005',
            staffName: 'David Brown',
            department: 'Operations',
            position: 'Operations Coordinator',
            startTime: '07:00',
            endTime: '15:00',
            date: '2024-01-15',
            status: 'completed',
            location: 'Main Office',
            notes: 'Early morning setup'
          },
          {
            id: 'SHIFT-006',
            staffId: 'STAFF-001',
            staffName: 'John Smith',
            department: 'Customer Service',
            position: 'Customer Service Representative',
            startTime: '09:00',
            endTime: '17:00',
            date: '2024-01-16',
            status: 'scheduled',
            location: 'Main Office',
            notes: 'Regular shift'
          },
          {
            id: 'SHIFT-007',
            staffId: 'STAFF-002',
            staffName: 'Sarah Johnson',
            department: 'Inventory',
            position: 'Inventory Manager',
            startTime: '08:00',
            endTime: '16:00',
            date: '2024-01-16',
            status: 'scheduled',
            location: 'Warehouse',
            notes: 'Stock replenishment'
          }
        ],
        upcomingShifts: [
          {
            id: 'SHIFT-008',
            staffId: 'STAFF-003',
            staffName: 'Mike Wilson',
            department: 'Sales',
            position: 'Sales Representative',
            startTime: '10:00',
            endTime: '18:00',
            date: '2024-01-17',
            status: 'scheduled',
            location: 'Main Office',
            notes: 'Client meeting'
          },
          {
            id: 'SHIFT-009',
            staffId: 'STAFF-004',
            staffName: 'Emily Davis',
            department: 'Support',
            position: 'Technical Support Specialist',
            startTime: '12:00',
            endTime: '20:00',
            date: '2024-01-17',
            status: 'scheduled',
            location: 'Remote',
            notes: 'Remote work day'
          }
        ]
      });
      setIsLoading(false);
    };

    loadScheduleData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getShiftsForDate = (date) => {
    return scheduleData?.shifts.filter(shift => shift.date === date) || [];
  };

  const getUpcomingShifts = () => {
    const today = new Date().toISOString().split('T')[0];
    return scheduleData?.shifts.filter(shift => shift.date > today).slice(0, 5) || [];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Schedule Management - Sportify Staff</title>
        <meta name="description" content="Manage staff schedules and shifts." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
                <p className="text-gray-600 mt-2">
                  Manage staff schedules and shifts
                </p>
              </div>
              <div className="flex space-x-3">
                <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Calendar
                </button>
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Shift
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100">
                  <CalendarDays className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Shifts</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {scheduleData?.totalShifts || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Shifts</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {scheduleData?.activeShifts || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-orange-100">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {scheduleData?.upcomingShiftsCount || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Departments</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {scheduleData?.departments.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* View Controls */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    viewMode === 'day' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Day
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    viewMode === 'week' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    viewMode === 'month' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Month
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Filter
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Today's Shifts */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Shifts for {formatDate(selectedDate)}
                    </h2>
                    <div className="flex space-x-2">
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Export
                      </button>
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Print
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {getShiftsForDate(selectedDate).map((shift) => (
                      <div key={shift.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-900">{shift.staffName}</h3>
                            <div className="flex items-center">
                              {getStatusIcon(shift.status)}
                              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(shift.status)}`}>
                                {shift.status}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{shift.department} • {shift.position}</p>
                          <p className="text-sm text-gray-500">
                            {formatTime(shift.startTime)} - {formatTime(shift.endTime)} • {shift.location}
                          </p>
                          {shift.notes && (
                            <p className="text-sm text-gray-500 mt-1">Note: {shift.notes}</p>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button className="text-blue-600 hover:text-blue-700">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {getShiftsForDate(selectedDate).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No shifts scheduled for this date
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Shifts */}
            <div>
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Upcoming Shifts</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {getUpcomingShifts().map((shift) => (
                      <div key={shift.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{shift.staffName}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(shift.status)}`}>
                            {shift.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{shift.department}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(shift.date)} • {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                        </p>
                        <p className="text-sm text-gray-500">{shift.location}</p>
                      </div>
                    ))}
                    {getUpcomingShifts().length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        No upcoming shifts
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm mt-6">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Copy Previous Week
                    </button>
                    <button className="w-full border border-blue-600 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors text-sm">
                      Generate Schedule
                    </button>
                    <button className="w-full border border-green-600 text-green-600 py-2 px-4 rounded-lg hover:bg-green-50 transition-colors text-sm">
                      Send Notifications
                    </button>
                    <button className="w-full border border-purple-600 text-purple-600 py-2 px-4 rounded-lg hover:bg-purple-50 transition-colors text-sm">
                      View Conflicts
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ScheduleManagement;
