/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Ticket, LDOStaff } from '../types';
import { LDO_STAFF_LIST } from '../data/mockTickets';
import { 
  BarChart3, 
  Users, 
  CheckCircle, 
  Clock, 
  Star, 
  FolderLock, 
  AlertCircle,
  Video,
  Monitor,
  FileSpreadsheet
} from 'lucide-react';

interface AdminDashboardProps {
  tickets: Ticket[];
}

export default function AdminDashboard({ tickets }: AdminDashboardProps) {
  // Calculations
  const total = tickets.length;
  const pending = tickets.filter(t => t.status === 'pending').length;
  const processing = tickets.filter(t => t.status === 'processing').length;
  const completed = tickets.filter(t => t.status === 'completed').length;
  const rejected = tickets.filter(t => t.status === 'rejected').length;

  const ratedTickets = tickets.filter(t => t.satisfactionScore !== null);
  const averageRating = ratedTickets.length > 0 
    ? (ratedTickets.reduce((sum, t) => sum + (t.satisfactionScore || 0), 0) / ratedTickets.length).toFixed(1)
    : 'N/A';

  // Category Counts
  const mediaCount = tickets.filter(t => t.jobDetails.category === 'งานสื่อ').length;
  const sysCount = tickets.filter(t => t.jobDetails.category === 'งานระบบ').length;
  const docCount = tickets.filter(t => t.jobDetails.category === 'งานเอกสาร').length;

  // Max count to normalize progress bars
  const maxCategoryCount = Math.max(mediaCount, sysCount, docCount, 1);

  // Staff workloads
  const staffWorkloads = LDO_STAFF_LIST.map(staff => {
    const assignedTicketsCount = tickets.filter(t => t.assignedTo === staff.name && (t.status === 'processing' || t.status === 'pending')).length;
    return {
      ...staff,
      workload: assignedTicketsCount
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">รายงานสถิติและวิเคราะห์ KPIs ภาพรวม</h2>
          <p className="text-xs text-slate-500">
            แสดงข้อมูลสถานะภาระรับผิดชอบ สถิติผู้ร้องขอแยกหมวดหมู่ และระดับความพึงพอใจการบริการของ LDO Hub
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono bg-white px-3 py-1.5 rounded-lg border border-slate-200 self-start md:self-auto">
          อัปเดตล่าสุด: {new Date().toLocaleTimeString('th-TH')}
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Total */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/85 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 font-sans">จำนวนธุรกรรมคำขอรวม</span>
            <div className="text-3xl font-bold text-slate-800 font-mono">{total}</div>
            <p className="text-[10px] text-slate-400">จากช่องทางเว็บพอร์ทัล</p>
          </div>
          <div className="bg-slate-100 text-slate-600 p-3 rounded-xl">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Pending */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/85 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">คำขอยังค้างอนุมัติสะสม</span>
            <div className="text-3xl font-bold text-amber-600 font-mono">{pending}</div>
            <p className="text-[10px] text-amber-600 font-medium">รอเข้าปฏิบัติงานคิวด่วน</p>
          </div>
          <div className="bg-amber-50 text-amber-600 p-3 rounded-xl border border-amber-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Processing */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/85 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">กำลังสปีคงานดำเนินงาน</span>
            <div className="text-3xl font-bold text-blue-600 font-mono">{processing}</div>
            <p className="text-[10px] text-blue-500">มอบหมายเจ้าหน้าที่เฉพาะแล้ว</p>
          </div>
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl border border-blue-100">
            <Users className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* KPI: CSAT */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/85 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">คะแนนความพึงพอใจการบริการ</span>
            <div className="flex items-baseline gap-1 text-slate-800">
              <span className="text-3xl font-extrabold text-emerald-600 font-mono">{averageRating}</span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
            <p className="text-[10px] text-emerald-600">
              ประเมินแล้ว {ratedTickets.length} ธุรกรรม
            </p>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl border border-emerald-100">
            <Star className="w-5 h-5 fill-emerald-500 text-emerald-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Category Statistics Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-7 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800">สัดส่วนคำขอรับบริการจำแนกตามความเชี่ยวชาญ</h3>
            <p className="text-xs text-slate-400">เปรียบเทียบภาระงานสะสมระหว่างฝ่ายสื่อโฆษณา ระบบเซิร์ฟเวอร์ และจัดรูปเล่ม</p>
          </div>

          <div className="space-y-5 py-2">
            {/* Media Row */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-rose-500" />
                  🎬 งานผลิตและตัดต่อดิจิทัลมีเดีย (งานสื่อ)
                </span>
                <span className="font-bold text-slate-800 font-mono">{mediaCount} งาน ({total > 0 ? ((mediaCount / total) * 100).toFixed(0) : 0}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                  style={{ width: `${(mediaCount / maxCategoryCount) * 100}%` }}
                />
              </div>
            </div>

            {/* Network Row */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-sky-500" />
                  🌐 งานเกตเวย์และบริหารระบบไอที (งานระบบ)
                </span>
                <span className="font-bold text-slate-800 font-mono">{sysCount} งาน ({total > 0 ? ((sysCount / total) * 100).toFixed(0) : 0}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sky-500 rounded-full transition-all duration-500" 
                  style={{ width: `${(sysCount / maxCategoryCount) * 100}%` }}
                />
              </div>
            </div>

            {/* Document Row */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                  📄 ตรวจหนังสือวิชาการและพิสูจน์อักษร (งานเอกสาร)
                </span>
                <span className="font-bold text-slate-800 font-mono">{docCount} งาน ({total > 0 ? ((docCount / total) * 100).toFixed(0) : 0}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${(docCount / maxCategoryCount) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 text-xs text-slate-500 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              <strong>สรุปวิเคราะห์ภาระ:</strong> ฝ่ายสื่อสารออนไลน์และตัดต่อวิดีโอยังคงเป็นตัวเลือกบริการที่ได้รับความนิยมสูงสุดในหมู่นักศึกษาและอาจารย์ เพื่อเตรียมใช้ในการจัดทำโครงงานวิชาการแนะนำหลักสูตรใหม่
            </span>
          </div>
        </div>

        {/* Right Side: Staff Directory & Workloads */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">ทำเนียบและปริมาณงานเจ้าหน้าที่ (LDO Team Desk)</h3>
            <p className="text-xs text-slate-400">เช็คสถานะงานที่ค้างในมือของเจ้าหน้าที่แต่ละท่านเพื่อจัดคิวรับเรื่อง</p>
          </div>

          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {staffWorkloads.map(staff => (
              <div key={staff.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <img
                    src={staff.avatar}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    alt={staff.name}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{staff.name}</h4>
                    <p className="text-[10px] text-slate-400">{staff.role}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    staff.workload >= 3 
                      ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                      : staff.workload > 0
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    ค้าง {staff.workload} งาน
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
