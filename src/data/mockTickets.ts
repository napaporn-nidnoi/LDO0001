/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Ticket, LDOStaff } from '../types';

export const LDO_STAFF_LIST: LDOStaff[] = [
  {
    id: 'staff-1',
    name: 'พี่เอก งานสื่อ',
    role: 'นักออกแบบกราฟิกและสื่อดิจิทัล',
    specialty: 'งานสื่อ',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
  },
  {
    id: 'staff-2',
    name: 'พี่อาร์ต งานวิดีโอ',
    role: 'นักจัดการสื่อบันทึกภาพและภาพเคลื่อนไหว',
    specialty: 'งานสื่อ',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
  },
  {
    id: 'staff-3',
    name: 'พี่บอย งานระบบ',
    role: 'ผู้รักษาเสถียรภาพระบบเครือข่ายและความมั่นคงปลอดภัย',
    specialty: 'งานระบบ',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
  },
  {
    id: 'staff-4',
    name: 'พี่พิมพ์ งานเอกสาร',
    role: 'นักจัดการเอกสารวิชาการและการจัดพับสิ่งตีพิมพ์',
    specialty: 'งานเอกสาร',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
  },
];

export const DEPARTMENTS = [
  'คณะวิศวกรรมศาสตร์',
  'คณะวิทยาศาสตร์',
  'คณะบริหารธุรกิจ',
  'คณะอักษรศาสตร์',
  'คณะทันตแพทยศาสตร์',
  'วิทยาลัยนวัตกรรมดิจิทัล',
  'สำนักงานอธิการบดี',
];

