import { resolveAdminRole, type SessionUser } from '../lib/auth';
import * as bcrypt from 'bcryptjs';
import { Staff, Post, Executive, InfoDocument } from '../types';
import { API_URL } from '../config';
import {
  SAMPLE_SCHOOL_INFO,
  SAMPLE_HOME_CONFIG,
  SAMPLE_STAFF,
  SAMPLE_EXECUTIVES,
  SAMPLE_INFO_DOCUMENTS,
  getSamplePostById,
  getSamplePosts,
  isSampleId,
} from '../data/sampleData';

function withSample<T extends object>(data: T): T & { _isSample: true } {
  return { ...data, _isSample: true as const };
}

// --- Configuration (Proxy via Cloudflare Worker) ---

// --- Auth State Management ---
const AUTH_KEY = 'ksp_panya_user';

export const getCurrentUser = (): SessionUser | null => {
  const user = localStorage.getItem(AUTH_KEY);
  return user ? JSON.parse(user) : null;
};

/** โหลด role ล่าสุดจาก Users + Staff แล้วอัปเดต session */
export const refreshCurrentUser = async (): Promise<SessionUser | null> => {
  const current = getCurrentUser();
  if (!current?.id && !current?.email && !current?.idCard) {
    return null;
  }

  try {
    const users = await getAPI('Users');
    const fresh = users.find((u: any) =>
      (current.id && String(u.id) === String(current.id)) ||
      (current.email && String(u.email).toLowerCase() === String(current.email).toLowerCase()) ||
      (current.idCard && String(u.idCard) === String(current.idCard))
    );

    if (!fresh) {
      setCurrentUser(null);
      return null;
    }

    let staffRole: string | undefined;
    try {
      const staff = await getStaffByUid(fresh.id, fresh.email, fresh.idCard);
      staffRole = staff?.role;
    } catch {
      /* staff record optional */
    }

    const role = resolveAdminRole(fresh.role, staffRole);
    const userData: SessionUser = {
      id: fresh.id,
      email: fresh.email,
      role,
      idCard: fresh.idCard,
      name: fresh.name,
      imageUrl: fresh.imageUrl,
      status: fresh.status,
    };
    const processed = fixImageUrls(userData);
    setCurrentUser(processed);
    return processed;
  } catch (e) {
    console.warn('refreshCurrentUser failed, using cached session:', e);
    return current;
  }
};

const setCurrentUser = (user: any) => {
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
};

// --- Caching System (Client-side) ---
const cache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

const getCache = (key: string) => {
  const item = cache[key];
  if (item && (Date.now() - item.timestamp < CACHE_DURATION)) {
    return item.data;
  }
  return null;
};

const setCache = (key: string, data: any) => {
  cache[key] = { data, timestamp: Date.now() };
};

const clearCache = (sheet?: string) => {
  if (sheet) {
    Object.keys(cache).forEach(key => {
      if (key.startsWith(`${sheet}-`)) {
        delete cache[key];
      }
    });
  } else {
    Object.keys(cache).forEach(key => delete cache[key]);
  }
};

async function fetchAPI(params: any) {
  const maxRetries = 2;
  let lastError: any;

  // Use relative path for API calls to ensure it works across different proxy setups
  const fullApiUrl = API_URL.startsWith('http') ? API_URL : API_URL;

  console.log(`[DataService] fetchAPI: ${params.action} on ${params.sheet} -> ${fullApiUrl}`);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const payload = {
        ...params
      };
      
      const response = await fetch(fullApiUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`fetchAPI Error: Status ${response.status}`, errorText);
        throw new Error(`Server Error (${response.status}): ${errorText.substring(0, 100) || 'No response body'}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        const html = await response.text();
        console.error(`fetchAPI Error: Received HTML instead of JSON:`, html.substring(0, 200));
        throw new Error(`กำลังปรับปรุงเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง`);
      }

      const textData = await response.text();
      let data;
      try {
        data = JSON.parse(textData);
      } catch (e: any) {
        console.error(`fetchAPI JSON Parse Error. Raw response:`, textData.substring(0, 200));
        throw new Error(`รูปแบบข้อมูลไม่ถูกต้องจากเซิร์ฟเวอร์: ${e.message}`);
      }
      
      if (data.error || data.status === 'error') {
        const msg = data.error || data.message || data.hint || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์';
        // Logical errors should not be retried
        const logicalErrors = ['Not found', 'Record not found', 'User already exists', 'Invalid password', 'Unauthorized'];
        if (logicalErrors.some(err => String(msg).includes(err))) {
          throw new Error(String(msg));
        }
        throw new Error(String(msg));
      }

      // Clear cache on write operations
      if (params.action && ['create', 'update', 'delete', 'set'].includes(params.action)) {
        clearCache(params.sheet);
      }

      return data;
    } catch (error: any) {
      lastError = error;
      
      // Don't retry or log logical errors as system failures
      const logicalErrors = ['Not found', 'Record not found', 'User already exists', 'Invalid password', 'Unauthorized'];
      const isLogicalError = logicalErrors.some(err => error.message && error.message.includes(err));
      
      if (isLogicalError) {
        console.warn(`fetchAPI logical error: ${error.message}`);
        break; // Exit retry loop
      }
      
      console.error(`fetchAPI Attempt ${attempt + 1} failed:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
    }
  }

  // Don't show toast or log final error for logical errors that callers should handle
  const logicalErrors = ['Not found', 'Record not found', 'User already exists', 'Invalid password', 'Unauthorized'];
  const isLogicalError = lastError && logicalErrors.some(err => lastError.message && lastError.message.includes(err));

  if (!isLogicalError) {
    console.error('fetchAPI Final Error:', lastError);
    toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ', {
      description: lastError.message === 'Failed to fetch'
        ? 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต หรือลองใหม่อีกครั้ง'
        : lastError.message,
      duration: 10000
    });
  }
  throw lastError;
}

