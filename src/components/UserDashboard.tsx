/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Ticket, Reporter, JobDetails, TicketStatus } from '../types';
import { LDO_STAFF_LIST, DEPARTMENTS } from '../data/mockTickets';
import { 
  FileText, 
  Send, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Paperclip, 
  Check, 
  Star,
  User,
  Building,
  Phone,
  Mail,
  HelpCircle,
  FilePenLine,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserDashboardProps {
  tickets: Ticket[];
  onAddTicket: (ticket: Ticket) => void;
  onUpdateTicket: (updatedTicket: Ticket) => void;
}

export default function UserDashboard({ tickets, onAddTicket, onUpdateTicket }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<'track' | 'submit'>('track');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    tickets.length > 0 ? tickets[0].ticketId : null
  );

  // Form states - Pre-filled with "สมชาย ดีใจ" (Somchai Deejai) from the prompt ticket ID LDO-2026-0001
  const [reporterName, setReporterName] = useState('สมชาย ดีใจ');
  const [reporterId, setReporterId] = useState('ST12345');
  const [reporterType, setReporterType] = useState<'student' | 'teacher'>('student');
  const [department, setDepartment] = useState('คณะวิศวกรรมศาสตร์');
  const [phone, setPhone] = useState('0812345678');
  const [email, setEmail] = useState('somchai@university.ac.th');

  // Job detail form states
  const [workTitle, setWorkTitle] = useState('');
  const [workCategory, setWorkCategory] = useState<'งานสื่อ' | 'งานระบบ' | 'งานเอกสาร'>('งานสื่อ');
  const [workDescription, setWorkDescription] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentsList, setAttachmentsList] = useState<string[]>([]);
  const [daysToDeadline, setDaysToDeadline] = useState(10); // Default 10 days

  // Satisfaction score states
  const [ratingInput, setRatingInput] = useState<number | null>(null);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Quick profiles for testing demo
  const applyPresetProfile = (type: 'somchai' | 'nalinee' | 'custom') => {
    if (type === 'somchai') {
      setReporterName('สมชาย ดีใจ');
      setReporterId('ST12345');
      setReporterType('student');
      setDepartment('คณะวิศวกรรมศาสตร์');
      setPhone('0812345678');
      setEmail('somchai@university.ac.th');
    } else if (type === 'nalinee') {
      setReporterName('ศ.ดร. นลินี รักเรียน');
      setReporterId('TC99104');
      setReporterType('teacher');
      setDepartment('คณะวิทยาศาสตร์');
      setPhone('0898765432');
      setEmail('nalinee.r@university.ac.th');
    } else {
      setReporterName('');
      setReporterId('');
      setReporterType('student');
      setDepartment(DEPARTMENTS[0]);
      setPhone('');
      setEmail('');
    }
  };

  // Add attachment to list
  const handleAddAttachment = () => {
    if (attachmentUrl.trim()) {
      setAttachmentsList([...attachmentsList, attachmentUrl.trim()]);
      setAttachmentUrl('');
    }
  };

  // Remove attachment from list
  const handleRemoveAttachment = (index: number) => {
    setAttachmentsList(attachmentsList.filter((_, i) => i !== index));
  };

  // Submit new ticket
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();

    if (!workTitle.trim() || !workDescription.trim()) {
      alert('กรุณากรอกหัวข้องานและรายละเอียดความต้องการให้ครบถ้วน');
      return;
    }

    const newTicketId = `LDO-2026-${String(tickets.length + 1).padStart(4, '0')}`;
    const createdAtDate = new Date();
    const deadlineDate = new Date();
    deadlineDate.setDate(createdAtDate.getDate() + daysToDeadline);

    const reporter: Reporter = {
      name: reporterName,
      userId: reporterId,
      type: reporterType,
      department,
      phone,
      email,
    };

    const jobDetails: JobDetails = {
      title: workTitle,
      category: workCategory,
      description: workDescription,
    };

    const newTicket: Ticket = {
      ticketId: newTicketId,
      reporter,
      jobDetails,
      attachments: attachmentsList,
      timeline: {
        createdAt: createdAtDate.toISOString(),
        deadline: deadlineDate.toISOString(),
        completedAt: null,
      },
      status: 'pending',
      assignedTo: null,
      adminNote: '',
      satisfactionScore: null,
    };

    onAddTicket(newTicket);
    setSelectedTicketId(newTicketId);
    
    // Reset work states
    setWorkTitle('');
    setWorkDescription('');
    setAttachmentsList([]);
    setDaysToDeadline(10);
    
    // Switch to tracking tab
    setActiveTab('track');
  };

  // Submit feedback rating
  const handleFeedbackSubmit = (ticketId: string) => {
    const targetTicket = tickets.find(t => t.ticketId === ticketId);
    if (!targetTicket || ratingInput === null) return;

    const updated: Ticket = {
      ...targetTicket,
      satisfactionScore: ratingInput,
      satisfactionComment: ratingComment,
    };

    onUpdateTicket(updated);
    setRatingSubmitted(true);
    setTimeout(() => {
      setRatingSubmitted(false);
      setRatingInput(null);
      setRatingComment('');
    }, 2000);
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            รอยืนยันสิทธิ์ / คิวดำเนินงาน
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <FilePenLine className="w-3.5 h-3.5" />
            กำลังผลิตดำเนินงาน (Processing)
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            เสร็จสำบูรณ์ (Completed)
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            ปฏิเสธภารกิจรับงาน
          </span>
        );
    }
  };

  const selectedTicket = tickets.find(t => t.ticketId === selectedTicketId) || tickets[0];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Portal Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
            <span className="bg-rose-600 text-white px-2.5 py-1 rounded-lg text-lg font-mono">LDO</span>
            พอร์ทัลขอรับบริการสำหรับนักศึกษาและอาจารย์ 
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            ยื่นเรื่องขอให้หน่วยงานออกแบบสื่อออนไลน์ (LDO) สนับสนุนงานผลิตวิดีโอ ระบบไอที หรือแบบฟอร์มเอกสารทางวิชาการ
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-full md:w-auto">
          <button
            id="tab-track-tickets"
            onClick={() => setActiveTab('track')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 ${
              activeTab === 'track'
                ? 'bg-white text-slate-800 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            ติดตามคำข้อและประเมินผล ({tickets.length})
          </button>
          <button
            id="tab-submit-ticket"
            onClick={() => setActiveTab('submit')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 ${
              activeTab === 'submit'
                ? 'bg-white text-rose-600 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            ยื่นส่งคำขอบริการใหม่
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'track' ? (
          <motion.div
            key="track-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Hand: Ticket Quick List */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase mb-2">
                รายการคำร้องขอในระบบของคุณ
              </h3>
              
              {tickets.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                  <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-medium">ไม่พบเจอรายตั๋วคำขอรับบริการ</p>
                  <button
                    onClick={() => setActiveTab('submit')}
                    className="text-xs text-rose-600 font-semibold hover:underline mt-2 cursor-pointer"
                  >
                    คลิกเพื่อขอใช้บริการเป็นคนแรกเลย!
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {tickets.map(ticket => {
                    const isSelected = ticket.ticketId === selectedTicketId;
                    return (
                      <button
                        key={ticket.ticketId}
                        onClick={() => setSelectedTicketId(ticket.ticketId)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-rose-50 to-white border-rose-400/80 shadow-sm ring-1 ring-rose-200'
                            : 'bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {ticket.ticketId}
                          </span>
                          <span className={`text-[10px] font-bold ${
                            ticket.status === 'completed' ? 'text-emerald-600' :
                            ticket.status === 'processing' ? 'text-blue-600' :
                            ticket.status === 'rejected' ? 'text-rose-600' : 'text-amber-600'
                          }`}>
                            {ticket.status === 'completed' && 'สำเร็จเรียบร้อย'}
                            {ticket.status === 'processing' && 'กำลังจัดทำ'}
                            {ticket.status === 'rejected' && 'ปฏิเสธคำขอ'}
                            {ticket.status === 'pending' && 'รอตรวจความถูกต้อง'}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800 line-clamp-1 mb-1">
                          {ticket.jobDetails.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100/60 justify-between text-[11px] text-slate-500">
                          <span className="bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
                            {ticket.jobDetails.category}
                          </span>
                          <span>
                            {new Date(ticket.timeline.createdAt).toLocaleDateString('th-TH', {
                              day: '2-digit',
                              month: 'short',
                              year: '2-digit'
                            })}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Hand: Ticket Detail Timeline */}
            <div className="lg:col-span-8">
              {selectedTicket ? (
                <div className="space-y-6">
                  {/* Detailed Information Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
                    {/* Status Top Accent Bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                      selectedTicket.status === 'completed' ? 'bg-emerald-500' :
                      selectedTicket.status === 'processing' ? 'bg-blue-500' :
                      selectedTicket.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'
                    }`} />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2 mr-2">
                          <span className="text-xs font-semibold font-mono text-slate-400">
                            ID: {selectedTicket.ticketId}
                          </span>
                          <span className="text-xs text-slate-300">•</span>
                          <span className="text-xs font-semibold text-slate-500">
                            ผู้แจ้ง: {selectedTicket.reporter.name}
                          </span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 mt-1">
                          {selectedTicket.jobDetails.title}
                        </h2>
                      </div>
                      <div className="self-start md:self-center">
                        {getStatusBadge(selectedTicket.status)}
                      </div>
                    </div>

                    {/* Basic Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 text-sm">
                      <div className="space-y-4">
                        <h4 className="font-bold text-xs text-slate-400 font-mono tracking-wider uppercase">
                          ข้อมูลนักศึกษา / ผู้ร้องขอ
                        </h4>
                        <div className="space-y-2 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2 text-slate-700 text-xs">
                            <User className="w-4 h-4 text-slate-400 shrink-0" />
                            <strong>คุณ:</strong> {selectedTicket.reporter.name} ({selectedTicket.reporter.userId})
                          </div>
                          <div className="flex items-center gap-2 text-slate-700 text-xs">
                            <Building className="w-4 h-4 text-slate-400 shrink-0" />
                            <strong>สังกัด:</strong> {selectedTicket.reporter.department} ({selectedTicket.reporter.type === 'teacher' ? 'อาจารย์' : 'นักศึกษา'})
                          </div>
                          <div className="flex items-center gap-2 text-slate-700 text-xs">
                            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                            <strong>เบอร์โทร:</strong> {selectedTicket.reporter.phone}
                          </div>
                          <div className="flex items-center gap-2 text-slate-700 text-xs text-wrap break-all">
                            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                            <strong>อีเมล:</strong> {selectedTicket.reporter.email}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-bold text-xs text-slate-400 font-mono tracking-wider uppercase">
                          รายละเอียดงาน LDO
                        </h4>
                        <div className="space-y-3">
                          <div className="text-xs">
                            <span className="text-slate-500">หมวดหมู่ภาระงาน:</span>
                            <span className="ml-2 font-semibold bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-100 inline-block text-[11px]">
                              {selectedTicket.jobDetails.category}
                            </span>
                          </div>

                          <div className="text-xs">
                            <span className="text-slate-500">วันที่ยื่นเรื่อง:</span>
                            <span className="ml-2 font-medium text-slate-800">
                              {new Date(selectedTicket.timeline.createdAt).toLocaleString('th-TH', {
                                day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          </div>

                          <div className="text-xs">
                            <span className="text-slate-500">กำหนดวันส่งมอบ (Deadline):</span>
                            <span className="ml-2 font-semibold text-rose-600">
                              {new Date(selectedTicket.timeline.deadline).toLocaleDateString('th-TH', {
                                day: '2-digit', month: 'long', year: 'numeric'
                              })} (เวลา 17:00 น.)
                            </span>
                          </div>

                          {selectedTicket.timeline.completedAt && (
                            <div className="text-xs">
                              <span className="text-slate-500 text-emerald-600">วันที่ส่งมอบผลงานเสร็จจริง:</span>
                              <span className="ml-2 font-bold text-emerald-600">
                                {new Date(selectedTicket.timeline.completedAt).toLocaleDateString('th-TH', {
                                  day: '2-digit', month: 'long', year: 'numeric'
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Job description section */}
                    <div className="border-t border-slate-100 pt-5 mt-5">
                      <h4 className="font-bold text-xs text-slate-400 font-mono tracking-wider uppercase mb-2">
                        รายละเอียดการบรรยายคำสั่งงานเสริม
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {selectedTicket.jobDetails.description}
                      </p>
                    </div>

                    {/* Attachments Section */}
                    {selectedTicket.attachments.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <h4 className="font-bold text-xs text-slate-400 font-mono tracking-wider uppercase mb-2">
                          ไฟล์แนบอ้างอิงและรูปเล่มงานนำส่ง ({selectedTicket.attachments.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedTicket.attachments.map((url, index) => {
                            const filename = url.substring(url.lastIndexOf('/') + 1) || `ไฟล์อ้างอิง-${index + 1}`;
                            return (
                              <a
                                key={index}
                                href="#view-file-mock"
                                onClick={(e) => { e.preventDefault(); alert(`ดาวน์โหลดไฟล์สมมติ: ${url}`); }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium hover:bg-slate-200 transition-colors"
                              >
                                <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                                <span className="max-w-[180px] truncate">{filename}</span>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Flow Workflow Visual Timeline */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="font-bold text-sm text-slate-800 mb-6 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      ไทม์ไลน์บันทึกขั้นตอนคำขอดำเนินงาน
                    </h3>

                    {/* Custom visually rich stepping line */}
                    <div className="relative pl-8 border-l-2 border-slate-200/80 space-y-8 ml-3">
                      
                      {/* STEP 1: Created */}
                      <div className="relative">
                        {/* Bullet circle badge */}
                        <div className="absolute -left-[41px] top-0 bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                          <Check className="w-3.5 h-3.5 font-bold" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">
                            ยื่นคำขอรับบริการและลงทะเบียนเข้าระบบ
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-1">
                            ข้อมูลผู้แจ้งและคำอธิบายเรื่องถูกจัดเก็บบันทึกเรียบร้อย และหัวหน้าหน่วยงานอนุมัติสิทธิ์คิว
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(selectedTicket.timeline.createdAt).toLocaleString('th-TH')} น.
                          </span>
                        </div>
                      </div>

                      {/* STEP 2: Assigned / Processing */}
                      <div className="relative">
                        {/* Bullet circle badge depending on status */}
                        <div className={`absolute -left-[41px] top-0 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${
                          selectedTicket.status === 'processing' || selectedTicket.status === 'completed'
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-200 text-slate-400'
                        }`}>
                          {selectedTicket.status === 'processing' || selectedTicket.status === 'completed' ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <span className="text-[10px] font-bold font-mono">2</span>
                          )}
                        </div>
                        <div>
                          <h4 className={`text-xs font-bold ${
                            selectedTicket.status === 'processing' || selectedTicket.status === 'completed'
                              ? 'text-slate-800' : 'text-slate-400'
                          }`}>
                            จัดสรรภาระงานและส่งมอบผู้ดูแลรับผิดชอบ
                          </h4>
                          
                          {(selectedTicket.status === 'processing' || selectedTicket.status === 'completed') && selectedTicket.assignedTo ? (
                            <div className="mt-2 flex items-center gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100 max-w-md">
                              {/* Avatar design */}
                              <img
                                src={LDO_STAFF_LIST.find(s => s.name === selectedTicket.assignedTo)?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'}
                                className="w-8 h-8 rounded-full border border-blue-200 object-cover"
                                alt=""
                              />
                              <div>
                                <h5 className="text-[11px] font-extrabold text-blue-900">
                                  {selectedTicket.assignedTo}
                                </h5>
                                <p className="text-[10px] text-blue-700">
                                  {LDO_STAFF_LIST.find(s => s.name === selectedTicket.assignedTo)?.role || 'ฝ่ายสนับสนุนความรู้ออนไลน์และระบบย่อย'}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-400 mt-1">
                              งานกำลังรอการมอบหมายให้กับเจ้าหน้าที่เฉพาะทางสลับเข้าบอร์ดคิว
                            </p>
                          )}
                        </div>
                      </div>

                      {/* STEP 3: Completed or Rejected Outcome */}
                      <div className="relative">
                        {/* Drop down circular step bullet */}
                        <div className={`absolute -left-[41px] top-0 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${
                          selectedTicket.status === 'completed' ? 'bg-emerald-500 text-white' :
                          selectedTicket.status === 'rejected' ? 'bg-rose-500 text-white' :
                          'bg-slate-200 text-slate-400'
                        }`}>
                          {selectedTicket.status === 'completed' ? <Check className="w-3.5 h-3.5" /> :
                           selectedTicket.status === 'rejected' ? <XCircle className="w-3.5 h-3.5" /> :
                           <span className="text-[10px] font-bold font-mono">3</span>}
                        </div>
                        <div>
                          <h4 className={`text-xs font-bold ${
                            selectedTicket.status === 'completed' ? 'text-emerald-700' :
                            selectedTicket.status === 'rejected' ? 'text-rose-700' :
                            'text-slate-400'
                          }`}>
                            ส่งมอบขอบเขตงานบริการสำเร็จเสร็จสิ้น
                          </h4>
                          
                          {selectedTicket.status === 'completed' ? (
                            <div className="space-y-2 mt-1">
                              <p className="text-[11px] text-slate-600">
                                เจ้าหน้าที่ผู้ควบคุมจัดทำรูปเล่มหรือการสร้างสิ่อ ทำการอัปโหลดไฟล์งาน สมบูรณ์เรียบร้อยแล้ว!
                              </p>
                              {selectedTicket.adminNote && (
                                <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 text-xs text-emerald-900 leading-relaxed">
                                  <strong>โน้ตสำหรับนักศึกษา/อาจารย์:</strong><br/>
                                  {selectedTicket.adminNote}
                                </div>
                              )}
                            </div>
                          ) : selectedTicket.status === 'rejected' ? (
                            <div className="space-y-2 mt-1">
                              <p className="text-[11px] text-slate-600">
                                งานจัดทำภาระบริการนี้ล้มเหลว หรือถูกปฏิเสธประเมินผล
                              </p>
                              {selectedTicket.adminNote && (
                                <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-100 text-xs text-rose-900 leading-relaxed">
                                  <strong>เหตุผลชี้แจงจากฝ่ายบริหาร:</strong><br/>
                                  {selectedTicket.adminNote}
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-400 mt-1">
                              รอเจ้าหน้าที่ดำเนินการส่งงาน พร้อมอัปเดตไฟล์ผลลัพธ์
                            </p>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* STEP 4: Rating Feed / Feedback - Only for Completed Tickets */}
                  {selectedTicket.status === 'completed' && (
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100/30 rounded-2xl border-2 border-emerald-400/30 p-6 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <CheckCircle2 className="w-24 h-24 text-emerald-500" />
                      </div>

                      {selectedTicket.satisfactionScore !== null ? (
                        <div>
                          <h4 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
                            <span className="text-emerald-500">⭐</span>
                            ผลการประเมินความพึงพอใจการให้บริการของคุณ
                          </h4>
                          <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-1.5 mb-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < (selectedTicket.satisfactionScore || 0)
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-200'
                                  }`}
                                />
                              ))}
                              <span className="text-slate-500 text-xs ml-2">({selectedTicket.satisfactionScore} จาก 5 คะแนน)</span>
                            </div>
                            {selectedTicket.satisfactionComment && (
                              <p className="text-xs text-slate-600 mt-1 pl-0.5 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg">
                                &ldquo;{selectedTicket.satisfactionComment}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="flex items-center justify-center p-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-sm">⭐</span>
                            <h4 className="font-semibold text-sm text-slate-800">
                              คำร้องเสร็จสมบูรณ์แล้ว! รบกวนช่วยประเมินความพึงพอใจฝ่ายสื่อ LDO
                            </h4>
                          </div>
                          <p className="text-xs text-slate-500 mb-4 pl-0.5">
                            คะแนนความพึงพอใจและคอมเมนต์ของคุณจะถูกนำไปใช้วัด KPIs การปรับปรุงบริการสื่อสารและประสิทธิภาพ LDO Staff
                          </p>

                          {ratingSubmitted ? (
                            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-xs font-semibold animate-pulse">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              ขอบพระคุณเป็นอย่างยิ่งสำหรับผลการประเมินความเห็นระบบครับ! ความเห็นได้รับการจัดเก็บบนคลาวด์แล้ว
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {/* Rating Stars Select */}
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-600 font-medium">คะแนนความพึงพอใจ:</span>
                                <div className="flex gap-1.5">
                                  {[1, 2, 3, 4, 5].map((star) => {
                                    const ratingEmotions = ['😔', '😐', '🙂', '🤩', '💖'];
                                    return (
                                      <button
                                        key={star}
                                        type="button"
                                        title={ratingEmotions[star - 1]}
                                        onClick={() => setRatingInput(star)}
                                        className="p-1 px-2.5 rounded hover:bg-slate-100 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-amber-300 relative group cursor-pointer"
                                      >
                                        <Star
                                          className={`w-6 h-6 transition-all ${
                                            star <= (ratingInput || 0)
                                              ? 'fill-amber-400 text-amber-400 scale-110'
                                              : 'text-slate-300 hover:text-amber-300'
                                          }`}
                                        />
                                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mb-1">
                                          {ratingEmotions[star - 1]}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Comment Feedback Input */}
                              <div>
                                <label className="block text-xs text-slate-600 mb-1 font-medium">คำติชมเพื่อการปรับปรุงการให้บริการ (ระบุเพิ่มเติ่มได้):</label>
                                <textarea
                                  placeholder="เขียนคำติชม หรือระบุความเห็นต่อเจ้าหน้าที่ พี่เอก พี่พิมพ์ พี่บอย ได้ที่นี่..."
                                  rows={2}
                                  value={ratingComment}
                                  onChange={(e) => setRatingComment(e.target.value)}
                                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 outline-none"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleFeedbackSubmit(selectedTicket.ticketId)}
                                disabled={ratingInput === null}
                                className={`w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer ${
                                  ratingInput === null
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-emerald-900/10'
                                }`}
                              >
                                ส่งผลแบบสอบถามประเมินผลความเห็น
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                  <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-medium">กรุณาเลือกตั๋วจากแถบเมนูด้านซ้ายเพื่ออ่านความคืบหน้า</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Major High-Contrast Form Header Block */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border-b-4 border-rose-600">
              <h2 id="submit-form-title" className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span className="bg-rose-600 text-white text-xs px-2.5 py-1 rounded font-mono uppercase tracking-widest font-black">LDO Form v2026</span>
                Submit Job Request (LDO Office)
              </h2>
              <p className="text-xs text-rose-200 mt-1 font-medium">
                กรุณากรอกข้อมูลเพื่อขอรับจดหมายและใบมอบคิวงานสร้างสรรค์ โปรแกรมระบบไอที หรือเอกสารลิขสิทธิ์ความเชี่ยวชาญ ระบบจะบันทึกเข้าสู่ Cloud Firestore ของ LDO ทันที
              </p>
            </div>

            <motion.div
              key="submit-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Profile Config Columns */}
              <div className="bg-white p-6 rounded-2xl border-2 border-slate-900 shadow-sm space-y-6">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1 flex items-center gap-1.5 border-b pb-2 border-slate-200">
                    <User className="w-4 h-4 text-rose-600" />
                    กำหนดโปรไฟล์ผู้ส่งแจ้ง (Reporter Profile)
                  </h3>
                  <p className="text-xs text-slate-600">
                    เลือกพรีเซ็ตตัวอย่างรวดเร็ว หรือคีย์ป้อนแบบฟอร์มด้านล่าง สำหรับข้อมูลผู้แจ้งงาน
                  </p>
                </div>

                {/* Preset buttons */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => applyPresetProfile('somchai')}
                    className="w-full p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-colors text-xs font-bold cursor-pointer border-slate-900 bg-rose-50 text-[#1e1b4b] hover:bg-rose-100"
                  >
                    <div className="bg-rose-600 text-white font-mono w-6 h-6 rounded-full flex items-center justify-center text-[10px]">👨‍🎓</div>
                    <div>
                      <h4 className="font-extrabold text-[#1e1b4b] text-xs">คุณสมชาย ดีใจ (จากตั๋วต้นเรื่อง)</h4>
                      <p className="text-[10px] text-slate-700 font-normal">นักศึกษาคณะวิศวกรรมศาสตร์</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPresetProfile('nalinee')}
                    className="w-full p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-colors text-xs font-bold cursor-pointer border-slate-900 bg-emerald-50 text-[#1e1b4b] hover:bg-emerald-100"
                  >
                    <div className="bg-emerald-600 text-white font-mono w-6 h-6 rounded-full flex items-center justify-center text-[10px]">👩‍🏫</div>
                    <div>
                      <h4 className="font-extrabold text-[#1e1b4b] text-xs">ศ.ดร. นลินี รักเรียน</h4>
                      <p className="text-[10px] text-slate-700 font-normal">อาจารย์ประจำคณะวิทยาศาสตร์</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPresetProfile('custom')}
                    className="w-full p-2.5 rounded-xl border-2 text-center text-xs font-black cursor-pointer border-rose-600 bg-white hover:bg-rose-50 text-rose-700"
                  >
                    เคลียร์ข้อมูลทั้งหมด ป้อนแมนวลรายบุคคลเอง ❌
                  </button>
                </div>

                {/* Profiler Manual Configuration Fields */}
                <div className="space-y-4 pt-4 border-t-2 border-slate-900 text-xs">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">ชื่อ-นามสกุล ผู้ขอรับบริการ:</label>
                    <input
                      type="text"
                      required
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-900 bg-white text-[#1e1b4b] font-bold rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none hover:border-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1">รหัสผู้ส่งแจ้ง:</label>
                      <input
                        type="text"
                        placeholder="เช่น ST12345"
                        required
                        value={reporterId}
                        onChange={(e) => setReporterId(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-slate-900 bg-white text-[#1e1b4b] font-mono font-bold rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1">ประเภทผู้ร้อง:</label>
                      <select
                        value={reporterType}
                        onChange={(e) => setReporterType(e.target.value as 'student' | 'teacher')}
                        className="w-full px-3 py-2 border-2 border-slate-900 bg-white text-[#1e1b4b] font-bold rounded-xl"
                      >
                        <option value="student">👨‍🎓 นักศึกษา</option>
                        <option value="teacher">👩‍🏫 อาจารย์ / บุคลากร</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">คณะ / ส่วนราชการสังกัด:</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-900 bg-white text-[#1e1b4b] font-bold rounded-xl"
                    >
                      {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1">เบอร์ติดต่อ:</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-slate-900 bg-white text-[#1e1b4b] font-bold rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1">อีเมลติดต่อสถาบัน (Google Auth):</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-slate-900 bg-white text-[#1e1b4b] font-bold rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Request Details Form Columns & Attachment */}
              <div className="lg:col-span-2 space-y-6">
                <form onSubmit={handleSubmitTicket} className="bg-white p-6 rounded-2xl border-2 border-slate-900 shadow-sm space-y-5">
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-1.5 pb-2 border-b-2 border-slate-900">
                    <FilePenLine className="w-5 h-5 text-rose-600" />
                    รายละเอียดแบบฟอร์ม (Job Description Details)
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1">หัวข้อจดหมายหรืองานขอรับบริการหลัก (Title):</label>
                      <input
                        type="text"
                        required
                        placeholder="ระบุหัวข้องาน เช่น ตัดต่อวิดีโอปฐมนิเทศ หรือ ขอเชื่อมต่อคิวตั๋ว API"
                        value={workTitle}
                        onChange={(e) => setWorkTitle(e.target.value)}
                        className="w-full text-xs px-3 py-3 border-2 border-slate-900 bg-white text-[#1e1b4b] font-bold rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none hover:border-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-900 mb-1">ประเภททีมงานที่ร้องขอรับบริการ (Category):</label>
                        <select
                          value={workCategory}
                          onChange={(e) => setWorkCategory(e.target.value as 'งานสื่อ' | 'งานระบบ' | 'งานเอกสาร')}
                          className="w-full text-xs px-3 py-2.5 bg-white border-2 border-slate-900 text-[#1e1b4b] font-bold rounded-xl focus:ring-2 focus:ring-rose-500"
                        >
                          <option value="งานสื่อ">🎬 งานสื่อศิลปะ โค้ดสี บอร์ด และวีดิโอตัดต่อ</option>
                          <option value="งานระบบ">💻 งานอัปเดตระบบ ขยายเซิร์ฟเวอร์ และบอร์ดเชื่อมลิงก์</option>
                          <option value="งานเอกสาร">📄 งานแปลภาษา ตรวจเล่ม พิสูจน์อักษร และสารบรรณ</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-900 mb-1">จำนวนวันเผื่อระยะเวลาเดดไลน์ (นับจากวันนี้):</label>
                        <input
                          type="number"
                          min={1}
                          max={60}
                          value={daysToDeadline}
                          onChange={(e) => setDaysToDeadline(Number(e.target.value))}
                          className="w-full text-xs px-3 py-2 border-2 border-slate-900 bg-white text-[#1e1b4b] font-bold rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1">บรรยายสรุปความต้องการอย่างยึดยาว (Description):</label>
                      <textarea
                        rows={6}
                        required
                        placeholder="ระบุรายละเอียดทางทฤษฏี สเปกคอมพิวเตอร์ ฟิกเกอร์ภาพประกอบ หรือข้อมูลแนบประสานงานคิว..."
                        value={workDescription}
                        onChange={(e) => setWorkDescription(e.target.value)}
                        className="w-full text-xs p-3 border-2 border-slate-900 bg-white text-[#1e1b4b] font-semibold rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 hover:border-slate-800 outline-none leading-relaxed"
                      />
                    </div>

                    {/* Highly Accessible Attachment Area */}
                    <div className="border-2 border-slate-900 p-4 rounded-xl bg-[#f8fafc]/80 space-y-3">
                      <span className="block text-xs font-bold text-slate-900 mb-1 flex items-center gap-1">
                        <Paperclip className="w-4 h-4 text-rose-600" />
                        ระบุ URL เอกสารอ้างอิงแนบเพื่อประกอบคิวตั๋ว (Attachments List)
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="วางลิงก์ไฟล์ เช่น https://drive.google.com/your-file.pdf"
                          value={attachmentUrl}
                          onChange={(e) => setAttachmentUrl(e.target.value)}
                          className="flex-1 text-xs px-3 py-2.5 border-2 border-slate-900 bg-white text-[#1e1b4b] font-bold rounded-xl outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddAttachment}
                          className="bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-xl text-center px-4 text-xs transition-colors cursor-pointer border-2 border-slate-900"
                        >
                          ยื่นแนบไฟล์ ➕
                        </button>
                      </div>

                      {/* Displaying Current Attachment List with High Contrast */}
                      {attachmentsList.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {attachmentsList.map((url, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-2 px-3 py-1 bg-white text-[#1e1b4b] border-2 border-slate-900 rounded-lg text-xs font-bold"
                            >
                              <span className="max-w-[200px] truncate">{url}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveAttachment(idx)}
                                className="text-rose-600 hover:text-rose-800 font-extrabold text-sm ml-1 cursor-pointer"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-[10px] text-slate-700 font-medium">
                        *รองรับลิงก์ Cloud Storage, เอกสาร PDF หรือ รูปแบบไฟล์ตัวอย่างงานนำส่งเพื่อใช้ประเมินร่วมกิโล
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-3 border-t-2 border-slate-900">
                    <button
                      type="submit"
                      className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-black text-xs py-3.5 px-10 rounded-xl shadow-lg hover:shadow-rose-900/20 flex items-center justify-center gap-2 cursor-pointer border-b-4 border-rose-800 transition-all active:translate-y-0.5"
                    >
                      <Send className="w-4 h-4 text-white" />
                      ยื่นส่งจดหมายและประสงค์เข้าระบบ LDO-2026-XXXX
                    </button>
                  </div>
                </form>

                {/* HIGH-CONTRAST REPORTER IDENTIFICATION AND VALIDATION DATA TABLE */}
                <div className="bg-white p-6 rounded-2xl border-2 border-slate-900 shadow-sm space-y-4">
                  <h4 className="font-bold text-xs text-slate-900 font-mono tracking-wider uppercase flex items-center gap-1.5 pb-2 border-b border-slate-200">
                    🔍 ตารางตรวจสอบข้อมูลยืนยันตัวตนผู้ส่งเรื่อง (Reporter Verification Parameters)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse border-2 border-slate-900">
                      <thead>
                        <tr className="bg-slate-100 border-b-2 border-slate-900">
                          <th className="p-2.5 border-r border-[#0f172a] text-[#0f172a] font-extrabold uppercase">Parameter Key</th>
                          <th className="p-2.5 text-[#0f172a] font-extrabold uppercase">Live Current Selected Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#0f172a] bg-white">
                        <tr className="border-b border-slate-900">
                          <td className="p-2.5 font-mono border-r border-slate-900 text-[#0f172a] bg-slate-50 font-semibold">username_reporter</td>
                          <td className="p-2.5 text-[#1e1b4b] font-bold">{reporterName || '未入力 (ว่างเปล่า)'}</td>
                        </tr>
                        <tr className="border-b border-slate-900">
                          <td className="p-2.5 font-mono border-r border-slate-900 text-[#0f172a] bg-slate-50 font-semibold">reporter_id</td>
                          <td className="p-2.5 text-[#1e1b4b] font-mono font-bold">{reporterId || '未入力 (ว่างเปล่า)'}</td>
                        </tr>
                        <tr className="border-b border-slate-900">
                          <td className="p-2.5 font-mono border-r border-slate-900 text-[#0f172a] bg-slate-50 font-semibold">reporter_type</td>
                          <td className="p-2.5 text-[#1e1b4b] font-bold">{reporterType === 'student' ? 'Student' : 'Teacher/Staff'}</td>
                        </tr>
                        <tr className="border-b border-slate-900">
                          <td className="p-2.5 font-mono border-r border-slate-900 text-[#0f172a] bg-slate-50 font-semibold">reporter_department</td>
                          <td className="p-2.5 text-[#1e1b4b] font-bold">{department}</td>
                        </tr>
                        <tr className="border-b border-slate-900">
                          <td className="p-2.5 font-mono border-r border-slate-900 text-[#0f172a] bg-slate-50 font-semibold">reporter_phone</td>
                          <td className="p-2.5 text-[#1e1b4b] font-bold">{phone || '未入力 (ว่างเปล่า)'}</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono border-r border-slate-900 text-[#0f172a] bg-slate-50 font-semibold">reporter_email</td>
                          <td className="p-2.5 text-[#1e1b4b] font-mono font-bold text-wrap break-all">{email || '未入力 (ว่างเปล่า)'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* BACKEND CONFIGURATION / CODE BLOCKS FOR LDO CLOUD WORKFLOW */}
                <div className="bg-white p-6 rounded-2xl border-2 border-slate-900 shadow-sm space-y-3">
                  <h4 className="font-bold text-xs text-slate-900 font-mono tracking-wider uppercase flex items-center gap-1.5 pb-2 border-b border-slate-200">
                    💻 คีย์คำขอยื่นส่งเซิร์ฟเวอร์ย่อย (Live API Post Payload Parameter Schema)
                  </h4>
                  <p className="text-[11px] text-slate-700">
                    โค๊ดส่งคำขอของระบบที่ประยุกต์ใช้ในการส่งข้ามไปหา GAS Webhook และ Firestore Schema
                  </p>
                  <pre className="p-4 bg-slate-50 text-xs font-mono border-2 border-slate-900 rounded-xl overflow-x-auto text-[#0f172a] leading-relaxed select-all">
{`{
  "ticketId": "LDO-2026-${String(tickets.length + 1).padStart(4, '0')}",
  "reporter": {
    "name": "${reporterName.replace(/"/g, '\\"')}",
    "userId": "${reporterId.replace(/"/g, '\\"')}",
    "type": "${reporterType}",
    "department": "${department}",
    "phone": "${phone}",
    "email": "${email}"
  },
  "jobDetails": {
    "title": "${workTitle.replace(/"/g, '\\"')}",
    "category": "${workCategory}",
    "description": "${workDescription.replace(/\n/g, '\\n').replace(/"/g, '\\"')}"
  },
  "attachments": ${JSON.stringify(attachmentsList)},
  "status": "pending"
}`}
                  </pre>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
