
import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Play, 
  CheckCircle, 
  CreditCard, 
  Calendar, 
  Download, 
  FileText, 
  ChevronDown,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';

/**
 * MOCK DATA FOR CHARTS
 */
const completionData = [
  { name: 'Basic', started: 450, completed: 380 },
  { name: 'Standard', started: 620, completed: 540 },
  { name: 'Premium', started: 280, completed: 250 },
];

const revenueDistribution = [
  { name: 'Standard', value: 46, color: '#b2e9e1' },
  { name: 'Premium', value: 41, color: '#0f766e' },
  { name: 'Basic', value: 13, color: '#14b8a6' },
];

const registrationTrend = [
  { date: 'Oct 22', value: 42 },
  { date: 'Oct 23', value: 38 },
  { date: 'Oct 24', value: 52 },
  { date: 'Oct 25', value: 48 },
  { date: 'Oct 26', value: 64 },
  { date: 'Oct 27', value: 56 },
  { date: 'Oct 28', value: 60 },
];

const careerPaths = [
  { name: 'Data Scientist', value: 240 },
  { name: 'Software Engineer', value: 195 },
  { name: 'Business Analyst', value: 160 },
  { name: 'UX Designer', value: 135 },
  { name: 'Product Manager', value: 120 },
];

const performanceMetrics = [
  { metric: 'Avg. Test Duration', current: '96 minutes', previous: '102 minutes', change: '-5.9%', trend: 'down' },
  { metric: 'Avg. Score', current: '78.4/100', previous: '76.2/100', change: '+2.9%', trend: 'up' },
  { metric: 'Customer Satisfaction', current: '4.7/5.0', previous: '4.5/5.0', change: '+4.4%', trend: 'up' },
  { metric: 'Counselling Bookings', current: '44.2%', previous: '38.7%', change: '+14.2%', trend: 'up' },
];

/**
 * SUB-COMPONENTS
 */

const FunnelCard = ({ title, value, percentage, dropoff, icon, iconBg, iconColor }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 flex flex-col gap-2 flex-1 hover:shadow-md transition-shadow duration-200">
    <div className="flex justify-between items-start">
      <div className="flex flex-col">
        <span className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">{title}</span>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
      </div>
      <div className={`p-2.5 rounded-xl ${iconBg} ${iconColor} shadow-sm`}>
        {icon}
      </div>
    </div>
    <div className="mt-1 flex flex-col gap-1">
      <span className="text-gray-400 text-xs font-medium">{percentage} of total</span>
      {dropoff && (
        <span className="text-orange-500 text-[10px] font-bold flex items-center gap-1">
          <TrendingDown size={12} /> {dropoff} drop-off to next stage
        </span>
      )}
    </div>
  </div>
);

const ChartContainer = ({ title, subtitle, children }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex flex-col h-full hover:shadow-md transition-shadow duration-200">
    <div className="flex justify-between items-start mb-6">
      <div>
        <h3 className="text-base font-bold text-gray-900 leading-tight">{title}</h3>
        <p className="text-gray-400 text-[11px] font-medium mt-1 tracking-tight">{subtitle}</p>
      </div>
      <div className="flex gap-2 text-gray-300">
        <FileText size={16} className="cursor-pointer hover:text-gray-500 transition-colors" />
        <Download size={16} className="cursor-pointer hover:text-gray-500 transition-colors" />
      </div>
    </div>
    <div className="flex-1 min-h-[240px]">
      {children}
    </div>
  </div>
);

/**
 * MAIN COMPONENT
 */