// Helper function to convert Google Drive URLs to optimized thumbnail or viewer links
export const fixDriveUrl = (url: string, isFile = false): string => {
  if (!url || typeof url !== 'string') return url;
  
  // Regex to extract Google Drive File ID from various URL formats
  const driveRegex = /(?:drive\.google\.com\/(?:uc\?.*id=|file\/d\/|open\?.*id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);
  
  if (match && match[1]) {
    const fileId = match[1];
    
    if (isFile) {
      // For files, use the viewer link
      return `https://drive.google.com/file/d/${fileId}/view`;
    } else {
      // For previews (images or PDF thumbnails), use the lh3 endpoint which is more reliable
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }
  
  return url;
};

/** Resolve newsletter share image URL from post (column, album JSON, or legacy fields). */
export const getNewsletterUrl = (post: Post | null | undefined): string | undefined => {
  if (!post) return undefined;

  const parseAlbumItems = (album: unknown): Array<{ type?: string; url?: string }> => {
    if (!album) return [];
    let parsed: unknown = album;
    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed);
        if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      } catch {
        return [];
      }
    }
    return Array.isArray(parsed) ? parsed : [];
  };

  const direct =
    post.newsletterUrl ||
    (post as { NewsletterUrl?: string }).NewsletterUrl ||
    (post as { newsletter_url?: string }).newsletter_url;
  if (direct) return fixDriveUrl(direct);

  const fromAlbum = parseAlbumItems(post.album).find(
    (i) => i?.type?.toLowerCase() === 'newsletter' && i?.url,
  );
  if (fromAlbum?.url) return fixDriveUrl(fromAlbum.url);

  return undefined;
};

export const invalidatePostsCache = () => clearCache('Posts');

// Helper function to fix Google Drive image URLs and optimize for performance
const fixImageUrls = (data: any): any => {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map(item => fixImageUrls(item));
  }
  if (typeof data === 'object' && data !== null) {
    const newData = { ...data };
    for (const key in newData) {
      const value = newData[key];
      
      // List of keys that should be treated as URLs/Files for optimization
      const urlKeys = [
        'imageUrl', 'thumbnailUrl', 'coverUrl', 'url', 'pdfUrl', 'newsletterUrl',
        'link', 'driveLink', 'heroImageUrl', 'announcementImageUrl', 
        'quickInfoImageUrl', 'logoUrl', 'schoolTree', 'website',
        'aboutCoverUrl', 'aboutImageUrl', 'missionImageUrl', 
        'identityImageUrl', 'historyImageUrl'
      ];
      
      const isUrlKey = urlKeys.some(uk => key.toLowerCase().includes(uk.toLowerCase()));
      
      if (typeof value === 'string' && isUrlKey) {
        const isFileKey = key.toLowerCase().includes('pdf') || 
                          key.toLowerCase().includes('file') || 
                          value.toLowerCase().includes('.pdf');
        newData[key] = fixDriveUrl(value, isFileKey);
      } else if (typeof value === 'object' && value !== null) {
        newData[key] = fixImageUrls(value);
      }
    }
    return newData;
  }
  return data;
};

async function getAPI(sheet: string, id?: string, category?: string, matchColumns?: string[]) {
  const cacheKey = `${sheet}-${id || ''}-${category || ''}-${matchColumns ? matchColumns.join(',') : ''}`;
  const cachedData = getCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const data = await fetchAPI({
      action: 'read',
      sheet,
      id,
      category,
      matchColumns
    });
    
    if (data && !data.error) {
      setCache(cacheKey, data);
    }
    
    return data;
  } catch (error: any) {
    if (error.message !== 'Not found' && error.message !== 'Record not found') {
      console.error(`getAPI failed for ${sheet}:`, error);
    }
    // Return empty array or null depending on context if it fails
    return id ? null : [];
  }
}

