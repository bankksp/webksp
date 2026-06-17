export interface SchoolInfo {
  id?: string;
  name: string;
  history: string;
  vision: string;
  mission: string;
  address: string;
  phone: string;
  email: string;
  facebook: string;
  youtube?: string;
  mapUrl?: string;
  logoUrl?: string;
  motto?: string;
  philosophy?: string;
  schoolTree?: string;
  identity?: string;
  uniqueness?: string;
  slogan?: string;
  colors?: string;
  logoDescription?: string;
  aboutCoverUrl?: string;
  aboutImageUrl?: string;
  missionImageUrl?: string;
  identityImageUrl?: string;
  historyImageUrl?: string;
  historyYear?: string;
  historyRole?: string;
}

export interface User {
  id?: string;
  uid: string;
  idCard: string;
  email: string;
  password?: string;
  name: string;
  imageUrl: string;
  role: 'admin' | 'user';
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
}

export interface Certificate {
  id: string;
  title: string;
  fiscalYear: string;
  hours: number;
  organizer: string;
  description: string;
  imageUrl: string;
  date?: string; // Added for filtering
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  images: MediaItem[];
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  images: MediaItem[];
  date?: string; // Added for filtering
  fiscalYear?: string; // Added for filtering
}

export interface Staff {
  id?: string;
  name: string;
  position: string;
  department: string;
  type: 'ข้าราชการ' | 'พนักงานราชการ' | 'ลูกจ้าง';
  imageUrl: string;
  order: number;
  phone?: string;
  education?: string;
  achievements?: Achievement[];
  activities?: Activity[];
  bio?: string;
  website?: string;
  annualData?: Record<string, any>;
  certificates?: Certificate[];
  uid?: string;
  idCard?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'staff';
  status?: 'pending' | 'approved' | 'rejected';
  // Customization
  coverUrl?: string;
  themeColor?: string;
}

export interface Executive {
  id?: string;
  name: string;
  position: string;
  period: string; // Years in office (e.g., 2560 - 2565)
  imageUrl: string;
  bio?: string;
  order: number;
}

export interface InfoDocument {
  id?: string;
  title: string;
  category: string;
  pdfUrl: string;
  thumbnailUrl?: string;
  description?: string;
  year?: string;
  createdAt: string;
}

export interface MediaItem {
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string; // Optional thumbnail for videos
}

export interface Post {
  id?: string;
  shortId?: string;
  title: string;
  content: string;
  category: 'news' | 'publication' | 'info' | 'activity';
  imageUrl?: string; // Main featured image
  videoUrl?: string; // Main featured video
  album?: MediaItem[]; // Album of multiple images and videos
  link?: string;
  driveLink?: string;
  newsletterUrl?: string;
  createdAt: string;
  author: string;
  views?: number;
  fontSize?: string;
  lineHeight?: string;
  imagePosition?: string;
}

export interface Statistic {
  label: string;
  value: number;
  icon?: string;
}

export interface RecommendedProgram {
  title: string;
  imageUrl: string;
  link: string;
}

export interface BannerSlide {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  link?: string;
  order: number;
}

export interface YoutubeVideo {
  id: string;
  title: string;
  url: string;
  order: number;
}

export interface HomeConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  heroVideoUrl?: string;
  featuredPostIds?: string[];
  statsTeachers?: number;
  statsEmployees?: number;
  statsStudents?: number;
  recommendedPrograms?: RecommendedProgram[];
  bannerSlides?: BannerSlide[];
  youtubeVideos?: YoutubeVideo[];
  announcementEnabled?: boolean;
  announcementTitle?: string;
  announcementImageUrl?: string;
  announcementLink?: string;
  // Quick Info Section
  quickInfoTitle?: string;
  quickInfoSubtitle?: string;
  quickInfoDescription?: string;
  quickInfoImageUrl?: string;
  quickInfoStatsLabel1?: string;
  quickInfoStatsValue1?: string;
}
