'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Activity, Zap, TrendingUp, Brain, Calendar, ArrowUpRight, ArrowDownRight, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const activityData = [
  { name: 'Mon', xp: 2400, focus: 45 },
  { name: 'Tue', xp: 1398, focus: 30 },
  { name: 'Wed', xp: 9800, focus: 120 },
  { name: 'Thu', xp: 3908, focus: 60 },
  { name: 'Fri', xp: 4800, focus: 90 },
  { name: 'Sat', xp: 3800, focus: 45 },
  { name: 'Sun', xp: 4300, focus: 60 },
];

const categoryData = [
  { name: 'Development', value: 400 },
  { name: 'Fitness', value: 300 },
  { name: 'Learning', value: 300 },
  { name: 'Finance', value: 200 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function AnalyticsPage() {
    return (
        <div className="space-y-8 pb-10 min-h-screen">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
                        SYSTEM ANALYTICS
                    </h1>
                    <p className="text-zinc-400 font-mono text-sm uppercase tracking-widest">
                        Performance Metrics & Neural Diagnostics
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10">
                        <Calendar className="mr-2 w-4 h-4" /> Last 7 Days
                    </Button>
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold">
                        <ArrowUpRight className="mr-2 w-4 h-4" /> Generate Report
                    </Button>
                </div>
            </div>

            {/* KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Neural Efficiency', value: '87%', sub: '+2.4% from last cycle', icon: Brain, color: 'text-purple-400' },
                    { label: 'Focus Output', value: '42h 12m', sub: 'Peak performance detected', icon: Zap, color: 'text-yellow-400' },
                    { label: 'System HP', value: '94/100', sub: 'Optimal condition', icon: Activity, color: 'text-emerald-400' },
                    { label: 'Tasks Executed', value: '142', sub: '12 pending alignment', icon: Target, color: 'text-blue-400' },
                ].map((stat, i) => (
                    <Card key={i} className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm hover:border-zinc-700 transition-all">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                                    <h3 className="text-3xl font-black mt-2 text-zinc-100">{stat.value}</h3>
                                    <p className="text-xs text-zinc-500 mt-1 flex items-center">
                                        {stat.sub.includes('+') ? <ArrowUpRight className="w-3 h-3 mr-1 text-emerald-500" /> : <div className="w-3 h-3 mr-1" />}
                                        {stat.sub}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* CHARTS ROW 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* ACTIVITY CHART */}
                <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-bold text-lg">
                            <TrendingUp className="w-5 h-5 text-emerald-500" /> XP Output Velocity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activityData}>
                                <defs>
                                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e4e4e7' }}
                                />
                                <Area type="monotone" dataKey="xp" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* DISTRIBUTION CHART */}
                <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-bold text-lg">
                            <Target className="w-5 h-5 text-blue-500" /> Focus Allocation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                                    ))}
                                </Pie>
                                <Tooltip 
                                     contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                     itemStyle={{ color: '#e4e4e7' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* FOCUS LOGS / HEATMAP MOCKUP */}
            <Card className="bg-zinc-900 border-zinc-800 shadow-xl overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-bold text-lg">
                        <Zap className="w-5 h-5 text-yellow-500" /> Deep Work Sessions (Recent)
                    </CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-800/50 text-zinc-400 uppercase font-mono text-xs">
                            <tr>
                                <th className="px-6 py-4">Protocol ID</th>
                                <th className="px-6 py-4">Objective</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Efficiency</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {[
                                { id: 'FC-9921', obj: 'Refactor Core Components', dur: '45m', eff: '98%', status: 'Complete' },
                                { id: 'FC-9922', obj: 'Database Migration Strategy', dur: '60m', eff: '92%', status: 'Complete' },
                                { id: 'FC-9923', obj: 'UI Polish - Dashboard', dur: '25m', eff: '88%', status: 'Interrupted' },
                                { id: 'FC-9924', obj: 'API Integration', dur: '45m', eff: '95%', status: 'Complete' },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-zinc-800/20 transition-colors">
                                    <td className="px-6 py-4 font-mono text-zinc-500">{row.id}</td>
                                    <td className="px-6 py-4 font-bold text-zinc-200">{row.obj}</td>
                                    <td className="px-6 py-4 text-zinc-400">{row.dur}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500" style={{ width: row.eff }} />
                                            </div>
                                            <span className="text-xs font-mono">{row.eff}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${row.status === 'Complete' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

        </div>
    );
}