// --- Authentication ---
export const login = async (credentials: { email?: string, idCard?: string, password?: string }) => {
  const { email, idCard, password } = credentials;
  try {
    const users = await getAPI('Users');
    console.log(`Login attempt: ${email || idCard}. Found ${users?.length || 0} users.`);
    
    const user = users.find((u: any) => {
      const uEmail = u.email ? String(u.email).toLowerCase().trim() : '';
      const uIdCard = u.idCard ? String(u.idCard).trim() : '';
      
      const targetEmail = email ? String(email).toLowerCase().trim() : '';
      const targetIdCard = idCard ? String(idCard).trim() : '';

      return (targetEmail && uEmail === targetEmail) || (targetIdCard && uIdCard === targetIdCard);
    });

    if (!user) {
      console.warn(`User not found: ${email || idCard}`);
      throw new Error("ไม่พบผู้ใช้งานในระบบ กรุณาตรวจสอบเลขบัตรประชาชนหรืออีเมล");
    }

    console.log(`User found: ${user.email || user.idCard}. Validating password...`);
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(String(password), String(user.password));
    } catch (e) {
      isPasswordValid = String(password) === String(user.password);
    }

    if (!isPasswordValid) {
      isPasswordValid = String(password) === String(user.password);
    }

    if (!isPasswordValid) {
      throw new Error("รหัสผ่านไม่ถูกต้อง");
    }

    if (user.status === 'pending') {
      throw new Error("บัญชีของคุณอยู่ระหว่างรอการอนุมัติจากผู้ดูแลระบบ");
    }
    
    if (user.status === 'rejected') {
      throw new Error("บัญชีของคุณถูกระงับหรือปฏิเสธการเข้าใช้งาน");
    }

    let staffRole: string | undefined;
    try {
      const staff = await getStaffByUid(user.id, user.email, user.idCard);
      staffRole = staff?.role;
    } catch {
      /* optional */
    }

    const role = resolveAdminRole(user.role, staffRole);
    const userData = {
      id: user.id,
      email: user.email,
      role,
      idCard: user.idCard,
      name: user.name,
      imageUrl: user.imageUrl,
      status: user.status,
    };
    const processedUser = fixImageUrls(userData);
    setCurrentUser(processedUser);
    return { success: true, user: processedUser };
  } catch (error: any) {
    toast.error('เข้าสู่ระบบไม่สำเร็จ', { description: error.message });
    throw error;
  }
};

export const register = async (data: any) => {
  const { email, password, name, idCard, imageUrl } = data;
  try {
    const users = await getAPI('Users');
    const existingUser = users.find((u: any) => u.email === email || u.idCard === idCard);
    
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isDefaultAdmin = email.toLowerCase() === 'nanthaphat@ksp.ac.th';
    const status = isDefaultAdmin ? 'approved' : 'pending';
    const userData = {
      email,
      password: hashedPassword,
      name,
      idCard,
      imageUrl,
      role: isDefaultAdmin ? 'admin' : 'staff',
      status: status,
      createdAt: new Date().toISOString()
    };

    const result = await fetchAPI({ action: 'create', sheet: 'Users', data: userData });
    
    // Also create in Staff sheet for profile
    await fetchAPI({ action: 'create', sheet: 'Staff', data: { ...userData, uid: result.id } });

    if (status === 'approved') {
      const sessionUser = { id: result.id, email, role: userData.role, idCard, name };
      setCurrentUser(sessionUser);
      return { success: true, user: sessionUser };
    } else {
      return { success: true, user: null, pending: true };
    }
  } catch (error: any) {
    toast.error('ลงทะเบียนไม่สำเร็จ', { description: error.message });
    throw error;
  }
};

export const logout = () => {
  setCurrentUser(null);
  window.location.href = '/login';
};

export const forgotPassword = async (idCard: string) => {
  try {
    const users = await getAPI('Users');
    const user = users.find((u: any) => u.idCard === idCard);

    if (!user) {
      throw new Error("ไม่พบผู้ใช้งานที่มีเลขบัตรประชาชนนี้");
    }

    const hashedPassword = await bcrypt.hash(idCard, 10);
    await fetchAPI({ 
      action: 'update', 
      sheet: 'Users', 
      id: user.id, 
      data: { password: hashedPassword },
      matchColumns: ['id', 'uid']
    });

    toast.success("รีเซ็ตรหัสผ่านเป็นเลขบัตรประชาชนสำเร็จ");
    return { success: true };
  } catch (error: any) {
    toast.error('รีเซ็ตรหัสผ่านไม่สำเร็จ', { description: error.message });
    throw error;
  }
};

// --- File Upload & Base64 Helper ---
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
  });
};

const compressImage = async (file: File, maxSizeMB: number = 0.8): Promise<File> => {
  if (!file.type.startsWith('image/')) return file;
  if (file.size < maxSizeMB * 1024 * 1024) return file; 
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const MAX_DIM = 1200;
        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' }));
          } else {
            resolve(file); 
          }
        }, 'image/jpeg', 0.6); 
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

export interface UploadFileOptions {
  /** null = ไม่จำกัดขนาดฝั่ง client */
  maxSizeMB?: number | null;
  compressImages?: boolean;
}