export const SEED_TICKETS: Ticket[] = [
  {
    ticketId: 'LDO-2026-0001',
    reporter: {
      name: 'สมชาย ดีใจ',
      userId: 'ST12345',
      type: 'student',
      department: 'คณะวิศวกรรมศาสตร์',
      phone: '0812345678',
      email: 'somchai@university.ac.th',
    },
    jobDetails: {
      title: 'ขอแรงช่วยตัดต่อวิดีโอแนะนำคณะ',
      category: 'งานสื่อ',
      description: 'ความยาวประมาณ 5 นาที ทางทีมงานมีบทภาพยนตร์และสคริปต์พูดเตรียมไว้ให้แล้ว รวมถึงวิดีโอฟุตเทจดิบบางส่วนระดับ 1080p รบกวนช่วยตัดต่อ ทำรอยเชื่อมต่อ (Transitions) และเติมเพลงประกอบเบาๆ ครับ',
    },
    attachments: [
      'https://storage.googleapis.com/university-ldo-attachments/intro_script_engineering.pdf',
    ],
    timeline: {
      createdAt: '2026-06-10T13:26:00Z',
      deadline: '2026-06-20T17:00:00Z',
      completedAt: null,
    },
    status: 'pending',
    assignedTo: null,
    adminNote: '',
    satisfactionScore: null,
  },
  {
    ticketId: 'LDO-2026-0002',
    reporter: {
      name: 'ศ.ดร. นลินี รักเรียน',
      userId: 'TC99104',
      type: 'teacher',
      department: 'คณะวิทยาศาสตร์',
      phone: '0898765432',
      email: 'nalinee.r@university.ac.th',
    },
    jobDetails: {
      title: 'ลงทะเบียนชื่อโดเมนและเซ็ตอัปเซิร์ฟเวอร์ย่อยสำหรับหน่วยวิจัยเฉพาะทาง',
      category: 'งานระบบ',
      description: 'ต้องการตั้งระบบลงทะเบียนในชื่อย่อย research-bio.sci.university.ac.th พร้อมเปิดพอร์ตรับข้อมูล และทำใบรับรอง SSL เพื่อความปลอดภัยของข้อมูลงานวิจัยพฤษศาสตร์',
    },
    attachments: [
      'https://storage.googleapis.com/university-ldo-attachments/dns_config_docs.pdf',
    ],
    timeline: {
      createdAt: '2026-06-08T09:15:00Z',
      deadline: '2026-06-18T16:30:00Z',
      completedAt: null,
    },
    status: 'processing',
    assignedTo: 'พี่บอย งานระบบ',
    adminNote: 'อนุมัติการตั้งค่าและรับแบบติดตั้งเซิร์ฟเวอร์เสมือนเรียบร้อยแล้ว ได้ส่งอีเมลสอบถามความต้องการแรมรวมถึงชี้ปลายทาง IP เครื่องเป้าหมาย รอความเห็นตอบกลับ',
    satisfactionScore: null,
  },
  {
    ticketId: 'LDO-2026-0003',
    reporter: {
      name: 'คุณทวีศักดิ์ เก่งกาจ',
      userId: 'ST20202',
      type: 'student',
      department: 'คณะบริหารธุรกิจ',
      phone: '0855551212',
      email: 'taweesak.k@university.ac.th',
    },
    jobDetails: {
      title: 'จัดทำแบบหน้าปกแบนเนอร์ประชาสัมพันธ์งานเปิดบ้านวิชาการแนะแนวธุรกิจยุคใหม่',
      category: 'งานสื่อ',
      description: 'ขนาด 1200x630 สำหรับแชร์ลงโซเชียลมีเดีย ต้องการโทนสีส้มและกรมท่า เน้นความทันสมัย ล้ำยุค และกระฉับกระเฉง รบกวนใส่โลโก้คณะและส่งมอบเป็นไฟล์ PNG และ PSD ครับ',
    },
    attachments: [
      'https://storage.googleapis.com/university-ldo-attachments/logo_biz_school.png',
      'https://storage.googleapis.com/university-ldo-attachments/event_text_details.docx',
    ],
    timeline: {
      createdAt: '2026-06-05T08:00:00Z',
      deadline: '2026-06-12T12:00:00Z',
      completedAt: '2026-06-07T14:30:00Z',
    },
    status: 'completed',
    assignedTo: 'พี่เอก งานสื่อ',
    adminNote: 'เรียบร้อยดี ออกแบบให้ 3 แบบให้ผู้ร้องเลือก ได้แบบที่ชอบในรอบแรก ส่งงานฉบับสมบูรณ์เรียบร้อย',
    satisfactionScore: 5,
    satisfactionComment: 'จัดวางตัวอักษรสวย สีดีมากครับ ทำไวเกินคาด ได้รูปแบบสมบูรณ์ทันใจใช้งานแน่นอน',
  },
  {
    ticketId: 'LDO-2026-0004',
    reporter: {
      name: 'รศ. พิชญุตม์ อักษรา',
      userId: 'TC88421',
      type: 'teacher',
      department: 'คณะอักษรศาสตร์',
      phone: '0834561234',
      email: 'pichayut.a@university.ac.th',
    },
    jobDetails: {
      title: 'รบกวนจัดรูปเล่มไฟล์และพิสูจน์อักษรหนังสือคู่มือหลักสูตรปรับปรุงปี 2026',
      category: 'งานเอกสาร',
      description: 'ต้องการจัดทำหนังสือสารบรรณคู่มือแบบเย็บเล่ม ความหนาราว 80 หน้า รบกวนตรวจคำสะกดเครื่องหมายวรรคตอน จัดตำแหน่งย่อหน้าให้เป็นระเบียบตามระเบียบมหาวิทยาลัย',
    },
    attachments: [
      'https://storage.googleapis.com/university-ldo-attachments/curriculum_draft_unformatted.docx',
    ],
    timeline: {
      createdAt: '2026-06-02T11:00:00Z',
      deadline: '2026-06-08T16:00:00Z',
      completedAt: '2026-06-09T16:00:00Z',
    },
    status: 'completed',
    assignedTo: 'พี่พิมพ์ งานเอกสาร',
    adminNote: 'ส่งมอบรอบแรกมีบางส่วนเยื้องตามฟอนต์ที่เปลี่ยน จึงทำการจัดขอบกระดาษใหม่และตรวจทานตัวหนังสือจนเสร็จสิ้น',
    satisfactionScore: 4,
    satisfactionComment: 'การตรวจพิสูจน์อักษรละเอียดมากครับ แทบไม่มีที่ผิดเลย ดีมากสุดๆ เสียอย่างเดียวคือผลงานส่งช้ากว่าเดดไลน์ไป 1 วันแต่เข้าใจและยอมรับเพราะเอกสารหนาจริงครับ',
  },
  {
    ticketId: 'LDO-2026-0005',
    reporter: {
      name: 'นายอดิสรณ์ ออพติก',
      userId: 'ST66554',
      type: 'student',
      department: 'วิทยาลัยนวัตกรรมดิจิทัล',
      phone: '0825556677',
      email: 'adisorn.o@university.ac.th',
    },
    jobDetails: {
      title: 'สัญญาณ Wi-Fi มหาวิทยาลัยหลุดบ่อยมากในบริเวณมุมตึกสภานักศึกษาชั้น 3',
      category: 'งานระบบ',
      description: 'ต้องการให้ฝ่ายไอทีเดินทางมาติดจุดปล่อยสัญญาณ AP เพิ่มเติมหรือแก้ไขมุมสัญญาณ เนื่องจากอินเทอร์เน็ตขาดหายบ่อยขณะศึกษาค้นคว้าคอมพิวเตอร์แบบพกพา',
    },
    attachments: [],
    timeline: {
      createdAt: '2026-06-03T10:30:00Z',
      deadline: '2026-06-13T17:00:00Z',
      completedAt: null,
    },
    status: 'rejected',
    assignedTo: 'พี่บอย งานระบบ',
    adminNote: 'ได้ดำเนินการลงพื้นที่ไปสำรวจและพบว่าเป็นความรับผิดชอบหลักของฝ่ายโครงสร้างพื้นฐานคอมพิวเตอร์กลางสำนักวิทยบริการ (IT Central Helpdesk) มิอยู่ในภารกิจของฝ่ายสื่อและบริการระบบย่อย LDO ของเรา จึงทำการยกเลิกและทำใบลดภาระงานส่งประสานต่อศูนย์ส่งต่อของทางหน่วยงานเจ้าของเรื่องด่วนสุดแล้ว',
    satisfactionScore: null,
  },
];

const LOCAL_STORAGE_KEY = 'ldo_tickets_data';

export function getTickets(): Ticket[] {
  if (typeof window === 'undefined') return SEED_TICKETS;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_TICKETS));
    return SEED_TICKETS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Error parsing stored tickets, reverting to seeds:', e);
    return SEED_TICKETS;
  }
}

export function saveTickets(tickets: Ticket[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tickets));
}

export function resetTickets() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_TICKETS));
}
