/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState, useEffect } from 'react';
import { Ticket } from './types';
import { getTickets, saveTickets, resetTickets } from './data/mockTickets';
import RoleSwitcher from './components/RoleSwitcher';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import AdminTicketBoard from './components/AdminTicketBoard';
import WebhookSettings from './components/WebhookSettings';
import { 
  Sparkles, 
  RefreshCcw, 
  ShieldAlert, 
  Users, 
  BarChart4, 
  FileText,
  BadgeAlert,
  Cable
} from 'lucide-react';

export default function App() {
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [adminTab, setAdminTab] = useState<'dashboard' | 'queue' | 'webhook'>('dashboard');

  // Webhook integration states
  const [webhookUrl, setWebhookUrl] = useState<string>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('ldo_webhook_url') || '' : '';
  });
  const [webhookLogs, setWebhookLogs] = useState<any[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('ldo_webhook_logs');
    return stored ? JSON.parse(stored) : [];
  });
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  // Load tickets on mount
  useEffect(() => {
    setTickets(getTickets());
  }, []);

  // Webhook action dispatcher
  const triggerWebhook = async (action: 'new_ticket' | 'update_status', ticket: Ticket) => {
    const activeUrl = localStorage.getItem('ldo_webhook_url') || '';
    if (!activeUrl) return;

    const payload = action === 'new_ticket'
      ? {
          action: 'new_ticket',
          ticketId: ticket.ticketId,
          title: ticket.jobDetails.title,
        }
      : {
          action: 'update_status',
          ticketId: ticket.ticketId,
          reporterEmail: ticket.reporter.email,
          status: ticket.status,
        };

    const newLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      action,
      payload,
      status: 'pending' as const,
    };

    // Append log immediately and save
    setWebhookLogs((prev) => {
      const next = [newLog, ...prev];
      localStorage.setItem('ldo_webhook_logs', JSON.stringify(next));
      return next;
    });

    try {
      const res = await fetch('/api/webhook/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: activeUrl, payload })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.details || errJson.error || 'HTTP Error');
      }

      const resData = await res.json();

      setWebhookLogs((prev) => {
        const next = prev.map(l => l.id === newLog.id ? { ...l, status: 'success' as const, responseText: resData.responseText } : l);
        localStorage.setItem('ldo_webhook_logs', JSON.stringify(next));
        return next;
      });
    } catch (err: any) {
      console.error('Webhook payload send failed:', err);
      setWebhookLogs((prev) => {
        const next = prev.map(l => l.id === newLog.id ? { ...l, status: 'error' as const, errorDetails: err.message } : l);
        localStorage.setItem('ldo_webhook_logs', JSON.stringify(next));
        return next;
      });
    }
  };

  // Action: Add a new ticket
  const handleAddTicket = (newTicket: Ticket) => {
    const updated = [newTicket, ...tickets];
    setTickets(updated);
    saveTickets(updated);
    
    // Trigger Hook
    triggerWebhook('new_ticket', newTicket);
  };

  // Action: Update an existing ticket (Change status, assign staff, rate, edit notes)
  const handleUpdateTicket = (updatedTicket: Ticket) => {
    const prevTicket = tickets.find(t => t.ticketId === updatedTicket.ticketId);
    
    const updated = tickets.map(t => 
      t.ticketId === updatedTicket.ticketId ? updatedTicket : t
    );
    setTickets(updated);
    saveTickets(updated);

    // Trigger Hook if status changed
    if (prevTicket && prevTicket.status !== updatedTicket.status) {
      triggerWebhook('update_status', updatedTicket);
    }
  };

  // Saves Webhook URL to LocalStorage and State
  const handleSaveWebhookUrl = (url: string) => {
    setWebhookUrl(url);
    localStorage.setItem('ldo_webhook_url', url);
  };

  // Clear Webhook trigger logs
  const handleClearWebhookLogs = () => {
    setWebhookLogs([]);
    localStorage.removeItem('ldo_webhook_logs');
  };

  // Custom demo webhook triggering helper for quick-trial settings panel
  const handleTriggerTestWebhook = async (action: 'new_ticket' | 'update_status') => {
    if (!webhookUrl) return;
    setIsTestingWebhook(true);

    // Use a temporary demo ticket for trigger checks
    const demoTicket: Ticket = {
      ticketId: `LDO-${new Date().getFullYear()}-DEMO`,
      reporter: {
        name: 'อาจารย์ นภากร ผู้ทดสอบ',
        userId: 'TC10245',
        type: 'teacher',
        department: 'คณะทันตแพทยศาสตร์',
        phone: '0812345678',
        email: 'napaporn.phub@gmail.com',
      },
      jobDetails: {
        title: 'ทดสอบเชื่อมโยงเครือข่ายสัญญาณ webhook ของคุณ',
        category: 'งานระบบ',
        description: 'นี่คือใบรายงานจำลองความถูกต้องเพื่อตรวจคอร์เนคเตอร์',
      },
      attachments: [],
      timeline: {
        createdAt: new Date().toISOString(),
        deadline: new Date().toISOString(),
        completedAt: null,
      },
      status: action === 'update_status' ? 'completed' : 'pending',
      assignedTo: 'พี่บอย งานระบบ',
      adminNote: 'ตรวจทานเชื่อมฐานข้อมูลเรียบร้อย',
      satisfactionScore: null,
    };

    await triggerWebhook(action, demoTicket);
    setIsTestingWebhook(false);
  };

  // Action: Reset Sandbox
  const handleResetSandbox = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นตามตั๋วโจทย์ต้นเรื่องตัวอย่างหรือไม่?')) {
      resetTickets();
      setTickets(getTickets());
      alert('รีเซ็ตข้อมูลทั้งหมดสำเร็จเรียบร้อย!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-100 font-sans selection:bg-rose-500 selection:text-white antialiased">
      {/* Upper Interactive Sandbox Switcher */}
      <RoleSwitcher currentRole={role} onChangeRole={setRole} />

      {/* Primary Brand Navigation Header */}
      <header className="glass-header sticky top-0 z-45 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-750 rounded-2xl flex items-center justify-center text-white font-extrabold tracking-wider shadow-lg shadow-indigo-650/40 text-md border border-white/15">
              LDO
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white tracking-tight font-sans">
                  LDO Service Portal
                </span>
                <span className="hidden xs:inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/5 text-slate-200 border border-white/10">
                  ระบบบริหารจัดคิว
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">
                Learning Design and Online Media Support • University Administration
              </p>
            </div>
          </div>

          {/* Nav Controls SPECIFIC to LDO Staff Admin view */}
          {role === 'admin' ? (
            <div className="flex bg-slate-950/60 p-1 rounded-xl border border-white/10 w-full sm:w-auto overflow-x-auto shrink-0">
              <button
                id="admin-nav-dashboard"
                onClick={() => setAdminTab('dashboard')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all duration-200 ${
                  adminTab === 'dashboard'
                    ? 'bg-white/10 text-white shadow-sm border border-white/10'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                <BarChart4 className="w-3.5 h-3.5 text-blue-400" />
                รายงานและสถิติสะสม (Dashboard)
              </button>
              <button
                id="admin-nav-queue"
                onClick={() => setAdminTab('queue')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all duration-200 ${
                  adminTab === 'queue'
                    ? 'bg-white/10 text-blue-400 shadow-sm border border-white/10'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                จัดบอร์ดมอบงานคิวคำร้อง (Ticket Queue)
              </button>
              <button
                id="admin-nav-webhook"
                onClick={() => setAdminTab('webhook')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all duration-200 ${
                  adminTab === 'webhook'
                    ? 'bg-white/10 text-rose-400 shadow-sm border border-white/10'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                <Cable className="w-3.5 h-3.5 text-rose-400" />
                ตั้งค่า Webhook (GAS)
              </button>
            </div>
          ) : (
            <div className="text-right hidden md:block">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">University Infolink</span>
              <a 
                href="#helpdoc" 
                onClick={(e) => { e.preventDefault(); alert('สมมติ: เอกสารหลักเกณฑ์ระยะเวลาการให้บริการสื่อ ความเร็วผลิตวิดีโอ 5 วันทำการ'); }}
                className="text-xs text-blue-400 font-semibold hover:text-blue-300 hover:underline"
              >
                ระเบียบเกณฑ์การขอใช้บริการ LDO 📖
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Main Container Core Viewport */}
      <main className="flex-1">
        {role === 'user' ? (
          <UserDashboard 
            tickets={tickets} 
            onAddTicket={handleAddTicket} 
            onUpdateTicket={handleUpdateTicket} 
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
            {/* Admin Hub title banner */}
            <div className="glass-card rounded-3xl p-6 shadow-md border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 bg-blue-500 rounded-full blur-3xl w-48 h-48 pointer-events-none" />
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2 text-white">
                  <ShieldAlert className="w-5.5 h-5.5 text-blue-400" />
                  ฝ่ายปฏิบัติการสำนักงานเทคโนโลยีและสื่อ LDO (Back-Office Hub)
                </h1>
                <p className="text-xs text-slate-300 mt-1">
                  สำหรับบุคลากรทีมงาน LDO ในการประเมิน ตรวจสอบ จัดพับรูปเล่มสิ่งตีพิมพ์ ดำเนินโครงการ และเรียกขุมพลังคู่คิด AI วิเคราะห์งาน
                </p>
              </div>
              <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl px-4 py-2 text-xs font-semibold text-blue-300">
                สิทธิ์ระดับ: ผู้ดูแลระบบ LDO-Staff
              </div>
            </div>

            {/* Dashboard, Queue, or Webhook tabs */}
            {adminTab === 'dashboard' ? (
              <AdminDashboard tickets={tickets} />
            ) : adminTab === 'queue' ? (
              <AdminTicketBoard tickets={tickets} onUpdateTicket={handleUpdateTicket} />
            ) : (
              <WebhookSettings 
                webhookUrl={webhookUrl} 
                onSaveWebhookUrl={handleSaveWebhookUrl} 
                webhookLogs={webhookLogs} 
                onClearLogs={handleClearWebhookLogs} 
                onTriggerTest={handleTriggerTestWebhook} 
                isTesting={isTestingWebhook} 
              />
            )}
          </div>
        )}
      </main>

      {/* Visual Support Footer & Sandbox Reset controls */}
      <footer className="glass-header border-t border-white/10 py-6 mt-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div>
            <p className="font-medium text-slate-300">&copy; 2026 ฝ่ายแนะแนวบริการเทคโนโลยีความรู้และออนไลน์มีเดีย (LDO Web Hub)</p>
            <p className="text-[10px] text-slate-400 mt-0.5">พัฒนาระบบสนับสนุนเต็มรูปแบบด้วยระบบตัดแต่งหน้าเอกสารอัจฉริยะ คณะผลิตงานศิลปะการรับรองสื่อ</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetSandbox}
              title="สลับค่ากลับเริ่มต้นโจทย์"
              className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl text-[11px] font-bold text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white transition-all border border-white/10 cursor-pointer"
            >
              <RefreshCcw className="w-3.5 h-3.5 text-slate-400-thumb" />
              รีเซ็ตฐานข้อมูลดีฟอลต์ (Reset Data)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