export const uploadFile = async (file: File, options: UploadFileOptions = {}): Promise<string> => {
  const { maxSizeMB = 20, compressImages = true } = options;
  const toastId = toast.loading(`กำลังอัปโหลด ${file.name}...`);

  try {
    const processedFile = compressImages ? await compressImage(file, 0.8) : file;
    const base64Data = await fileToBase64(processedFile);

    if (maxSizeMB != null) {
      const isPdf = processedFile.type === 'application/pdf' || processedFile.name.toLowerCase().endsWith('.pdf');
      const sizeInMB = processedFile.size / (1024 * 1024);
      if (!isPdf && sizeInMB > maxSizeMB) {
        throw new Error(`ไฟล์มีขนาดใหญ่เกินไป (${sizeInMB.toFixed(1)}MB) กรุณาใช้ไฟล์ขนาดไม่เกิน ${maxSizeMB}MB`);
      }
    }

    const response = await fetchAPI({
      action: 'upload',
      base64Data,
      contentType: processedFile.type || (processedFile.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'),
      fileName: processedFile.name
    });

    if (response.success) {
      toast.success('อัปโหลดสำเร็จ', { id: toastId });
      return response.url;
    } else {
      throw new Error(response.error || 'Upload failed');
    }
  } catch (error: any) {
    toast.error('เกิดข้อผิดพลาดในการอัปโหลด', { id: toastId, description: error.message });
    throw error;
  }
};

// --- School Info ---
export const getSchoolInfo = async () => {
  try {
    // Clear cache to ensure we get fresh data
    clearCache('SchoolInfo');
    const data = await getAPI('SchoolInfo');
    console.log('getSchoolInfo raw data:', data);
    
    if (Array.isArray(data) && data.length > 0) {
      // Find the first non-empty record
      const validRecord = data.find(item => item && Object.keys(item).length > 1); // More than just an ID
      if (validRecord) {
        const info = fixImageUrls(validRecord);
        console.log('getSchoolInfo processed:', info);
        return info;
      }
      
      // Fallback to the first record if none look "valid" but one exists
      const firstItem = data[0];
      if (firstItem && Object.keys(firstItem).length > 0) {
        const info = fixImageUrls(firstItem);
        return info;
      }
    }
    return withSample(fixImageUrls(SAMPLE_SCHOOL_INFO));
  } catch (error) {
    console.error('getSchoolInfo failed:', error);
    return withSample(fixImageUrls(SAMPLE_SCHOOL_INFO));
  }
};

export const updateSchoolInfo = async (data: any) => {
  console.log('updateSchoolInfo attempt with data:', data);
  
  // Ensure we don't send undefined values
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  );
  
  const toastId = toast.loading('กำลังบันทึกข้อมูล...');
  
  try {
    let result;
    // We try 'update' first. If it has an id, use it. 
    // If not, we try id "1" as it's a singleton.
    const targetId = data.id || '1';
    
    console.log(`Attempting to update SchoolInfo with ID: ${targetId}`);
    
    try {
      result = await fetchAPI({ 
        action: 'update', 
        sheet: 'SchoolInfo', 
        id: targetId, 
        data: cleanData 
      });
    } catch (e: any) {
      if (e.message && e.message.includes('Record not found')) {
        console.log('Record not found during update, trying "set" (create/append)');
        result = await fetchAPI({ 
          action: 'set', 
          sheet: 'SchoolInfo', 
          data: cleanData 
        });
      } else {
        throw e;
      }
    }
    
    console.log('updateSchoolInfo result:', result);
    
    // Force clear cache for this sheet
    clearCache('SchoolInfo');
    
    // Small delay to allow GAS to settle before next fetch
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('บันทึกข้อมูลเรียบร้อยแล้ว', { id: toastId });
    return result;
  } catch (error: any) {
    console.error('updateSchoolInfo error:', error);
    toast.error('บันทึกข้อมูลไม่สำเร็จ', { 
      id: toastId, 
      description: 'กรุณาตรวจสอบการตั้งค่า App Script (code.gs) ว่ารองรับการบันทึกข้อมูล SchoolInfo หรือไม่' 
    });
    throw error;
  }
};

// --- Users ---
export const getUsers = async (): Promise<any[]> => {
  const data = await getAPI('Users');
  return fixImageUrls(data);
};

export const getUserByUid = async (uid: string): Promise<any | null> => {
  const user = await getAPI('Users', uid, undefined, ['id', 'uid']);
  return user && !Array.isArray(user) ? fixImageUrls(user) : null;
};

export const getUserByIdCard = async (idCard: string): Promise<any | null> => {
  const users = await getAPI('Users');
  return users.find((u: any) => u.idCard === idCard) || null;
};

export const createUser = async (data: any) => {
  return await fetchAPI({ action: 'create', sheet: 'Users', data });
};

export const updateUser = async (id: string, data: any) => {
  const adminRole = data.role === 'admin' ? 'admin' : data.role;
  const userPatch = { ...data };
  if (data.role) userPatch.role = adminRole;

  await fetchAPI({ action: 'update', sheet: 'Users', id, data: userPatch, matchColumns: ['id', 'uid'] });
  
  // Try to sync to Staff sheet as well
  try {
    const staffData: any = {};
    if (data.name) staffData.name = data.name;
    if (data.email) staffData.email = data.email;
    if (data.imageUrl) staffData.imageUrl = data.imageUrl;
    if (data.idCard) staffData.idCard = data.idCard;
    if (data.role) staffData.role = adminRole;
    if (data.status) staffData.status = data.status;
    
    if (Object.keys(staffData).length > 0) {
      await fetchAPI({ action: 'update', sheet: 'Staff', id, data: staffData, matchColumns: ['uid', 'id'] });
    }
  } catch (e) {
    console.error('Error syncing user update to staff:', e);
  }

  const current = getCurrentUser();
  if (current && String(current.id) === String(id)) {
    setCurrentUser({
      ...current,
      ...userPatch,
      role: adminRole || current.role,
    });
  }
};

