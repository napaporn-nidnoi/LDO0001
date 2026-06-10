/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Users, ShieldAlert, ArrowLeftRight } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: 'user' | 'admin';
  onChangeRole: (role: 'user' | 'admin') => void;
}

export default function RoleSwitcher({ currentRole, onChangeRole }: RoleSwitcherProps) {
  return (
    <div className="glass-header bg-slate-950/25 text-white py-3 px-4 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-3 border-b border-white/5 shadow-md">
      <div className="flex items-center gap-3">
        <div className="bg-rose-500/10 text-rose-400 p-2 rounded-lg border border-rose-500/20">
          <ArrowLeftRight className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-100 font-sans tracking-wide">
            ระบบสาธิตการใช้งานกระบวนการ (Workflow Sandbox)
          </h2>
          <p className="text-xs text-slate-400">
            สลับบทบาทด้านล่างเพื่อสลับจำลองการใช้สองฝั่งงาน (ผู้ใช้บริการ vs เจ้าหน้าที่ LDO)
          </p>
        </div>
      </div>
      
      <div className="flex bg-slate-950/50 p-1 rounded-xl border border-white/5 w-full sm:w-auto">
        <button
          id="role-switch-user"
          onClick={() => onChangeRole('user')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
            currentRole === 'user'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          มุมมองผู้ใช้บริการ (นศ. / อาจารย์)
        </button>
        <button
          id="role-switch-admin"
          onClick={() => onChangeRole('admin')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
            currentRole === 'admin'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-900/40 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          มุมมองเจ้าหน้าที่ (LDO Staff)
        </button>
      </div>
    </div>
  );
}