const Analytics = () => {
  const [selectedRange, setSelectedRange] = useState('Last 30 Days');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Date Calculation helper
  const dateRangeString = useMemo(() => {
    const end = new Date();
    const start = new Date();
    
    if (selectedRange === 'Last 7 Days') start.setDate(end.getDate() - 7);
    else if (selectedRange === 'Last 30 Days') start.setDate(end.getDate() - 30);
    else if (selectedRange === 'Last 3 Months') start.setMonth(end.getMonth() - 3);
    else if (selectedRange === 'Last 6 Months') start.setMonth(end.getMonth() - 6);
    else if (selectedRange === 'Last Year') start.setFullYear(end.getFullYear() - 1);

    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  }, [selectedRange]);

  const ranges = ['Last 7 Days', 'Last 30 Days', 'Last 3 Months', 'Last 6 Months', 'Last Year'];

  return (
    <div className="max-w-[1440px] mx-auto flex flex-col gap-8 font-['Inter'] animate-in fade-in duration-500 p-6 md:p-8 max-w-[1440px] mx-auto w-full flex flex-col gap-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 ">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Analytics & Reports</h1>
          <p className="text-gray-400 text-sm font-medium">Platform performance insights</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 border border-[#14b8a6] text-[#14b8a6] hover:bg-teal-50 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm">
            <FileText size={18} /> Export CSV
          </button>
          <button className="flex items-center gap-2 border border-[#14b8a6] text-[#14b8a6] hover:bg-teal-50 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm">
            <Download size={18} /> Export PDF
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm relative">
        <div className="flex items-center gap-2 px-3">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Showing data for:</span>
          <span className="text-gray-800 text-xs font-bold">{dateRangeString}</span>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all bg-white shadow-sm"
          >
            <Calendar size={14} className="text-[#14b8a6]" />
            {selectedRange}
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden py-1">
              {ranges.map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setSelectedRange(range);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${selectedRange === range ? 'bg-teal-50 text-[#14b8a6]' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {range}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Funnel KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <FunnelCard 
          title="Registered Users" 
          value="2,847" 
          percentage="100%" 
          icon={<Users size={20} />} 
          iconBg="bg-teal-50" iconColor="text-teal-500" 
        />
        <FunnelCard 
          title="Started Test" 
          value="1,856" 
          percentage="65.2%" 
          dropoff="34.8%" 
          icon={<Play size={20} />} 
          iconBg="bg-orange-50" iconColor="text-orange-500" 
        />
        <FunnelCard 
          title="Completed Test" 
          value="1,234" 
          percentage="43.3%" 
          dropoff="21.9%" 
          icon={<CheckCircle size={20} />} 
          iconBg="bg-emerald-50" iconColor="text-emerald-500" 
        />
        <FunnelCard 
          title="Paid for Test" 
          value="956" 
          percentage="33.6%" 
          dropoff="9.7%" 
          icon={<CreditCard size={20} />} 
          iconBg="bg-teal-50" iconColor="text-teal-500" 
        />
        <FunnelCard 
          title="Booked Counselling" 
          value="423" 
          percentage="14.9%" 
          icon={<Calendar size={20} />} 
          iconBg="bg-orange-50" iconColor="text-orange-500" 
        />
      </div>

      {/* Top Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Test Completion by Package" subtitle="Completion rates per package type">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={completionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }} 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.06)', fontWeight: 'bold' }} 
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} />
              <Bar dataKey="started" name="Started" fill="#b2e9e1" radius={[4, 4, 0, 0]} barSize={40} />
              <Bar dataKey="completed" name="Completed" fill="#0f766e" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Revenue by Package" subtitle="Distribution of revenue">
          <div className="flex flex-col md:flex-row items-center justify-center h-full gap-8">
            <div className="flex-1 w-full max-w-[240px] h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueDistribution}
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {revenueDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.06)', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-4 pr-6 min-w-[180px]">
              {revenueDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-8 border-b border-gray-50 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{item.name}</span>
                  </div>
                  <span className="text-sm font-extrabold text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </ChartContainer>
      </div>

      {/* Bottom Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="User Registration Trend" subtitle="Daily new registrations">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={registrationTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.06)', fontWeight: 'bold' }} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#14b8a6" 
                strokeWidth={3} 
                dot={{ r: 5, fill: '#14b8a6', strokeWidth: 3, stroke: '#fff' }} 
                activeDot={{ r: 8, strokeWidth: 4, stroke: '#fff', fill: '#14b8a6' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Top Career Recommendations" subtitle="Most matched career paths">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              layout="vertical" 
              data={careerPaths} 
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }} 
                width={110}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }} 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.06)', fontWeight: 'bold' }} 
              />
              <Bar dataKey="value" fill="#0f766e" radius={[0, 6, 6, 0]} barSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Performance Metrics Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden mb-12">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">Performance Metrics</h3>
          <button className="text-xs font-bold text-[#14b8a6] hover:underline transition-all">View All Data</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/20">
                <th className="px-8 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Metric</th>
                <th className="px-8 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Current</th>
                <th className="px-8 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Previous</th>
                <th className="px-8 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {performanceMetrics.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5 text-sm font-bold text-gray-700">{row.metric}</td>
                  <td className="px-8 py-5 text-center text-sm font-bold text-gray-900">{row.current}</td>
                  <td className="px-8 py-5 text-center text-sm font-medium text-gray-400 italic">{row.previous}</td>
                  <td className="px-8 py-5 text-right">
                    <span className={`inline-flex items-center gap-1 text-sm font-black ${row.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {row.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {row.change}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