export const deleteUser = async (id: string) => {
  await fetchAPI({ action: 'delete', sheet: 'Users', id, matchColumns: ['id', 'uid'] });
  toast.success('ลบผู้ใช้งานสำเร็จ');
};

// --- Staff ---
const processStaff = (staff: any) => {
  if (!staff) return null;
  const processed = { ...staff };
  const jsonFields = ['achievements', 'activities', 'certificates', 'annualData'];
  jsonFields.forEach(field => {
    if (processed[field] && typeof processed[field] === 'string') {
      try { 
        processed[field] = JSON.parse(processed[field]); 
      } catch (e) { 
        processed[field] = field === 'annualData' ? {} : []; 
      }
    } else if (!processed[field]) {
      processed[field] = field === 'annualData' ? {} : [];
    }
  });
  return fixImageUrls(processed);
};

export const getStaff = async () => {
  try {
    const data = await getAPI('Staff');
    const staff = (data || [])
      .filter((s: any) => s.status === 'approved' || !s.status)
      .map((s: any) => processStaff(s))
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    if (staff.length > 0) return staff;
    return SAMPLE_STAFF.map((s) => withSample(s));
  } catch {
    return SAMPLE_STAFF.map((s) => withSample(s));
  }
};

export const getStaffById = async (id: string) => {
  const staff = await getAPI('Staff', id, undefined, ['id', 'uid']);
  return processStaff(staff);
};

export const getStaffByUid = async (uid: string, email?: string, idCard?: string): Promise<Staff | null> => {
  const staff = await getAPI('Staff');
  const s = staff.find((s: any) => 
    s.uid === uid || 
    s.id === uid || 
    (email && s.email === email) || 
    (idCard && s.idCard === idCard)
  );
  
  if (s && !s.uid && uid) {
    // If we found the staff by email/idCard but uid is not set, 
    // we should update it so it's linked for next time
    try {
      await updateStaff(s.id, { uid });
      s.uid = uid;
    } catch (e) {
      console.error('Error auto-linking staff uid:', e);
    }
  }
  
  return processStaff(s);
};

export const getStaffByIdCard = async (idCard: string): Promise<Staff | null> => {
  const staff = await getAPI('Staff');
  const s = staff.find((s: any) => s.idCard === idCard);
  return processStaff(s);
};

export const getAllStaff = async (): Promise<Staff[]> => {
  return getStaff();
};

export const createStaff = async (data: any) => {
  const processedData = { ...data };
  const jsonFields = ['achievements', 'activities', 'certificates', 'annualData'];
  jsonFields.forEach(field => {
    if (processedData[field] && typeof processedData[field] !== 'string') {
      processedData[field] = JSON.stringify(processedData[field]);
    }
  });

  // If email and password are provided, create a user record first
  if (data.email && data.password) {
    try {
      const userData = {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role || 'staff',
        status: data.status || 'approved',
        idCard: data.idCard,
        phone: data.phone
      };
      const userResult = await fetchAPI({ action: 'create', sheet: 'Users', data: userData });
      if (userResult && userResult.id) {
        processedData.uid = userResult.id;
      }
    } catch (e) {
      console.error('Error creating user for staff:', e);
    }
  }

  return await fetchAPI({ action: 'create', sheet: 'Staff', data: processedData });
};

export const updateStaffRole = async (id: string, role: 'admin' | 'staff') => {
  await fetchAPI({ action: 'update', sheet: 'Staff', id, data: { role }, matchColumns: ['id', 'uid'] });
  toast.success('อัปเดตบทบาทสำเร็จ');
};

export const updateStaff = async (id: string, data: any) => {
  const processedData = { ...data };
  const jsonFields = ['achievements', 'activities', 'certificates', 'annualData'];
  jsonFields.forEach(field => {
    if (processedData[field] && typeof processedData[field] !== 'string') {
      processedData[field] = JSON.stringify(processedData[field]);
    }
  });
  
  // Update Staff sheet
  console.log(`Updating staff member ${id}...`);
  const result = await fetchAPI({ action: 'update', sheet: 'Staff', id, data: processedData, matchColumns: ['id', 'uid'] });
  
  // Also update Users sheet — หา record จาก uid, email หรือ idCard
  const userPatch: Record<string, unknown> = {};
  if (data.name) userPatch.name = data.name;
  if (data.email) userPatch.email = data.email;
  if (data.imageUrl) userPatch.imageUrl = data.imageUrl;
  if (data.idCard) userPatch.idCard = data.idCard;
  if (data.phone) userPatch.phone = data.phone;
  if (data.password) userPatch.password = data.password;
  if (data.role) userPatch.role = data.role === 'admin' ? 'admin' : data.role;
  if (data.status) userPatch.status = data.status;

  if (Object.keys(userPatch).length > 0) {
    try {
      if (data.uid && String(data.uid).trim()) {
        await fetchAPI({ action: 'update', sheet: 'Users', id: data.uid, data: userPatch, matchColumns: ['id', 'uid'] });
      } else {
        const users = await getAPI('Users');
        const linked = users.find((u: any) =>
          (data.email && u.email && String(u.email).toLowerCase() === String(data.email).toLowerCase()) ||
          (data.idCard && u.idCard && String(u.idCard) === String(data.idCard))
        );
        if (linked?.id) {
          await fetchAPI({ action: 'update', sheet: 'Users', id: linked.id, data: userPatch, matchColumns: ['id', 'uid'] });
        }
      }
    } catch (e: any) {
      console.error('Error syncing staff update to users:', e.message || e);
    }
  }

  const current = getCurrentUser();
  if (current && data.role && (
    (data.uid && String(data.uid) === String(current.id)) ||
    (data.email && current.email && String(data.email).toLowerCase() === String(current.email).toLowerCase()) ||
    (data.idCard && current.idCard && String(data.idCard) === String(current.idCard))
  )) {
    setCurrentUser({ ...current, role: resolveAdminRole(data.role, data.role) });
  }
  
  return result;
};

