import type { Executive, HomeConfig, InfoDocument, Post, SchoolInfo, Staff } from '../types';

const LOGO = 'https://s.imgz.io/2026/04/04/ccddd146d75a508fb2.png';
const BANNER = 'https://lh3.googleusercontent.com/d/1vZ8xK9yJ2mN3pQ4rS5tU6vW7xY8zA9bC0dE1fG2h';

export const SAMPLE_SCHOOL_INFO: SchoolInfo = {
  id: 'sample',
  name: 'โรงเรียนกาฬสินธุ์ปัญญานุกูล จังหวัดกาฬสินธุ์',
  vision: '“ก้าวทันเทคโนโลยี มีทักษะการทำงาน บนพื้นฐานความเป็นไทย ใส่ใจคุณภาพชีวิต”',
  mission: '“พัฒนากาย สังคม จิต ช่วยพิชิตความพิการ”',
  history:
    'โรงเรียนกาฬสินธุ์ปัญญานุกูล จัดการศึกษาสำหรับเด็กและเยาวชนที่มีความต้องการจำเป็นพิเศษ มุ่งพัฒนาศักยภาพผู้เรียนให้พึ่งพาตนเองและอยู่ร่วมในสังคมได้อย่างมีคุณค่า',
  address: 'เลขที่ 169 หมู่ 13 ตำบลดอนสมบูรณ์ อำเภอยางตลาด จังหวัดกาฬสินธุ์ 46120',
  phone: '043-840842',
  email: 'kalasinpanyanukun@ksp.ac.th',
  facebook: 'https://www.facebook.com/ksp.ac.th',
  logoUrl: LOGO,
  motto: 'เรียนดี มีคุณธรรม พึ่งตนเองได้',
  slogan: 'โรงเรียนแห่งความหวังและการเติบโต',
};

export const SAMPLE_HOME_CONFIG: HomeConfig = {
  heroTitle: 'โรงเรียนกาฬสินธุ์ปัญญานุกูล จังหวัดกาฬสินธุ์',
  heroSubtitle: 'มุ่งเน้นการจัดการศึกษาสำหรับเด็กที่มีความต้องการจำเป็นพิเศษ',
  heroImageUrl: BANNER,
  statsTeachers: 45,
  statsEmployees: 28,
  statsStudents: 320,
  bannerSlides: [
    {
      id: 'sample-slide-1',
      imageUrl: BANNER,
      title: 'ยินดีต้อนรับสู่โรงเรียนกาฬสินธุ์ปัญญานุกูล',
      subtitle: 'พัฒนาศักยภาพผู้เรียนทุกคนอย่างเท่าเทียม',
      order: 1,
    },
    {
      id: 'sample-slide-2',
      imageUrl: 'https://picsum.photos/seed/ksp-school/1920/580',
      title: 'เรียนรู้ ค้นความสามารถ สร้างอนาคต',
      subtitle: 'ทักษะชีวิต วิชาการ และอาชีพ',
      order: 2,
    },
  ],
  recommendedPrograms: [
    {
      title: 'ห้องเรียนแบบรวม',
      imageUrl: 'https://picsum.photos/seed/ksp-program1/600/400',
      link: '/about',
    },
    {
      title: 'การฝึกทักษะอาชีพ',
      imageUrl: 'https://picsum.photos/seed/ksp-program2/600/400',
      link: '/portfolio',
    },
    {
      title: 'กิจกรรมพัฒนาผู้เรียน',
      imageUrl: 'https://picsum.photos/seed/ksp-program3/600/400',
      link: '/posts/activity',
    },
  ],
  quickInfoTitle: 'โรงเรียนแห่งการเรียนรู้ตลอดชีวิต',
  quickInfoSubtitle: 'Kalasin Panyanukul School',
  quickInfoDescription:
    'มุ่งเน้นการจัดการศึกษาสำหรับเด็กที่มีความต้องการจำเป็นพิเศษ พัฒนาทักษะชีวิต วิชาการ และอาชีพ',
  quickInfoImageUrl: LOGO,
  quickInfoStatsLabel1: 'นักเรียน',
  quickInfoStatsValue1: '320+',
};

const now = new Date().toISOString();

