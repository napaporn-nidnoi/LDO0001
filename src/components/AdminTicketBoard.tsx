/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Ticket, TicketStatus, LDOStaff } from '../types';
import { LDO_STAFF_LIST } from '../data/mockTickets';
import { 
  Search, 
  Filter, 
  UserCheck, 
  ClipboardList, 
  Send, 
  FileText, 
  Check, 
  PenTool, 
  Sparkles, 
  Cpu, 
  Loader2, 
  ChevronRight,
  User,
  Clock,
  Briefcase,
  ExternalLink,
  ThumbsUp,
  MailCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminTicketBoardProps {
  tickets: Ticket[];
  onUpdateTicket: (updatedTicket: Ticket) => void;
}

export default function AdminTicketBoard({ tickets, onUpdateTicket }: AdminTicketBoardProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    tickets.length > 0 ? tickets[0].ticketId : null
  );
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Interactive Edit States
  const [assignedStaff, setAssignedStaff] = useState<string>('');
  const [adminNote, setAdminNote] = useState<string>('');
  
  // Smart AI Panel States
  const [aiActiveTab, setAiActiveTab] = useState<'action_plan' | 'email_draft'>('action_plan');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const selectedTicket = tickets.find(t => t.ticketId === selectedTicketId);

  // Synced internal editor field pre-fills
  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicketId(ticket.ticketId);
    setAssignedStaff(ticket.assignedTo || '');
    setAdminNote(ticket.adminNote || '');
    setAiResult(null);
    setErrorMessage('');
  };

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.reporter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.reporter.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.jobDetails.title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || ticket.jobDetails.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Action: Save ticket re-assignment and admin note updates
  const handleSaveAction = () => {
    if (!selectedTicket) return;

    const isStarting = selectedTicket.status === 'pending' && assignedStaff !== '';

    const updated: Ticket = {
      ...selectedTicket,
      assignedTo: assignedStaff === '' ? null : assignedStaff,
      adminNote: adminNote,
      status: isStarting ? 'processing' : selectedTicket.status,
    };

    onUpdateTicket(updated);
    alert('บันทึกความคืบหน้าของงานลงบอร์ดระเบียบเรียบร้อยแล้ว!');
  };

  // Action: Transition single status
  const handleTransitionStatus = (newStatus: TicketStatus) => {
    if (!selectedTicket) return;

    const now = new Date();
    const updated: Ticket = {
      ...selectedTicket,
      status: newStatus,
      adminNote: adminNote,
      timeline: {
        ...selectedTicket.timeline,
        completedAt: newStatus === 'completed' ? now.toISOString() : selectedTicket.timeline.completedAt,
      }
    };

    // Auto-setup staff if completed/processing to any default if none set
    if (!updated.assignedTo && LDO_STAFF_LIST.length > 0) {
      // Pick first suited staff by theme category
      const suited = LDO_STAFF_LIST.find(s => s.specialty === selectedTicket.jobDetails.category) || LDO_STAFF_LIST[0];
      updated.assignedTo = suited.name;
      setAssignedStaff(suited.name);
    }

    onUpdateTicket(updated);
    alert(`เปลี่ยนสถานะงานของเรื่องเป็น [${
      newStatus === 'completed' ? 'เสร็จสมบูรณ์' :
      newStatus === 'processing' ? 'กำลังดำเนินการ' :
      newStatus === 'rejected' ? 'ปฏิเสธคำร้อง' : 'รอยืนยืน'
    }] เรียบร้อยแล้ว!`);
  };

  // Action: Fire Gemini AI call
  const handleRunAIHelper = async () => {
    if (!selectedTicket) return;

    setAiLoading(true);
    setAiResult(null);
    setErrorMessage('');

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticket: selectedTicket,
          actionType: aiActiveTab,
        }),
      });

      if (!response.ok) {
        throw new Error('เรียกบริการคลาวด์ตัวช่วย AI ไม่สำเร็จ');
      }

      const data = await response.json();
      setAiResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('เกิดปัญหาสื่อสารล้มเหลว กรุณาลองใหม่อีกครั้ง');
    } finally {
      setAiLoading(false);
    }
  };

  // Action: Apply AI drafted content into Note field
  const handleApplyAIToNote = () => {
    if (!aiResult) return;

    let textToAppend = '';
    if (aiActiveTab === 'action_plan' && aiResult.actionPlan) {
      textToAppend = `[แผนงานแนะนำโดยขุมพลัง AI (${aiResult.estimatedHours || 'ขอบเขตปกติ'})]:\n` + 
        aiResult.actionPlan.map((p: any) => `${p.step}. ${p.title} - ${p.description}`).join('\n') + 
        `\n\nทีมงานแนะนำ: ${aiResult.recommendedRole || 'ฝ่ายบริการสื่อ LDO'}`;
    } else if (aiActiveTab === 'email_draft' && aiResult.body) {
      textToAppend = `[ร่างจดหมายประสานงานอีเมล]:\nหัวข้อ: ${aiResult.subject}\n\n${aiResult.body}`;
    }

    setAdminNote(textToAppend);
    alert('ใส่ข้อมูลร่างอัจฉริยะของ AI ลงในช่องหมายเหตุเรียบร้อย!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-slate-100">
      {/* Left Area: Filter Controls & Ticket Queue (4 Cols) */}
      <div className="lg:col-span-4 space-y-4">
        <div className="glass-card p-4 rounded-2xl space-y-3.5 border border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="ค้นหารหัสตั๋ว, ชื่อผู้แจ้ง, เรื่อง..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs glass-input rounded-xl outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-300">
            <div>
              <label className="block mb-1 text-slate-400 uppercase font-bold">กรองตามคณะ/ประเภท</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-2 py-1.5 glass-input rounded-lg bg-slate-950/40 text-xs cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-white">หมวดหมู่ทั้งหมด</option>
                <option value="งานสื่อ" className="bg-slate-900 text-white">งานผลิตสื่อ (🎬)</option>
                <option value="งานระบบ" className="bg-slate-900 text-white">งานระบบย่อย (💻)</option>
                <option value="งานเอกสาร" className="bg-slate-900 text-white">จัดรูปเล่ม (📄)</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-slate-400 uppercase font-bold">สถานะความคืบหน้า</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'all')}
                className="w-full px-2 py-1.5 glass-input rounded-lg bg-slate-950/40 text-xs cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-white">ทุกสถานะ</option>
                <option value="pending" className="bg-slate-900 text-white">รอยืนยันสิทธิ์ / ว่าง</option>
                <option value="processing" className="bg-slate-900 text-white">กำลังดำเนินการ</option>
                <option value="completed" className="bg-slate-900 text-white">เสร็จสิ้นสมบูรณ์</option>
                <option value="rejected" className="bg-slate-900 text-white">ปฏิเสธแล้ว</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ticket List Display */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 px-1 uppercase tracking-wider font-mono">
            <span>ผลตรวจค้นพบคิว ({filteredTickets.length})</span>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="glass-card p-8 rounded-2xl text-center text-slate-400 border border-white/5">
              <ClipboardList className="w-8 h-8 mx-auto mb-2 text-slate-500" />
              <p className="text-xs">ไม่พบคำพาดพิงตามเงื่อนไขที่กำหนด</p>
            </div>
          ) : (
            filteredTickets.map(ticket => {
              const isActive = ticket.ticketId === selectedTicketId;
              return (
                <button
                  key={ticket.ticketId}
                  onClick={() => handleSelectTicket(ticket)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white/10 border-sky-400/80 shadow-md ring-1 ring-sky-500/20 text-white'
                      : 'bg-white/5 border-white/5 hover:border-white/15 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-white/10 text-slate-200 border border-white/5">
                      {ticket.ticketId}
                    </span>
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      ticket.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                      ticket.status === 'processing' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' :
                      ticket.status === 'rejected' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                      'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}>
                      {ticket.status === 'completed' && 'เสร็จสิ้น'}
                      {ticket.status === 'processing' && 'กำลังทำ'}
                      {ticket.status === 'rejected' && 'ปฏิเสธ'}
                      {ticket.status === 'pending' && 'คำใหม่'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white line-clamp-1 mb-1">{ticket.jobDetails.title}</h4>
                  <p className="text-[10px] text-slate-400 block line-clamp-1">โดย: {ticket.reporter.name}</p>
                  
                  {ticket.assignedTo && (
                    <div className="mt-2 pt-2 border-t border-white/5 block text-[9px] text-slate-400 font-semibold font-sans">
                      👤 ผู้บำรุงงาน: {ticket.assignedTo}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Area: Deep Action Configuration and AI Suite (8 Cols) */}
      <div className="lg:col-span-8">
        {selectedTicket ? (
          <div className="space-y-6">
            
            {/* Top General Overview Sheet */}
            <div className="glass-card rounded-2xl border border-white/10 p-6 shadow-md">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold font-mono text-slate-400">ID: {selectedTicket.ticketId}</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs font-semibold bg-rose-500/15 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30 uppercase">{selectedTicket.jobDetails.category}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{selectedTicket.jobDetails.title}</h3>
                </div>
                
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">ส่งคำร้องขอเมื่อ</span>
                  <span className="text-xs font-semibold text-slate-300">
                    {new Date(selectedTicket.timeline.createdAt).toLocaleDateString('th-TH')}
                  </span>
                </div>
              </div>

              {/* Contactor Information Segment */}
              <div className="mt-4 p-4 rounded-xl bg-slate-900/40 border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">ผู้ขอรับบริการ:</span>
                  <span className="font-bold text-slate-100">{selectedTicket.reporter.name}</span>
                  <span className="text-[10px] bg-white/10 px-1 py-0.2 rounded font-mono ml-1 text-slate-300">{selectedTicket.reporter.userId}</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{selectedTicket.reporter.department}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">ช่องทางสถิติการติดต่อ:</span>
                  <span className="font-medium text-slate-355 select-all block">🌐 {selectedTicket.reporter.email}</span>
                  <span className="font-medium text-slate-355 select-all block">📞 {selectedTicket.reporter.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">กำหนดวันส่งมอบ (Deadline):</span>
                  <span className="font-bold text-rose-400 block">
                    {new Date(selectedTicket.timeline.deadline).toLocaleDateString('th-TH', { 
                      day: '2-digit', month: 'long', year: 'numeric' 
                    })}
                  </span>
                  <span className="text-[10px] text-slate-400 block">เวลาส่งกำหนดมาตรฐาน 17:00 น.</span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <span className="font-bold text-slate-300 block">รายละเอียดความประสงค์บริการ:</span>
                <p className="text-slate-300 leading-relaxed bg-slate-900/20 p-4 rounded-xl border border-white/5 whitespace-pre-line select-text">
                  {selectedTicket.jobDetails.description}
                </p>
              </div>

              {selectedTicket.attachments.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold shrink-0">สารบบไฟล์แนบ:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedTicket.attachments.map((url, idx) => (
                      <a
                        key={idx}
                        href="#view"
                        onClick={(e) => { e.preventDefault(); alert(`ชมลิงก์สมมติ: ${url}`); }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[11px] text-slate-200 font-medium transition-all"
                      >
                        📄 {url.substring(url.lastIndexOf('/') + 1) || 'ไฟล์แนบ'}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Smart Gemini LDO AI Companion Panel - HIGHEST VISUAL CRAFT */}
            <div className="bg-slate-950 text-slate-100 rounded-3xl p-6 shadow-xl relative overflow-hidden border border-white/10">
              {/* Abs behind vector light effect */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5 relative">
                <div className="flex items-center gap-2.5">
                  <div className="bg-gradient-to-tr from-rose-500 to-amber-500 p-2 rounded-xl text-white shadow-lg animate-pulse">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-100 tracking-wide flex items-center gap-1.5 font-sans">
                      LDO Smart AI Assistant 
                      <span className="text-[10px] py-0.5 px-2 bg-rose-500/15 border border-rose-500/30 text-rose-400 font-extrabold rounded-full font-mono">Gemini 3.5</span>
                    </h3>
                    <p className="text-[10px] text-slate-400">ระบบคลาวด์วิเคราะห์คำขอเพื่อแนะนำแผนงานย่อยและร่างข้อความสื่อสารประชาสัมพันธ์</p>
                  </div>
                </div>

                {/* Sub-tab AI control toggles */}
                <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5 self-start sm:self-auto text-xs">
                  <button
                    type="button"
                    onClick={() => { setAiActiveTab('action_plan'); setAiResult(null); }}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      aiActiveTab === 'action_plan'
                        ? 'bg-rose-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    💡 ร่างขั้นตอนแผนปฏิบัติ (Action Plan)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAiActiveTab('email_draft'); setAiResult(null); }}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      aiActiveTab === 'email_draft'
                        ? 'bg-rose-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ✉️ ร่างอีเมลแจ้งตอบผู้ร้อง
                  </button>
                </div>
              </div>

              {/* Panel Core Content Space */}
              <div className="my-5 relative min-h-[140px] flex flex-col justify-center">
                {aiLoading ? (
                  <div className="text-center py-8 space-y-3">
                    <Loader2 className="w-8 h-8 mx-auto text-rose-500 animate-spin" />
                    <p className="text-xs text-slate-400 font-medium">กำลังประสานเครือข่ายความรู้ Gemini 3.5 Flash เพื่อประมวลโครงสร้างงาน...</p>
                  </div>
                ) : errorMessage ? (
                  <div className="bg-rose-500/10 border border-rose-500/25 p-4 rounded-xl text-xs text-rose-400 text-center">
                    {errorMessage}
                    <button
                      type="button"
                      onClick={handleRunAIHelper}
                      className="block mx-auto mt-2 text-rose-300 font-bold hover:underline"
                    >
                      คลิกเพื่อทดสอบเชื่อมต่อใหม่อีกครั้ง
                    </button>
                  </div>
                ) : aiResult ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {/* Render Tab 1: Action Plan list items */}
                    {aiActiveTab === 'action_plan' ? (
                      <div className="space-y-3.5">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300 gap-2 font-sans font-semibold">
                          <span>⏱️ ประมาณเวลาพิกัด: <strong className="text-amber-400 font-mono font-bold">{aiResult.estimatedHours || 'ปกติ'}</strong></span>
                          <span>🎓 พนักงานที่เหมาะสม: <strong className="text-sky-400">{aiResult.recommendedRole || '-'}</strong></span>
                          {aiResult.isSimulated && <span className="text-[10px] text-slate-500 font-normal italic">จัดทำโดยชุดจำลองแบบความต้องการ</span>}
                        </div>

                        <div className="grid grid-cols-1 gap-2.5">
                          {aiResult.actionPlan?.map((plan: any) => (
                            <div key={plan.step} className="flex gap-3 bg-slate-900/25 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                              <span className="flex items-center justify-center font-bold font-mono text-xs w-6 h-6 rounded bg-rose-600/20 text-rose-400 border border-rose-500/10 mt-0.5 shrink-0">
                                {plan.step}
                              </span>
                              <div>
                                <h4 className="text-xs font-bold text-slate-100">{plan.title}</h4>
                                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{plan.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Render Tab 2: Email text responses */
                      <div className="space-y-3">
                        <div className="p-3.5 bg-slate-900/60 rounded-xl border border-white/5 text-xs">
                          <div className="font-bold text-slate-300 border-b border-white/5 pb-2 mb-2 font-sans flex items-center gap-1">
                            <CodeBlockIcon className="w-3.5 h-3.5 text-rose-400" />
                            หัวข้อจดหมาย: <span className="text-slate-100 font-semibold">{aiResult.subject}</span>
                          </div>
                          <p className="text-slate-300 leading-relaxed font-sans whitespace-pre-line text-[11px] select-all bg-slate-950/60 p-3 rounded-lg">
                            {aiResult.body}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Footer Application of AI data */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 mt-4 pt-4 border-t border-white/5">
                      <span className="text-[10px] text-slate-500 font-medium">💡 คุณสามารถนำผลลัพธ์คัดลอก ไปบันทึกเก็บเป็นหมายเหตุงานหรือส่งแจ้งได้ทันที</span>
                      <button
                        type="button"
                        onClick={handleApplyAIToNote}
                        className="bg-rose-600 hover:bg-rose-700 text-slate-100 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-[11px] font-bold shadow transition-colors cursor-pointer font-sans"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        นำเข้าเนื้อหาใส่ หมายเหตุระบบเพื่อส่งต่อ 📋
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* Idle status trigger call actions */
                  <div className="text-center py-6 space-y-4">
                    <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                      {aiActiveTab === 'action_plan' 
                        ? 'วิเคราะห์ความต้องการเชิงเทคนิคและวิดีโอของพอร์ทัลเพื่อเสนอโครงสร้างขั้นตอนแผนปฏิบัติงานที่ชัดเจน'
                        : 'ร่างเทมเพลตอีเมลการสื่อสารชี้แจงสถานะงานส่งตอบกับผู้ขออย่างเป็นระบบสุภาพสากล'}
                    </p>
                    <button
                      type="button"
                      onClick={handleRunAIHelper}
                      className="bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-slate-100 font-bold text-xs py-2.5 px-6 rounded-xl shadow-lg cursor-pointer inline-flex items-center gap-2 transition-all font-sans"
                    >
                      <Cpu className="w-4 h-4" />
                      สร้างข้อมูลด้วย Gemini AI อัจฉริยะ 🪄
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* General Administrative Control Form Section */}
            <div className="glass-card rounded-2xl border border-white/10 p-6 shadow-md space-y-5">
              <h4 className="font-bold text-sm text-white pb-2 border-b border-white/5 flex items-center gap-2">
                <PenTool className="w-4.5 h-4.5 text-sky-400" />
                แผงควบคุมระบบบริการและหมายเหตุภาระงาน (Controls)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Staff Assignment */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">เจ้าหน้าที่ผู้รับผิดชอบงานนี้:</label>
                  <select
                    value={assignedStaff}
                    onChange={(e) => setAssignedStaff(e.target.value)}
                    className="w-full text-xs px-3 py-2 glass-input rounded-xl bg-slate-900 text-white cursor-pointer"
                  >
                    <option value="" className="bg-slate-900 text-slate-400">-- ยังไม่มอบหมายภาระงาน / คิวว่าง --</option>
                    {LDO_STAFF_LIST.map(staff => (
                      <option key={staff.id} value={staff.name} className="bg-slate-900 text-white">
                        {staff.name} ({staff.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Direct Action Transitions depending on current ticket state */}
                <div>
                  <span className="block text-xs font-semibold text-slate-300 mb-1.5">เปลี่ยนสถานะความคืบหน้างานโดยตรง:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedTicket.status !== 'processing' && selectedTicket.status !== 'completed' && (
                      <button
                        type="button"
                        onClick={() => handleTransitionStatus('processing')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
                      >
                        ⚙️ เริ่มลุยงาน (Process)
                      </button>
                    )}

                    {selectedTicket.status !== 'completed' && (
                      <button
                        type="button"
                        onClick={() => handleTransitionStatus('completed')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
                      >
                        ✅ ทำเสร็จสิ้น (Complete)
                      </button>
                    )}

                    {selectedTicket.status !== 'rejected' && (
                      <button
                        type="button"
                        onClick={() => handleTransitionStatus('rejected')}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-rose-400 hover:text-rose-350 py-1.5 px-3 rounded-lg text-xs font-bold border border-white/5 transition-colors cursor-pointer"
                      >
                        ❌ ปฏิเสธความรับ (Reject)
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Note Comment Text Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  หมายเหตุของเจ้าหน้าที่ / โน้ตตอบกลับผู้แจ้ง (Admin Note):
                </label>
                <textarea
                  rows={5}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="เขียนหมายเหตุประกอบขั้นตอน แฟ้มงาน บันทึก หรือรายละเอียดลิงก์ส่งงานที่จะโชว์ให้ผู้ใช้เห็นเมื่อเสร็จ..."
                  className="w-full text-xs p-3 glass-input rounded-xl hover:border-white/15 outline-none leading-relaxed"
                />
              </div>

              {/* Action Trigger Save changes */}
              <div className="pt-2 border-t border-white/5 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveAction}
                  className="bg-slate-100 hover:bg-white text-slate-900 py-2.5 px-6 rounded-xl font-bold text-xs shadow-md transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-emerald-600" />
                  บันทึกความคืบหน้านี้ลงระบบ
                </button>
              </div>

            </div>

          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-white/10 p-12 text-center text-slate-400 shadow-md">
            <ClipboardList className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-sm font-medium">กรุณาเลือกตั๋วลำดับความคืบหน้าจากฟอร์มรายงานด้านซ้าย</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple supporting icon representation
function CodeBlockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
    </svg>
  );
}