export const deleteStaff = async (id: string) => {
  await fetchAPI({ action: 'delete', sheet: 'Staff', id });
};

// --- Posts ---
const processPost = (post: any): Post => {
  if (!post) return post;
  const processed = { ...post };
  if (processed.album && typeof processed.album === 'string') {
    try {
      let parsed: unknown = JSON.parse(processed.album);
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      processed.album = Array.isArray(parsed) ? parsed : [];
    } catch {
      processed.album = [];
    }
  }
  
  // Unpack shortId from album
  if (Array.isArray(processed.album)) {
    const shortIdItem = processed.album.find((item: any) => item.type === 'shortId');
    if (shortIdItem) {
      processed.shortId = String(shortIdItem.url ?? '').trim();
      processed.album = processed.album.filter((item: any) => item.type !== 'shortId');
    }
    const newsletterItem = processed.album.find(
      (item: any) => item?.type?.toLowerCase() === 'newsletter',
    );
    if (newsletterItem?.url) {
      processed.newsletterUrl = fixDriveUrl(newsletterItem.url);
      processed.album = processed.album.filter((item: any) => item.type !== 'newsletter');
    }
  }

  if (processed.newsletterUrl && typeof processed.newsletterUrl === 'string') {
    processed.newsletterUrl = fixDriveUrl(processed.newsletterUrl);
  }

  if (processed.shortId != null && processed.shortId !== '') {
    processed.shortId = String(processed.shortId).trim();
  }

  // Handle legacy authorName mapping if it exists
  if (processed.authorName && !processed.author) {
    processed.author = processed.authorName;
  }
  
  // Ensure createdAt exists
  if (!processed.createdAt) {
    processed.createdAt = new Date().toISOString();
  }
  
  return fixImageUrls(processed);
};

