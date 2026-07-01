import { KspAchievement } from '../lib/kspManagementSync';

/** ตัวอย่างข้อมูลจากชีต Achievements ใน KSP Management / SESMS */
export const SAMPLE_KSP_ACHIEVEMENTS: KspAchievement[] = [
  {
    id: 9001,
    personnelId: 1,
    personnelName: 'นายนันทพัทธ์ แสงสุดตา',
    date: '16/01/2569',
    title: 'ผลงานดีเด่นด้านการพัฒนานวัตกรรมการจัดการศึกษา ประจำปี 2569',
    level: 'nation',
    description:
      'เกียรติบัตรขอบคุณในการพัฒนานวัตกรรมการจัดการศึกษา เพื่อการพัฒนาคุณภาพผู้เรียนในโรงเรียนกาฬสินธุ์ปัญญานุกูล',
    attachments: ['/preview-cert-sample.png'],
    fiscalYear: '2569',
    assessmentRound: '1',
    organizer: 'สำนักการศึกษาพิเศษ กระทรวงศึกษาธิการ',
    hours: 0,
  },
  {
    id: 9002,
    personnelId: 1,
    personnelName: 'นายนันทพัทธ์ แสงสุดตา',
    date: '20/11/2568',
    title: 'ผู้บริหารสถานศึกษาดีเด่น ระดับเขตพื้นที่การศึกษา',
    level: 'district',
    description: 'รางวัลเชิดชูเกียรติคุณผู้บริหารสถานศึกษาที่มีผลงานโดดเด่น',
    attachments: [],
    fiscalYear: '2569',
    assessmentRound: '2',
    organizer: 'เขตพื้นที่การศึกษาพิเศษกาฬสินธุ์',
    hours: 6,
  },
  {
    id: 9003,
    personnelId: 1,
    personnelName: 'นายนันทพัทธ์ แสงสุดตา',
    date: '05/06/2568',
    title: 'วิทยากรบรรยายพิเศษ หลักสูตรการจัดการเรียนรู้เชิงรุก',
    level: 'province',
    description: 'เข้าร่วมเป็นวิทยากรในการอบรมครูและบุคลากรทางการศึกษา',
    attachments: [],
    fiscalYear: '2568',
    assessmentRound: '1',
    organizer: 'สำนักงานศึกษาธิการจังหวัดกาฬสินธุ์',
    hours: 12,
  },
];

export const PREVIEW_STAFF = {
  name: 'นายนันทพัทธ์ แสงสุดตา',
  idCard: '1234567890123',
  department: 'ฝ่ายบริหาร',
};
