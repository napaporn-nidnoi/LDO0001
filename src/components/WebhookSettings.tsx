/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Cable, 
  Copy, 
  Check, 
  Send, 
  History, 
  Trash2, 
  Play, 
  AlertTriangle, 
  Info, 
  ArrowRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Ticket } from '../types';

interface WebhookSettingsProps {
  webhookUrl: string;
  onSaveWebhookUrl: (url: string) => void;
  webhookLogs: any[];
  onClearLogs: () => void;
  onTriggerTest: (action: 'new_ticket' | 'update_status') => Promise<void>;
  isTesting: boolean;
}

const APPS_SCRIPT_CODE = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action; // 'new_ticket' หรือ 'update_status'
    
    if (action === 'new_ticket') {
      // 1. ส่งอีเมลแจ้งเตือนเจ้าหน้าที่ LDO หรือส่ง LINE Notify
      var emailBody = "มีใบแจ้งงานใหม่เข้ามา: " + data.ticketId + "\\nหัวข้อ: " + data.title;
      MailApp.sendEmail("ldo_admin@university.ac.th", "🚨 มีใบแจ้งงานใหม่ [" + data.ticketId + "]", emailBody);
      
    } else if (action === 'update_status') {
      // 2. ส่งอีเมลแจ้งเตือนผู้รับบริการเมื่อสถานะเปลี่ยน หรือ ปิดงาน (Closure Flow)
      var userEmail = data.reporterEmail;
      var statusTh = data.status === 'completed' ? 'เสร็จสิ้น' : 'กำลังดำเนินการ';
      var emailBody = "ใบแจ้งงานเลขที่ " + data.ticketId + " ของคุณได้รับการอัปเดตสถานะเป็น: " + statusTh;
      
      MailApp.sendEmail(userEmail, "🔔 อัปเดตสถานะใบแจ้งงาน " + data.ticketId, emailBody);
    }
    
    return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": error.toString()}))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}`;