export const getPosts = async (category?: string): Promise<Post[]> => {
  try {
    const data = await getAPI('Posts', undefined, category);
    const posts = (data || [])
      .map((p: any) => processPost(p))
      .sort((a: Post, b: Post) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
    if (posts.length > 0) return posts;
    return getSamplePosts(category).map((p) => withSample(p));
  } catch {
    return getSamplePosts(category).map((p) => withSample(p));
  }
};

export const getPostById = async (id: string, options?: { fresh?: boolean }): Promise<Post | null> => {
  if (options?.fresh) clearCache('Posts');
  if (isSampleId(id)) {
    const sample = getSamplePostById(id);
    return sample ? withSample(sample) : null;
  }
  const post = await getAPI('Posts', id);
  if (post && !post.error) return processPost(post);
  return getSamplePostById(id) ? withSample(getSamplePostById(id)!) : null;
};

export const getPostByShortId = async (shortId: string, options?: { fresh?: boolean }): Promise<Post | null> => {
  if (options?.fresh) clearCache('Posts');
  const needle = String(shortId).trim();
  const posts = await getAPI('Posts');
  const post = posts.find((p: any) => {
    const processed = processPost(p);
    return String(processed.shortId ?? '').trim() === needle;
  });
  return post ? processPost(post) : null;
};

export const createPost = async (data: any) => {
  const processedData = { 
    ...data,
    createdAt: new Date().toISOString()
  };
  
  const album = Array.isArray(processedData.album) ? [...processedData.album] : [];
  const filteredAlbum = album.filter((item: any) => item.type !== 'shortId' && item.type !== 'newsletter');
  if (processedData.shortId) {
    filteredAlbum.push({ type: 'shortId', url: processedData.shortId });
  }
  if (processedData.newsletterUrl) {
    filteredAlbum.push({ type: 'newsletter', url: processedData.newsletterUrl });
  }
  processedData.album = JSON.stringify(filteredAlbum);
  
  return await fetchAPI({ action: 'create', sheet: 'Posts', data: processedData });
};

export const updatePost = async (id: string, data: any) => {
  const processedData = { ...data };
  
  const album = Array.isArray(processedData.album) ? [...processedData.album] : [];
  const filteredAlbum = album.filter((item: any) => item.type !== 'shortId' && item.type !== 'newsletter');
  if (processedData.shortId) {
    filteredAlbum.push({ type: 'shortId', url: processedData.shortId });
  }
  if (processedData.newsletterUrl) {
    filteredAlbum.push({ type: 'newsletter', url: processedData.newsletterUrl });
  }
  processedData.album = JSON.stringify(filteredAlbum);
  
  await fetchAPI({ action: 'update', sheet: 'Posts', id, data: processedData });
};

export const deletePost = async (id: string) => {
  await fetchAPI({ action: 'delete', sheet: 'Posts', id });
};

// --- Home Config ---
const processHomeConfig = (config: any) => {
  if (!config) return null;
  const processed = { ...config };
  const jsonFields = ['bannerSlides', 'recommendedPrograms', 'youtubeVideos', 'featuredPostIds'];
  jsonFields.forEach(field => {
    if (processed[field] && typeof processed[field] === 'string') {
      try { 
        processed[field] = JSON.parse(processed[field]); 
      } catch (e) { 
        processed[field] = []; 
      }
    }
    
    if (!Array.isArray(processed[field])) {
      processed[field] = [];
    }
  });

  // Unpack youtubeVideos from bannerSlides if it exists
  if (processed.bannerSlides && Array.isArray(processed.bannerSlides)) {
    const packedItem = processed.bannerSlides.find((s: any) => s.id === 'PACKED_YOUTUBE_VIDEOS');
    if (packedItem && packedItem.title) {
      try {
        const parsedVideos = JSON.parse(packedItem.title);
        if (Array.isArray(parsedVideos) && parsedVideos.length > 0) {
          processed.youtubeVideos = parsedVideos;
        }
      } catch (e) {
        console.error("Failed to parse packed youtube videos", e);
      }
    }
    // Remove the packed item from bannerSlides
    processed.bannerSlides = processed.bannerSlides.filter((s: any) => s.id !== 'PACKED_YOUTUBE_VIDEOS');
  }

  return fixImageUrls(processed);
};

export const getHomeConfig = async () => {
  try {
    const data = await getAPI('HomeConfig');
    if (data && data.length > 0) return processHomeConfig(data[0]);
    return withSample(processHomeConfig(SAMPLE_HOME_CONFIG));
  } catch {
    return withSample(processHomeConfig(SAMPLE_HOME_CONFIG));
  }
};

export const updateHomeConfig = async (data: any) => {
  const processedData = { ...data };
  
  // Pack youtubeVideos into bannerSlides to bypass missing column issue in GAS
  if (processedData.youtubeVideos && Array.isArray(processedData.youtubeVideos)) {
    const packedSlides = [...(processedData.bannerSlides || [])];
    const filteredSlides = packedSlides.filter(s => s.id !== 'PACKED_YOUTUBE_VIDEOS');
    
    if (processedData.youtubeVideos.length > 0) {
      filteredSlides.push({
        id: 'PACKED_YOUTUBE_VIDEOS',
        imageUrl: '',
        title: JSON.stringify(processedData.youtubeVideos),
        order: 9999
      });
    }
    processedData.bannerSlides = filteredSlides;
  }

  const jsonFields = ['bannerSlides', 'recommendedPrograms', 'youtubeVideos', 'featuredPostIds'];
  jsonFields.forEach(field => {
    if (processedData[field] && typeof processedData[field] !== 'string') {
      processedData[field] = JSON.stringify(processedData[field]);
    }
  });
  await fetchAPI({ action: 'set', sheet: 'HomeConfig', data: processedData });
};

// --- Executives ---
export const getExecutives = async (): Promise<Executive[]> => {
  try {
    const data = await getAPI('Executives');
    const processed = fixImageUrls(data || []);
    const list = processed.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    if (list.length > 0) return list;
    return SAMPLE_EXECUTIVES.map((e) => withSample(e));
  } catch {
    return SAMPLE_EXECUTIVES.map((e) => withSample(e));
  }
};

export const createExecutive = async (data: any) => {
  await fetchAPI({ action: 'create', sheet: 'Executives', data });
};

export const updateExecutive = async (id: string, data: any) => {
  await fetchAPI({ action: 'update', sheet: 'Executives', id, data });
};

export const deleteExecutive = async (id: string) => {
  await fetchAPI({ action: 'delete', sheet: 'Executives', id });
};

// --- Info Documents ---
export const getInfoDocuments = async (category?: string): Promise<InfoDocument[]> => {
  try {
    const data = await getAPI('InfoDocuments', undefined, category);
    const processed = fixImageUrls(data || []);
    const docs = processed
      .map((d: any) => ({
        ...d,
        createdAt: d.createdAt || new Date().toISOString(),
      }))
      .sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
    if (docs.length > 0) return docs;
    const samples = category
      ? SAMPLE_INFO_DOCUMENTS.filter((d) => d.category === category)
      : SAMPLE_INFO_DOCUMENTS;
    return samples.map((d) => withSample(d));
  } catch {
    const samples = category
      ? SAMPLE_INFO_DOCUMENTS.filter((d) => d.category === category)
      : SAMPLE_INFO_DOCUMENTS;
    return samples.map((d) => withSample(d));
  }
};

export const createInfoDocument = async (data: any) => {
  const processedData = {
    ...data,
    createdAt: data.createdAt || new Date().toISOString()
  };
  await fetchAPI({ action: 'create', sheet: 'InfoDocuments', data: processedData });
};

export const updateInfoDocument = async (id: string, data: any) => {
  await fetchAPI({ action: 'update', sheet: 'InfoDocuments', id, data });
};

export const deleteInfoDocument = async (id: string) => {
  await fetchAPI({ action: 'delete', sheet: 'InfoDocuments', id });
};

// --- Contact Messages ---
export const sendContactMessage = async (data: any) => {
  return await fetchAPI({ 
    action: 'create', 
    sheet: 'ContactMessages', 
    data: { 
      ...data, 
      createdAt: new Date().toISOString(),
      status: 'unread'
    } 
  });
};

// --- Stats & Tracking ---
const getDeviceMetadata = () => {
  const ua = navigator.userAgent;
  let device = "Desktop";
  if (/Mobi|Android/i.test(ua)) device = "Mobile";
  if (/Tablet|iPad/i.test(ua)) device = "Tablet";

  let browser = "Unknown";
  if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Edge")) browser = "Edge";

  let os = "Unknown";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "MacOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Linux")) os = "Linux";

  return { device, browser, os };
};