export const SAMPLE_POSTS: Post[] = [
  {
    id: 'sample-news-1',
    title: 'เปิดปีการศึกษา 2568 อย่างเป็นทางการ',
    content:
      'โรงเรียนกาฬสินธุ์ปัญญานุกูล จัดพิธีเปิดปีการศึกษา 2568 พร้อมกิจกรรมต้อนรับนักเรียนและผู้ปกครอง เน้นการสร้างความอบอุ่นและความมั่นใจในการเรียนรู้',
    category: 'news',
    imageUrl: 'https://picsum.photos/seed/ksp-open2568/800/500',
    createdAt: now,
    author: 'ฝ่ายประชาสัมพันธ์',
    views: 128,
  },
  {
    id: 'sample-news-2',
    title: 'รับสมัครนักเรียนใหม่ ปีการศึกษา 2568',
    content:
      'เปิดรับสมัครนักเรียนที่มีความต้องการจำเป็นพิเศษ สอบถามรายละเอียดได้ที่สำนักงานโรงเรียน หรือโทร 043-840842',
    category: 'news',
    imageUrl: 'https://picsum.photos/seed/ksp-admission/800/500',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    author: 'ฝ่ายวิชาการ',
    views: 95,
  },
  {
    id: 'sample-news-3',
    title: 'โรงเรียนรับรางวัลคุณภาพการศึกษา',
    content:
      'คณะครูและบุคลากรได้รับรางวัลการจัดการศึกษาที่โดดเด่น จากการพัฒนาผู้เรียนอย่างต่อเนื่องและเป็นระบบ',
    category: 'news',
    imageUrl: 'https://picsum.photos/seed/ksp-award/800/500',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    author: 'ผู้บริหาร',
    views: 210,
  },
  {
    id: 'sample-activity-1',
    title: 'กิจกรรมวันเด็กแห่งชาติ',
    content:
      'จัดกิจกรรมสันทนาการ การแสดง และการเรียนรู้ผ่านเกม เพื่อส่งเสริมความสุขและทักษะทางสังคมของนักเรียน',
    category: 'activity',
    imageUrl: 'https://picsum.photos/seed/ksp-children-day/800/500',
    createdAt: now,
    author: 'ฝ่ายกิจการนักเรียน',
    views: 76,
  },
  {
    id: 'sample-activity-2',
    title: 'โครงการปลูกป่าเฉลิมพระเกียรติ',
    content:
      'นักเรียนและครูร่วมกันปลูกต้นไม้ในโรงเรียน ส่งเสริมจิตสำนึกรักษ์สิ่งแวดล้อมและความรับผิดชอบต่อชุมชน',
    category: 'activity',
    imageUrl: 'https://picsum.photos/seed/ksp-tree/800/500',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    author: 'ชุมนุมอนุรักษ์ธรรมชาติ',
    views: 54,
  },
  {
    id: 'sample-publication-1',
    title: 'ผลงานวิชาการ: การพัฒนาทักษะชีวิตผู้เรียน',
    content:
      'รายงานผลการพัฒนาทักษะการดำรงชีวิตประจำวันของนักเรียน ผ่านกิจกรรมฝึกปฏิบัติและการประเมินผลอย่างต่อเนื่อง',
    category: 'publication',
    imageUrl: 'https://picsum.photos/seed/ksp-research/800/500',
    createdAt: now,
    author: 'ฝ่ายวิจัย',
    views: 42,
  },
];

export const SAMPLE_STAFF: Staff[] = [
  {
    id: 'sample-staff-1',
    name: 'นายสมชาย ใจดี',
    position: 'ครูชำนาญการ',
    department: 'ฝ่ายวิชาการ',
    type: 'ข้าราชการ',
    imageUrl: 'https://picsum.photos/seed/ksp-staff1/400/400',
    order: 1,
    phone: '081-234-5678',
    education: 'ปริญญาตรี ครุศาสตร์',
  },
  {
    id: 'sample-staff-2',
    name: 'นางสาวสุดา รักเรียน',
    position: 'ครูผู้ช่วย',
    department: 'ฝ่ายกิจการนักเรียน',
    type: 'ข้าราชการ',
    imageUrl: 'https://picsum.photos/seed/ksp-staff2/400/400',
    order: 2,
    education: 'ปริญญาตรี การศึกษาพิเศษ',
  },
  {
    id: 'sample-staff-3',
    name: 'นายวิชัย มั่นคง',
    position: 'พนักงานราชการ',
    department: 'สำนักงาน',
    type: 'พนักงานราชการ',
    imageUrl: 'https://picsum.photos/seed/ksp-staff3/400/400',
    order: 3,
  },
];

export const SAMPLE_EXECUTIVES: Executive[] = [
  {
    id: 'sample-exec-1',
    name: 'นายอำนวย การศึกษา',
    position: 'ผู้อำนวยการโรงเรียน',
    period: '2566 - ปัจจุบัน',
    imageUrl: 'https://picsum.photos/seed/ksp-director/400/500',
    order: 1,
    bio: 'มุ่งมั่นพัฒนาคุณภาพการศึกษาและสวัสดิภาพของผู้เรียน',
  },
  {
    id: 'sample-exec-2',
    name: 'นางสาวพัฒนา วิชาการ',
    position: 'รองผู้อำนวยการฝ่ายวิชาการ',
    period: '2567 - ปัจจุบัน',
    imageUrl: 'https://picsum.photos/seed/ksp-vice1/400/500',
    order: 2,
  },
];

export const SAMPLE_INFO_DOCUMENTS: InfoDocument[] = [
  {
    id: 'sample-doc-1',
    title: 'แผนพัฒนาการศึกษา 2568',
    category: 'แผนงาน',
    pdfUrl: '#',
    description: 'เอกสารตัวอย่างแผนพัฒนาการศึกษาประจำปี',
    year: '2568',
    createdAt: now,
  },
  {
    id: 'sample-doc-2',
    title: 'คู่มือผู้ปกครอง',
    category: 'คู่มือ',
    pdfUrl: '#',
    description: 'ข้อมูลการดูแลและสนับสนุนผู้เรียน',
    year: '2568',
    createdAt: now,
  },
];

export function isSampleId(id?: string): boolean {
  return Boolean(id?.startsWith('sample-'));
}

export function getSamplePostById(id: string): Post | null {
  return SAMPLE_POSTS.find((p) => p.id === id) || null;
}

export function getSamplePosts(category?: string): Post[] {
  if (!category) return [...SAMPLE_POSTS];
  return SAMPLE_POSTS.filter((p) => p.category === category);
}
