import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { getStaffById, updateStaff } from '../services/dataService';
import { Staff, Certificate, Activity, AnnualWorkDrive } from '../types';
import { User, GraduationCap, Award, Calendar, Phone, Mail, ArrowLeft, Edit, Info, ExternalLink, X, Clock, Building2, Image as ImageIcon, Filter, ChevronDown, RefreshCw, Link2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AnnualWorkDrivePanel } from '../components/AnnualWorkDrivePanel';
import { ProfileSectionHeader } from '../components/ProfileSectionHeader';
import {
  pullCertificatesFromKsp,
  findKspPersonnelByIdCard,
  certificatesFingerprint,
  achievementLevelLabel,
} from '../lib/kspManagementSync';

export const StaffProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  
  // Filtering states
  const [activityFilter, setActivityFilter] = useState({
    fiscalYear: '',
    startMonth: '1',
    endMonth: '12'
  });
  const [certFilter, setCertFilter] = useState({
    fiscalYear: '',
    startMonth: '1',
    endMonth: '12'
  });
  const [displayCertificates, setDisplayCertificates] = useState<Certificate[]>([]);
  const [certSyncing, setCertSyncing] = useState(false);
  const [kspLinked, setKspLinked] = useState<boolean | null>(null);
  const certPullDone = useRef(false);

  useEffect(() => {
    const fetchStaff = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getStaffById(id);
        if (data) {
          setStaff(data);
        }
      } catch (error) {
        console.error('Error fetching staff:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [id]);

  useEffect(() => {
    certPullDone.current = false;
    setDisplayCertificates([]);
    setKspLinked(null);
  }, [id]);

  useEffect(() => {
    if (!staff) return;
    setDisplayCertificates(staff.certificates || []);
  }, [staff?.id]);

  useEffect(() => {
    if (!staff?.idCard || certPullDone.current) return;

    let cancelled = false;
    certPullDone.current = true;

    (async () => {
      setCertSyncing(true);
      try {
        const merged = await pullCertificatesFromKsp(staff.certificates, staff.idCard);
        if (cancelled) return;

        setDisplayCertificates(merged);
        const person = await findKspPersonnelByIdCard(staff.idCard);
        setKspLinked(!!person);

        const ownProfile = currentUser && (
          staff.uid === currentUser.id ||
          (staff.email && staff.email === currentUser.email) ||
          (staff.idCard && staff.idCard === currentUser.idCard)
        );

        if (
          ownProfile &&
          staff.id &&
          certificatesFingerprint(staff.certificates) !== certificatesFingerprint(merged)
        ) {
          await updateStaff(staff.id, { certificates: merged });
          setStaff((prev) => (prev ? { ...prev, certificates: merged } : prev));
        }
      } catch (error) {
        console.error('KSP certificate sync failed:', error);
        if (!cancelled) {
          setDisplayCertificates(staff.certificates || []);
          setKspLinked(false);
        }
      } finally {
        if (!cancelled) setCertSyncing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [staff, currentUser]);

  useEffect(() => {
    const linkStaff = async () => {
      if (staff && currentUser && !staff.uid) {
        // Check if this is the current user's profile by email or idCard
        if (staff.email === currentUser.email || staff.idCard === currentUser.idCard) {
          try {
            if (staff && staff.id) {
              await updateStaff(staff.id, { uid: currentUser.id });
              setStaff(prev => prev ? ({ ...prev, uid: currentUser.id }) : null);
            }
          } catch (e) {
            console.error('Error auto-linking staff in profile:', e);
          }
        }
      }
    };

    linkStaff();
  }, [staff, currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-black text-gray-900 mb-4">ไม่พบข้อมูลบุคลากร</h1>
          <p className="text-gray-500 mb-8">ขออภัย ไม่พบข้อมูลบุคลากรที่คุณกำลังค้นหา</p>
          <Link to="/staff" className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            กลับหน้าหลักบุคลากร
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && (
    staff.uid === currentUser.id || 
    (staff.email && staff.email === currentUser.email) || 
    (staff.idCard && staff.idCard === currentUser.idCard)
  );

  const months = [
    { value: '1', label: 'มกราคม' },
    { value: '2', label: 'กุมภาพันธ์' },
    { value: '3', label: 'มีนาคม' },
    { value: '4', label: 'เมษายน' },
    { value: '5', label: 'พฤษภาคม' },
    { value: '6', label: 'มิถุนายน' },
    { value: '7', label: 'กรกฎาคม' },
    { value: '8', label: 'สิงหาคม' },
    { value: '9', label: 'กันยายน' },
    { value: '10', label: 'ตุลาคม' },
    { value: '11', label: 'พฤศจิกายน' },
    { value: '12', label: 'ธันวาคม' },
  ];

  const filterItems = (items: any[], filter: any) => {
    return items?.filter(item => {
      const itemDate = item.date ? new Date(item.date) : null;
      const itemMonth = itemDate ? itemDate.getMonth() + 1 : null;
      const itemYear = item.fiscalYear || '';

      const matchYear = !filter.fiscalYear || String(itemYear) === String(filter.fiscalYear);
      const matchMonth = !itemMonth || (itemMonth >= parseInt(filter.startMonth) && itemMonth <= parseInt(filter.endMonth));

      return matchYear && matchMonth;
    }) || [];
  };

  const filteredActivities = filterItems(staff.activities || [], activityFilter);
  const filteredCertificates = filterItems(displayCertificates, certFilter);

  const groupedActivities = filteredActivities.reduce((acc, activity) => {
    const year = activity.fiscalYear || 'ไม่ระบุปี';
    if (!acc[year]) acc[year] = [];
    acc[year].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>) || {};

  const sortedActivityYears = Object.keys(groupedActivities).sort((a, b) => b.localeCompare(a));

  const groupedCertificates = filteredCertificates.reduce((acc, cert) => {
    const year = cert.fiscalYear || 'ไม่ระบุปี';
    if (!acc[year]) acc[year] = [];
    acc[year].push(cert);
    return acc;
  }, {} as Record<string, Certificate[]>) || {};

  const sortedYears = Object.keys(groupedCertificates).sort((a, b) => b.localeCompare(a));

  const themeColorClass = staff.themeColor?.startsWith('#') ? '' : `bg-${staff.themeColor || 'indigo'}-600`;
  const themeTextClass = staff.themeColor?.startsWith('#') ? '' : `text-${staff.themeColor || 'indigo'}-600`;
  const themeBorderClass = staff.themeColor?.startsWith('#') ? '' : `border-${staff.themeColor || 'indigo'}-600`;
  const themeBgLightClass = staff.themeColor?.startsWith('#') ? '' : `bg-${staff.themeColor || 'indigo'}-50`;

  const getThemeStyle = (type: 'bg' | 'text' | 'border' | 'bgLight') => {
    if (!staff.themeColor?.startsWith('#')) return {};
    const color = staff.themeColor;
    if (type === 'bg') return { backgroundColor: color };
    if (type === 'text') return { color: color };
    if (type === 'border') return { borderColor: color };
    if (type === 'bgLight') return { backgroundColor: `${color}10` };
    return {};
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Helmet>
        <title>{staff.name} | โรงเรียนกาฬสินธุ์ปัญญานุกูล</title>
        <meta name="description" content={`${staff.name} ตำแหน่ง ${staff.position} โรงเรียนกาฬสินธุ์ปัญญานุกูล`} />
        <meta property="og:title" content={staff.name} />
        <meta property="og:description" content={`ตำแหน่ง ${staff.position} โรงเรียนกาฬสินธุ์ปัญญานุกูล`} />
        <meta property="og:image" content={staff.imageUrl || `${window.location.origin}/logo.png`} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="profile" />
        <meta name="twitter:card" content="summary" />
      </Helmet>
      {/* Hero Section */}
      <div 
        className={`relative min-h-[400px] md:h-80 overflow-hidden ${themeColorClass}`}
        style={getThemeStyle('bg')}
      >
        <div 
          className="absolute inset-0 opacity-40 bg-cover bg-center transition-all duration-1000"
          style={{ backgroundImage: `url(${staff.coverUrl || 'https://picsum.photos/seed/school/1920/1080'})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="max-w-5xl mx-auto px-4 h-full flex items-end pb-8 pt-24 relative z-10">
          <Link to="/staff" className="absolute top-6 left-4 text-white/80 hover:text-white flex items-center gap-2 transition-colors bg-black/20 backdrop-blur-md px-4 py-2 rounded-full text-sm z-20">
            <ArrowLeft size={18} /> กลับ
          </Link>
          
          {isOwnProfile && (
            <Link 
              to="/staff/edit" 
              className="absolute top-6 right-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm transition-colors text-sm z-20"
            >
              <Edit size={16} /> แก้ไขข้อมูล
            </Link>
          )}

          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full translate-y-4 md:translate-y-0">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-white overflow-hidden shadow-2xl bg-white flex-shrink-0"
            >
              <img 
                src={staff.imageUrl || 'https://picsum.photos/seed/avatar/400/400'} 
                alt={staff.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <div className="text-center md:text-left text-white pb-2 flex-1">
              <h1 className="text-2xl md:text-4xl font-black mb-1 leading-tight">{staff.name}</h1>
              <p className="text-indigo-200 text-base md:text-lg font-bold">{staff.position}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] md:text-xs font-bold uppercase tracking-wider">{staff.type}</span>
                <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] md:text-xs font-bold uppercase tracking-wider">{staff.department}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <div className="space-y-6">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <ProfileSectionHeader
              icon={<User size={20} className="text-indigo-600" />}
              title="ข้อมูลติดต่อ"
              sectionId="basic"
              editable={!!isOwnProfile}
              canAdd={false}
              className="mb-4"
            />
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-gray-400 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">อีเมล</p>
                  <p className="text-gray-700 break-all">{staff.email || 'ไม่ระบุ'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-gray-400 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">เบอร์โทรศัพท์</p>
                  <p className="text-gray-700">{staff.phone || 'ไม่ระบุ'}</p>
                </div>
              </div>
              {isOwnProfile && currentUser && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">User ID (สำหรับแจ้งแอดมิน)</p>
                  <code className="text-[10px] bg-gray-100 p-1 rounded block break-all text-gray-600">{currentUser.id}</code>
                </div>
              )}
            </div>
          </motion.div>

          {(staff.bio || isOwnProfile) && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            >
              <ProfileSectionHeader
                icon={<Info size={20} className="text-indigo-600" />}
                title="เกี่ยวกับฉัน"
                sectionId="basic"
                editable={!!isOwnProfile}
                canAdd={false}
                className="mb-3"
              />
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {staff.bio || (isOwnProfile ? 'ยังไม่มีข้อมูล — กดแก้ไขเพื่อเพิ่มแนะนำตัว' : '')}
              </p>
            </motion.div>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Education */}
          <motion.section 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
          >
            <ProfileSectionHeader
              icon={<GraduationCap size={24} className="text-indigo-600" />}
              title="ประวัติการศึกษา"
              sectionId="education"
              editable={!!isOwnProfile}
              canAdd={false}
            />
            <div className="text-gray-600 leading-relaxed whitespace-pre-line">
              {staff.education || 'ยังไม่มีข้อมูลประวัติการศึกษา'}
            </div>
          </motion.section>

          {/* Achievements */}
          <motion.section 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
          >
            <ProfileSectionHeader
              icon={<Award size={24} className="text-indigo-600" />}
              title="ผลงานและความภาคภูมิใจ"
              sectionId="achievements"
              editable={!!isOwnProfile}
            />
            {staff.achievements && staff.achievements.length > 0 ? (
              <div className="space-y-8">
                {staff.achievements.map((item, idx) => (
                  <div key={item.id || `achievement-${idx}-${item.title}`} className="border-b border-gray-50 pb-8 last:border-0 last:pb-0">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
                    <p className="text-gray-600 mb-4 whitespace-pre-line">{item.description}</p>
                    {item.images && item.images.length > 0 && (
                      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                        {item.images.map((media, i) => (
                          <motion.div 
                            key={`${media.url}-${i}`}
                            whileHover={{ scale: 1.02 }}
                            className="relative flex-none w-64 aspect-video rounded-xl overflow-hidden shadow-sm border border-gray-100 snap-center bg-gray-100"
                          >
                            {media.type === 'video' ? (
                              <video 
                                src={media.url} 
                                className="w-full h-full object-cover"
                                controls
                              />
                            ) : (
                              <img 
                                src={media.url} 
                                alt={`${item.title} ${i + 1}`}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                                loading="lazy"
                              />
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">ยังไม่มีข้อมูลผลงาน</p>
            )}
          </motion.section>

          {/* Activities */}
          <motion.section 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="space-y-4 mb-8">
              <ProfileSectionHeader
                icon={<Calendar size={24} className={themeTextClass} style={getThemeStyle('text')} />}
                title="กิจกรรมที่เข้าร่วม"
                sectionId="activities"
                editable={!!isOwnProfile}
                className="mb-0"
              />

              {/* Filter Bar */}
              <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 px-2 text-gray-400">
                  <Filter size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">กรองข้อมูล</span>
                </div>
                <select 
                  value={activityFilter.fiscalYear}
                  onChange={(e) => setActivityFilter({ ...activityFilter, fiscalYear: e.target.value })}
                  className="text-xs font-bold bg-white border border-gray-200 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">ทุกปีงบประมาณ</option>
                  {Array.from(new Set((staff.activities || []).map(a => a.fiscalYear).filter(Boolean))).sort().reverse().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <div className="flex items-center gap-1">
                  <select 
                    value={activityFilter.startMonth}
                    onChange={(e) => setActivityFilter({ ...activityFilter, startMonth: e.target.value })}
                    className="text-xs font-bold bg-white border border-gray-200 rounded-xl px-3 py-1.5 outline-none"
                  >
                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                  <span className="text-gray-400 text-xs">ถึง</span>
                  <select 
                    value={activityFilter.endMonth}
                    onChange={(e) => setActivityFilter({ ...activityFilter, endMonth: e.target.value })}
                    className="text-xs font-bold bg-white border border-gray-200 rounded-xl px-3 py-1.5 outline-none"
                  >
                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {sortedActivityYears.length > 0 ? (
              <div className="space-y-12">
                {sortedActivityYears.map(year => (
                  <div key={`activity-year-${year}`} className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div 
                        className={`text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${themeColorClass}`}
                        style={getThemeStyle('bg')}
                      >
                        ปีงบประมาณ {year}
                      </div>
                      <div className="h-px flex-1 bg-gray-100" />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {groupedActivities[year].map((item, idx) => (
                        <motion.div 
                          key={item.id || `activity-${year}-${idx}`}
                          whileHover={{ y: -12, scale: 1.02 }}
                          onClick={() => setSelectedActivity(item)}
                          className="relative group cursor-pointer"
                        >
                          {/* Stacked Effect Backgrounds */}
                          <div className="absolute inset-0 bg-white rounded-[2rem] shadow-md translate-x-2 translate-y-2 rotate-2 group-hover:rotate-3 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-white rounded-[2rem] shadow-sm -translate-x-1 -translate-y-1 -rotate-1 group-hover:-rotate-2 transition-transform duration-500" />
                          
                          <div className="relative bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-xl group-hover:shadow-2xl transition-all duration-500">
                            <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
                              {item.images && item.images.length > 0 ? (
                                <img 
                                  src={item.images[0].url} 
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                  referrerPolicy="no-referrer"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <ImageIcon size={48} />
                                </div>
                              )}
                              
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                              
                              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {item.images?.length || 0} รูปภาพ
                                  </span>
                                  {item.fiscalYear && (
                                    <span className="bg-indigo-500/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                      ปี {item.fiscalYear}
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-black text-xl mb-2 line-clamp-2 leading-tight group-hover:text-indigo-300 transition-colors">{item.title}</h4>
                                {item.date && (
                                  <div className="flex items-center gap-2 text-xs font-bold opacity-70">
                                    <Calendar size={14} />
                                    {new Date(item.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <Calendar size={40} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-400 font-bold">ไม่พบข้อมูลกิจกรรมตามเงื่อนไขที่เลือก</p>
              </div>
            )}
          </motion.section>

          {/* Certificates grouped by year */}
          <motion.section 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden relative"
          >
            <div className="space-y-4 mb-10">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <ProfileSectionHeader
                  icon={<Award size={28} className={themeTextClass} style={getThemeStyle('text')} />}
                  title="เกียรติบัตรและวุฒิบัตร"
                  sectionId="certificates"
                  editable={!!isOwnProfile}
                  className="mb-0 flex-1"
                />
                <Link 
                  to="/portfolio" 
                  className={`text-sm font-bold flex items-center gap-1 px-4 py-2 rounded-full transition-all shrink-0 ${themeTextClass} ${themeBgLightClass}`}
                  style={{ ...getThemeStyle('text'), ...getThemeStyle('bgLight') }}
                >
                  ดูพอร์ตโฟลิโอทั้งหมด <ExternalLink size={14} />
                </Link>
              </div>

              {(certSyncing || kspLinked !== null) && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {certSyncing ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 font-bold">
                      <RefreshCw size={12} className="animate-spin" /> กำลังซิงค์กับ KSP Management...
                    </span>
                  ) : kspLinked ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                      <Link2 size={12} /> เชื่อมกับ KSP Management แล้ว ({displayCertificates.length} รายการ)
                    </span>
                  ) : staff.idCard ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 font-bold">
                      ไม่พบเลขบัตรประชาชนใน KSP Management
                    </span>
                  ) : null}
                </div>
              )}

              {/* Filter Bar */}
              <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 px-2 text-gray-400">
                  <Filter size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">กรองข้อมูล</span>
                </div>
                <select 
                  value={certFilter.fiscalYear}
                  onChange={(e) => setCertFilter({ ...certFilter, fiscalYear: e.target.value })}
                  className="text-xs font-bold bg-white border border-gray-200 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">ทุกปีงบประมาณ</option>
                  {Array.from(new Set(displayCertificates.map(c => c.fiscalYear).filter(Boolean))).sort().reverse().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <div className="flex items-center gap-1">
                  <select 
                    value={certFilter.startMonth}
                    onChange={(e) => setCertFilter({ ...certFilter, startMonth: e.target.value })}
                    className="text-xs font-bold bg-white border border-gray-200 rounded-xl px-3 py-1.5 outline-none"
                  >
                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                  <span className="text-gray-400 text-xs">ถึง</span>
                  <select 
                    value={certFilter.endMonth}
                    onChange={(e) => setCertFilter({ ...certFilter, endMonth: e.target.value })}
                    className="text-xs font-bold bg-white border border-gray-200 rounded-xl px-3 py-1.5 outline-none"
                  >
                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
            
            {sortedYears.length > 0 ? (
              <div className="space-y-12">
                {sortedYears.map(year => (
                  <div key={year} className="relative">
                    <div className="flex items-center gap-4 mb-8">
                      <div 
                        className={`text-white px-5 py-1.5 rounded-full text-xs font-black shadow-lg uppercase tracking-widest ${themeColorClass}`}
                        style={getThemeStyle('bg')}
                      >
                        ปีงบประมาณ {year}
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-r from-gray-100 to-transparent" />
                    </div>
                    
                    <div className="grid grid-cols-3 md:grid-cols-2 gap-2 sm:gap-4 md:gap-8">
                      {groupedCertificates[year].map((cert, idx) => (
                        <motion.div 
                          key={cert.id || `cert-${year}-${idx}-${cert.title}`}
                          whileHover={{ y: -8, scale: 1.02 }}
                          onClick={() => setSelectedCert(cert)}
                          className="bg-white rounded-xl md:rounded-[2rem] overflow-hidden border border-gray-100 cursor-pointer group hover:shadow-2xl transition-all duration-500"
                        >
                          <div className="aspect-[3/4] md:aspect-[4/3] relative overflow-hidden bg-gray-50">
                            {cert.imageUrl ? (
                              <img 
                                src={cert.imageUrl} 
                                alt={cert.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                referrerPolicy="no-referrer"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-200">
                                <ImageIcon className="w-8 h-8 md:w-16 md:h-16" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-end p-6">
                              <span className="text-white font-bold text-sm flex items-center gap-2">
                                คลิกเพื่อขยาย <ExternalLink size={16} />
                              </span>
                            </div>
                            {cert.date && (
                              <div className="absolute top-1 left-1 md:top-4 md:left-4 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-[10px] font-black text-gray-600 shadow-sm">
                                {new Date(cert.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                              </div>
                            )}
                            {cert.level && (
                              <div className="absolute top-1 right-1 md:top-4 md:right-4 bg-indigo-600/90 backdrop-blur-sm px-1.5 py-0.5 md:px-3 md:py-1 rounded-full text-[7px] md:text-[10px] font-black text-white shadow-sm max-w-[70%] truncate">
                                {achievementLevelLabel(cert.level)}
                              </div>
                            )}
                            {cert.assessmentRound && (
                              <div className="absolute bottom-1 right-1 md:bottom-4 md:right-4 bg-orange-500/90 backdrop-blur-sm px-1.5 py-0.5 md:px-3 md:py-1 rounded-full text-[7px] md:text-[10px] font-black text-white shadow-sm">
                                รอบ {cert.assessmentRound}
                              </div>
                            )}
                          </div>
                          <div className="p-2 md:p-6">
                            <h4 className={`font-bold text-gray-900 mb-1 md:mb-3 line-clamp-2 transition-colors leading-tight text-[10px] md:text-lg group-hover:${themeTextClass}`} style={getThemeStyle('text')}>{cert.title}</h4>
                            <div className="hidden md:flex items-center justify-between pt-4 border-t border-gray-50">
                              <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <Building2 size={14} className="text-indigo-400" /> {cert.organizer}
                              </div>
                              {cert.hours > 0 && (
                                <div 
                                  className={`flex items-center gap-1.5 text-[10px] font-black px-2 py-1 rounded-lg ${themeTextClass} ${themeBgLightClass}`}
                                  style={{ ...getThemeStyle('text'), ...getThemeStyle('bgLight') }}
                                >
                                  <Clock size={14} /> {cert.hours} ชม.
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                <Award size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-400 font-bold">ไม่พบข้อมูลเกียรติบัตรตามเงื่อนไขที่เลือก</p>
              </div>
            )}
          </motion.section>

          <AnnualWorkDrivePanel
            value={staff.annualData}
            editable={!!isOwnProfile}
            onSave={async (drive: AnnualWorkDrive) => {
              if (!staff.id) return;
              await updateStaff(staff.id, { annualData: drive });
              setStaff((prev) => (prev ? { ...prev, annualData: drive } : prev));
            }}
          />
        </div>
      </div>

      {/* Activity Fullscreen Viewer */}
      <AnimatePresence>
        {selectedActivity && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-white flex flex-col overflow-hidden"
          >
            {/* Background Decoration */}
            <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
              <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl ${themeColorClass}`} style={getThemeStyle('bg')} />
              <div className={`absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl ${themeColorClass}`} style={getThemeStyle('bg')} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-6 md:p-8 bg-white/80 backdrop-blur-xl border-b border-gray-100 relative z-20">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setSelectedActivity(null)}
                  className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-2xl transition-all active:scale-95"
                >
                  <ArrowLeft size={24} />
                </button>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${themeBgLightClass} ${themeTextClass}`} style={{ ...getThemeStyle('bgLight'), ...getThemeStyle('text') }}>
                      อัลบั้มกิจกรรม
                    </span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      ปีงบประมาณ {selectedActivity.fiscalYear}
                    </span>
                  </div>
                  <h2 className="text-xl md:text-3xl font-black text-gray-900 leading-tight">{selectedActivity.title}</h2>
                </div>
              </div>
              <button 
                onClick={() => setSelectedActivity(null)}
                className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-2xl transition-all active:scale-95"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto relative z-10">
              <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  {/* Left Column: Info */}
                  <div className="lg:col-span-4 space-y-8">
                    <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${themeColorClass}`} style={getThemeStyle('bg')}>
                          <Calendar size={24} />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">วันที่จัดกิจกรรม</p>
                          <p className="text-gray-900 font-bold text-lg">
                            {selectedActivity.date ? new Date(selectedActivity.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : 'ไม่ระบุวันที่'}
                          </p>
                        </div>
                      </div>

                      {selectedActivity.description && (
                        <div className="space-y-3">
                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">รายละเอียดกิจกรรม</p>
                          <p className="text-gray-600 leading-relaxed font-medium whitespace-pre-line">
                            {selectedActivity.description}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100">
                      <h4 className="text-indigo-900 font-black mb-4 flex items-center gap-2">
                        <Info size={20} /> สรุปข้อมูล
                      </h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-indigo-600/70 text-sm font-bold">จำนวนสื่อทั้งหมด</span>
                          <span className="text-indigo-900 font-black">{selectedActivity.images?.length || 0} รายการ</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-indigo-600/70 text-sm font-bold">ปีงบประมาณ</span>
                          <span className="text-indigo-900 font-black">{selectedActivity.fiscalYear}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Gallery */}
                  <div className="lg:col-span-8">
                    <div className="columns-1 sm:columns-2 gap-6 space-y-6">
                      {selectedActivity.images?.map((media, i) => (
                        <motion.div 
                          key={`${media.url}-${i}`}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1, duration: 0.5 }}
                          className="break-inside-avoid rounded-3xl overflow-hidden bg-gray-100 group relative shadow-sm hover:shadow-xl transition-all duration-500"
                        >
                          {media.type === 'video' ? (
                            <video 
                              src={media.url} 
                              className="w-full h-auto block"
                              controls
                            />
                          ) : (
                            <img 
                              src={media.url} 
                              alt="" 
                              className="w-full h-auto block group-hover:scale-105 transition-transform duration-700"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Certificate Modal */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setSelectedCert(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full bg-white rounded-[3rem] overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedCert(null)}
                className="absolute top-6 right-6 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-md transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="bg-gray-100 flex items-center justify-center p-6 lg:p-12">
                  {selectedCert.imageUrl ? (
                    <img 
                      src={selectedCert.imageUrl} 
                      alt={selectedCert.title}
                      className="max-w-full max-h-[70vh] object-contain shadow-2xl rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-gray-300 flex flex-col items-center gap-4">
                      <ImageIcon size={80} />
                      <p className="font-bold">ไม่มีรูปภาพเกียรติบัตร</p>
                    </div>
                  )}
                </div>
                <div className="p-8 lg:p-16 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                      <Award size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">เกียรติบัตร / วุฒิบัตร</p>
                      <p className="text-sm font-bold text-gray-500">ปีงบประมาณ {selectedCert.fiscalYear}</p>
                      {selectedCert.level && (
                        <p className="text-xs font-bold text-indigo-600 mt-1">{achievementLevelLabel(selectedCert.level)}</p>
                      )}
                    </div>
                  </div>

                  <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-8 leading-tight">
                    {selectedCert.title}
                  </h2>
                  
                  <div className="space-y-8 mb-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">หน่วยงานที่จัด</p>
                        <p className="text-gray-900 font-bold text-lg">{selectedCert.organizer}</p>
                      </div>
                    </div>
                    
                    {selectedCert.hours > 0 && (
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                          <Clock size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">จำนวนชั่วโมง</p>
                          <p className="text-gray-900 font-bold text-lg">{selectedCert.hours} ชั่วโมง</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {selectedCert.description && (
                    <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-3">รายละเอียดเพิ่มเติม</p>
                      <p className="text-gray-600 leading-relaxed font-medium">{selectedCert.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