export const trackVisit = async (page: string = "Home") => {
  const tracked = sessionStorage.getItem(`v_tracked_${page}`);
  if (tracked) {
    const data = await fetchAPI({ action: 'read', sheet: 'Stats' });
    if (Array.isArray(data)) {
      const stats: any = {};
      data.forEach((item: any) => {
        stats[item.key] = item.value;
      });
      return {
        total: parseInt(stats.total_visits) || 0,
        today: parseInt(stats.today_visits) || 0,
        last_visit_date: stats.last_visit_date
      };
    }
    return data;
  }
  
  const metadata = getDeviceMetadata();
  let country = "Unknown";
  
  try {
    // Try to get country from a free API
    const geoRes = await fetch('https://ipapi.co/json/');
    const geoData = await geoRes.json();
    country = geoData.country_name || "Unknown";
  } catch (e) {
    console.warn("Could not fetch geo data", e);
  }

  const result = await fetchAPI({ 
    action: 'trackVisit', 
    data: { ...metadata, country, page } 
  });
  
  if (result.success) {
    sessionStorage.setItem(`v_tracked_${page}`, 'true');
    return {
      total: parseInt(result.total) || 0,
      today: parseInt(result.today) || 0,
      success: true
    };
  }
  return result;
};

export const getDetailedStats = async () => {
  return await fetchAPI({ action: 'getDetailedStats' });
};

export const getVisitStats = async () => {
  const data = await fetchAPI({ action: 'read', sheet: 'Stats' });
  if (Array.isArray(data)) {
    const stats: any = {};
    data.forEach((item: any) => {
      stats[item.key] = item.value;
    });
    return {
      total: parseInt(stats.total_visits) || 0,
      today: parseInt(stats.today_visits) || 0,
      last_visit_date: stats.last_visit_date
    };
  }
  return data;
};

export const incrementPostView = async (postId: string) => {
  const tracked = sessionStorage.getItem(`pv_${postId}`);
  if (tracked) return null;

  const result = await fetchAPI({ action: 'incrementPostView', sheet: 'Posts', id: postId });
  if (result?.success) {
    sessionStorage.setItem(`pv_${postId}`, 'true');
  }
  return result;
};

// Real-time listener for new posts
export const onNewPost = (callback: (posts: any[]) => void) => {
  let lastPostId = localStorage.getItem('last_notified_post_id');
  
  const checkNewPost = async () => {
    try {
      const posts = await getPosts();
      
      // Filter out only relevant categories
      const allowedCategories = ['news', 'activity', 'publication'];
      const relevantPosts = posts.filter((p: any) => allowedCategories.includes(p.category));

      if (relevantPosts.length > 0) {
        if (lastPostId === null) {
          // First visit: notify up to 3 latest posts
          const newPosts = relevantPosts.slice(0, 3);
          if (newPosts.length > 0) {
            callback(newPosts);
            const topId = newPosts[0].id;
            if (topId) {
              lastPostId = topId;
              localStorage.setItem('last_notified_post_id', topId);
            }
          }
        } else {
          // Check for new posts since last post ID
          const newPosts: any[] = [];
          for (const post of relevantPosts) {
            if (post.id === lastPostId) break;
            newPosts.push(post);
          }
          if (newPosts.length > 0) {
            callback(newPosts.slice(0, 3)); // Send up to 3
            const topId = newPosts[0].id;
            if (topId) {
              lastPostId = topId;
              localStorage.setItem('last_notified_post_id', topId);
            }
          }
        }
      }
    } catch (e) {
      console.warn('New post check failed:', e);
    }
  };

  // Check immediately on mount (but with a delay to not overlap with initial loading)
  const initialTimeout = setTimeout(checkNewPost, 3000);
  
  // Setup interval
  const interval = setInterval(checkNewPost, 60000); // Check every minute
  
  return () => {
    clearTimeout(initialTimeout);
    clearInterval(interval);
  };
};

export const loadDemoPageData = () => ({
  config: withSample(processHomeConfig(SAMPLE_HOME_CONFIG)!),
  schoolInfo: withSample(fixImageUrls(SAMPLE_SCHOOL_INFO)),
  news: getSamplePosts('news').map((p) => withSample(p)),
  activities: getSamplePosts('activity').map((p) => withSample(p)),
  publications: getSamplePosts('publication').map((p) => withSample(p)),
});
