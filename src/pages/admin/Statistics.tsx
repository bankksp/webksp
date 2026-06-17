import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Globe, Monitor, Smartphone, Tablet, 
  Calendar, Filter, Download, RefreshCw,
  Search, ChevronLeft, ChevronRight
} from 'lucide-react';
import { getDetailedStats } from '../../services/dataService';
import { motion } from 'motion/react';
import { toast } from 'sonner';

const COLORS = ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const Statistics = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());

  const fetchData = async () => {
    setLoading(true);
    try {
      const stats = await getDetailedStats();
      setData(stats || []);
    } catch (error) {
      toast.error('ไม่สามารถดึงข้อมูลสถิติได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Process Data
  const todayStr = new Date().toISOString().split('T')[0];
  const todayVisits = data.filter(item => item.timestamp && item.timestamp.startsWith(todayStr)).length;

  const filteredData = data.filter(item => {
    const date = new Date(item.timestamp);
    const monthMatch = filterMonth === 'all' || (date.getMonth() + 1).toString() === filterMonth;
    const yearMatch = date.getFullYear().toString() === filterYear;
    return monthMatch && yearMatch;
  });

  // 1. Monthly Data
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const count = data.filter(item => {
      const d = new Date(item.timestamp);
      return d.getMonth() + 1 === month && d.getFullYear().toString() === filterYear;
    }).length;
    return {
      name: new Intl.DateTimeFormat('th-TH', { month: 'short' }).format(new Date(2000, i)),
      views: count
    };
  });

  // 2. Device Data
  const deviceCounts = filteredData.reduce((acc: any, item) => {
    acc[item.device] = (acc[item.device] || 0) + 1;
    return acc;
  }, {});
  const deviceData = Object.keys(deviceCounts).map(key => ({ name: key, value: deviceCounts[key] }));

  // 3. Country Data
  const countryCounts = filteredData.reduce((acc: any, item) => {
    acc[item.country] = (acc[item.country] || 0) + 1;
    return acc;
  }, {});
  const countryData = Object.keys(countryCounts)
    .map(key => ({ name: key, value: countryCounts[key] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);

  // 4. OS Data
  const osCounts = filteredData.reduce((acc: any, item) => {
    acc[item.os] = (acc[item.os] || 0) + 1;
    return acc;
  }, {});
  const osData = Object.keys(osCounts).map(key => ({ name: key, value: osCounts[key] }));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-gray-500 font-medium">กำลังประมวลผลข้อมูลสถิติ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">สถิติการเข้าชมเว็บไซต์</h1>
          <p className="text-gray-500">วิเคราะห์ข้อมูลผู้ใช้งานและพฤติกรรมการเข้าชม</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
            <Calendar size={18} className="text-gray-400" />
            <select 
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700 outline-none"
            >
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
            <Filter size={18} className="text-gray-400" />
            <select 
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700 outline-none"
            >
              <option value="all">ทุกเดือน</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Intl.DateTimeFormat('th-TH', { month: 'long' }).format(new Date(2000, i))}
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={fetchData}
            className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'ยอดเข้าชมรวมทั้งหมด', value: data.length, icon: <Globe />, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'ยอดเข้าชมวันนี้', value: todayVisits, icon: <Calendar />, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'ยอดเข้าชมตามตัวกรอง', value: filteredData.length, icon: <Filter />, color: 'bg-blue-50 text-blue-600' },
          { label: 'ผู้ใช้ Mobile', value: deviceCounts['Mobile'] || 0, icon: <Smartphone />, color: 'bg-amber-50 text-amber-600' },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">{card.label}</p>
            <p className="text-3xl font-black text-gray-900 tracking-tighter">{card.value.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <TrendingUp size={24} className="text-indigo-600" />
            แนวโน้มการเข้าชมรายเดือน ({filterYear})
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="views" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Smartphone size={24} className="text-blue-600" />
            สัดส่วนอุปกรณ์
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Globe size={24} className="text-emerald-600" />
            ประเทศที่เข้าชมสูงสุด
          </h3>
          <div className="space-y-6">
            {countryData.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-700">{item.name}</span>
                  <span className="text-indigo-600">{item.value.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / filteredData.length) * 100}%` }}
                    className="bg-indigo-500 h-full rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Monitor size={24} className="text-purple-600" />
            ระบบปฏิบัติการ (OS)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={osData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={100}
                  paddingAngle={0}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {osData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Visits Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">รายการเข้าชมล่าสุด</h3>
          <button className="text-indigo-600 text-sm font-bold flex items-center gap-2 hover:underline">
            <Download size={16} /> ส่งออกข้อมูล (CSV)
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">เวลา</th>
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">ประเทศ</th>
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">อุปกรณ์</th>
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">เบราว์เซอร์</th>
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">ระบบปฏิบัติการ</th>
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">หน้า</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredData.slice(0, 15).map((visit, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-4 text-sm text-gray-600">
                    {new Date(visit.timestamp).toLocaleString('th-TH')}
                  </td>
                  <td className="px-8 py-4">
                    <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">
                      <Globe size={12} /> {visit.country}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      {visit.device === 'Mobile' ? <Smartphone size={14} /> : <Monitor size={14} />}
                      {visit.device}
                    </div>
                  </td>
                  <td className="px-8 py-4 text-sm text-gray-600">{visit.browser}</td>
                  <td className="px-8 py-4 text-sm text-gray-600">{visit.os}</td>
                  <td className="px-8 py-4">
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {visit.page}
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

const TrendingUp = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);