export default function WebhookSettings({
  webhookUrl,
  onSaveWebhookUrl,
  webhookLogs,
  onClearLogs,
  onTriggerTest,
  isTesting
}: WebhookSettingsProps) {
  const [urlInput, setUrlInput] = useState(webhookUrl);
  const [copied, setCopied] = useState(false);
  const [testAction, setTestAction] = useState<'new_ticket' | 'update_status'>('new_ticket');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveWebhookUrl(urlInput.trim());
    alert('บันทึกที่อยู่ Webhook สำหรับส่งสัญญาณประสานงาน Apps Script เรียบร้อยแล้ว!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left 7 Columns: Setup Instructions & Settings */}
      <div className="lg:col-span-7 space-y-6">
        {/* Settings Card */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-lg space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/20">
              <Cable className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-sans">เชื่อมต่อ Google Apps Script Webhook</h3>
              <p className="text-xs text-slate-400">กำหนดทิศทางรับส่งข้อมูล API สื่อสารอีเมลปิดยอดเมื่อระบบเกิดความเคลื่อนไหว</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-3.5 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ที่อยู่ Web App URL ของ Google Apps Script (Webhook):
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  required
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 text-xs px-3.5 py-2.5 glass-input rounded-xl border border-white/10 text-white font-mono select-all focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Check className="w-4 h-4" />
                  บันทึก URL
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 flex items-start gap-1">
                <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                เคล็ดลับ: กรุณานำ URL ที่ได้จากการ "Deploy as Web App" ในตัวแก้ไขโค้ด Apps Script ของคุณมาวาง เพื่อเปิดระบบส่งอีเมล MailApp แจ้งรายงานอัตโนมัติ
              </p>
            </div>
          </form>

          {webhookUrl && (
            <div className="pt-4 border-t border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-blue-400">⚡ ทดสอบส่งสัญญาณ Webhook (Instant Trigger Sandbox)</span>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={testAction}
                  onChange={(e) => setTestAction(e.target.value as any)}
                  className="text-xs px-3 py-2.5 glass-input rounded-xl border border-white/10 text-slate-200 outline-none bg-slate-900"
                >
                  <option value="new_ticket">ส่งจำลองแอกชั่นงานใหม่ (new_ticket)</option>
                  <option value="update_status">ส่งจำลองการยืนยันดีเดย์ปิดงาน (update_status)</option>
                </select>
                
                <button
                  type="button"
                  disabled={isTesting}
                  onClick={() => onTriggerTest(testAction)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  {isTesting ? (
                    'กำลังทดสอบติดต่อ...'
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      ลองส่งทริกเกอร์เดโม
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Copy GAS Code Box */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-lg space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-white font-sans flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                คัดลอกโค้ด Google Apps Script ไปติดตั้งใช้งาน
              </h3>
              <p className="text-[10px] text-slate-400">นำสคริปต์นี้ใส่ในโครงการของ Google Apps Script ของคุณเพื่อเริ่มต้นระบบบริการ</p>
            </div>
            
            <button
              onClick={handleCopyCode}
              type="button"
              className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  คัดลอกแล้ว!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  คัดลอกสคริปต์
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <pre className="text-[10px] text-emerald-400 bg-slate-950 p-4 rounded-xl border border-white/5 overflow-x-auto max-h-[350px] font-mono leading-relaxed select-all">
              {APPS_SCRIPT_CODE}
            </pre>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[10px] text-amber-200 leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>คำแนะนำด้านการความปลอดภัยและการดีพลอย:</strong> เมื่อเขียนสคริปต์นี้ใน Google Apps Script อย่าลืมเลือก "Deploy" &gt; "New Deployment" &gt; กำหนดประเภทเป็น "Web App" &gt; ตั้งค่าที่ Execute as "Me" และตั้งค่า Who has access เป็น <strong>"Anyone"</strong> เพื่อเปิดให้พอร์ทัลคลาวด์จัดยิงประสานงานได้ปลอดภัย
            </div>
          </div>
        </div>
      </div>

      {/* Right 5 Columns: Logs and Activity */}
      <div className="lg:col-span-5 space-y-6">
        <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-lg flex flex-col h-[650px]">
          <div className="flex justify-between items-center pb-3 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-300" />
              <h3 className="text-xs font-bold text-white">บันทึกประวัติการยิงทริกเกอร์ ({webhookLogs.length})</h3>
            </div>
            {webhookLogs.length > 0 && (
              <button
                type="button"
                onClick={onClearLogs}
                className="text-[10px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                ล้างประวัติ
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pt-3.5 space-y-3.5 pr-1">
            {webhookLogs.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center text-slate-500 pb-12">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-slate-400">
                  <Cable className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold">ยังไม่พบกิจกรรมประวัติทริกเกอร์</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-xs">เมื่อคุณเพิ่มตั๋วใหม่หรือปรับปรุงสถานะ และมี Webhook URL ติดตั้ง ข้อมูลจรรยาบรรณจะสตรีมมิ่งขึ้นแสดงที่นี่ทันที</p>
              </div>
            ) : (
              webhookLogs.map((log) => (
                <div key={log.id} className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase border ${
                      log.status === 'success' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : log.status === 'error'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/10 animate-pulse'
                    }`}>
                      {log.status === 'success' ? 'SUCCESS' : log.status === 'error' ? 'ERROR' : 'SENDING'}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString('th-TH')}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div className="text-white">
                      💡 แอกชัน: <strong className="font-mono text-blue-400">{log.action}</strong>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-lg text-[10px] font-mono text-emerald-400/90 overflow-x-auto whitespace-pre select-all">
                      {JSON.stringify(log.payload, null, 2)}
                    </div>
                  </div>

                  {log.responseText && (
                    <div className="text-[10px] text-slate-300 bg-slate-900/40 p-2 rounded border border-white/5 mt-1 font-mono">
                      ✉️ ตอบกลับ: <span className="text-emerald-400">{log.responseText}</span>
                    </div>
                  )}

                  {log.errorDetails && (
                    <div className="text-[10px] text-rose-400 bg-rose-500/5 p-2 rounded border border-rose-500/10 mt-1 font-mono">
                      ❌ รายละเอียดผิดพลาด: {log.errorDetails}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
