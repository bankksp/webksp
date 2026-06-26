import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FileUpload } from '../components/FileUpload';
import { motion, AnimatePresence } from 'motion/react';
import { User, Lock, Mail, CreditCard, LogIn, UserPlus, Eye, EyeOff, ArrowLeft, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useSchoolInfo } from '../hooks/useSchoolInfo';
import { getSiteLogo } from '../constants/branding';

export const Login = () => {
  const navigate = useNavigate();
  const { login, register, forgotPassword } = useAuth();
  const { schoolInfo } = useSchoolInfo();
  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotIdCard, setForgotIdCard] = useState('');

  // Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [idCard, setIdCard] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const credentials: { email?: string, idCard?: string, password?: string } = { password };
      
      if (loginIdentifier.includes('@')) {
        credentials.email = loginIdentifier;
      } else {
        credentials.idCard = loginIdentifier;
      }

      await login(credentials);
      navigate('/');
    } catch (error: any) {
      console.error('Login Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageUrl) {
      toast.error('กรุณาอัปโหลดรูปโปรไฟล์ก่อนสมัครสมาชิก');
      return;
    }

    setLoading(true);
    try {
      const success = await register({
        email,
        password,
        name,
        idCard,
        imageUrl
      });
      if (success) {
        // Check if user is logged in (approved) or pending
        const currentUser = localStorage.getItem('ksp_panya_user');
        if (currentUser) {
          navigate('/');
        } else {
          setIsLogin(true); // Switch back to login view
        }
      }
    } catch (error: any) {
      console.error('Register Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdCard) {
      toast.error('กรุณากรอกเลขบัตรประชาชน');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(forgotIdCard);
      setShowForgot(false);
      setForgotIdCard('');
    } catch (error) {
      console.error('Forgot Password Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-6xl w-full bg-white rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col md:flex-row overflow-hidden min-h-[700px]"
      >
        {/* Left Side - Blue Branding */}
        <div className="md:w-[42%] bg-gradient-to-br from-[#4db8ff] to-[#2b86ff] p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Decorative Background Text */}
          <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
            <span className="text-[20rem] font-black font-display rotate-[-15deg]">KSP</span>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-24">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                <img src={getSiteLogo(schoolInfo?.logoUrl)} alt="Logo" className="w-7 h-7 object-contain brightness-0 invert" />
              </div>
              <span className="text-2xl font-black font-display tracking-tighter">KSP</span>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm font-black font-display tracking-[0.3em] opacity-80 uppercase">Anything's Possible</p>
              <h2 className="text-[8rem] font-black font-display leading-none tracking-tighter">KSP</h2>
              <div className="pt-4">
                <p className="text-xl font-bold opacity-90 mb-2">ksp management</p>
                <p className="text-sm leading-relaxed opacity-70 max-w-xs mx-auto">
                  ระบบบริหารจัดการข้อมูลสารสนเทศ เพื่อการพัฒนาคุณภาพการศึกษา
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex justify-between items-end">
            <p className="text-[10px] opacity-60">© 2026 KSP. All Rights Reserved</p>
            <div className="flex items-center gap-4">
              <span className="text-[10px] opacity-60">สนับสนุนโดย</span>
              <div className="flex gap-2">
                <div className="w-6 h-6 bg-white/20 rounded-md"></div>
                <div className="w-6 h-6 bg-white/20 rounded-md"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-[58%] p-8 md:p-16 flex flex-col justify-center bg-white">
          <AnimatePresence mode="wait">
            {showForgot ? (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full max-w-md mx-auto"
              >
                <button 
                  onClick={() => setShowForgot(false)}
                  className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors mb-8 font-bold"
                >
                  <ArrowLeft size={20} /> ย้อนกลับ
                </button>
                <div className="mb-10">
                  <h1 className="text-4xl font-black text-gray-900 mb-4">ลืมรหัสผ่าน?</h1>
                  <p className="text-gray-500 font-medium">กรุณากรอกเลขบัตรประชาชนเพื่อรีเซ็ตรหัสผ่านของคุณ</p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">เลขบัตรประชาชน</label>
                    <div className="relative">
                      <input 
                        required
                        type="text" 
                        maxLength={13}
                        value={forgotIdCard}
                        onChange={(e) => setForgotIdCard(e.target.value.replace(/\D/g, ''))}
                        placeholder="146XXXXXXXXXXXXX"
                        className="w-full px-6 py-4 bg-[#f3f6f9] border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'รีเซ็ทรหัสผ่าน'
                    )}
                  </button>
                </form>
              </motion.div>
            ) : isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full max-w-md mx-auto"
              >
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">เข้าสู่ระบบสำหรับบุคลากร</h1>
                  <p className="text-gray-500 font-medium">กรุณากรอกเลขบัตรประชาชนและรหัสผ่านของคุณ</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">เลขบัตรประชาชน หรือ GMAIL</label>
                    <input 
                      required
                      type="text" 
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="146XXXXXXXXXXXXX"
                      className="w-full px-6 py-4 bg-[#f3f6f9] border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider">รหัสผ่าน</label>
                      <button 
                        type="button"
                        onClick={() => setShowForgot(true)}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        ลืมรหัสผ่าน ?
                      </button>
                    </div>
                    <div className="relative">
                      <input 
                        required
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-6 py-4 bg-[#f3f6f9] border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'เข้าสู่ระบบ'
                    )}
                  </button>
                </form>

                <div className="relative my-10">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-gray-400 font-bold">หรือ</span>
                  </div>
                </div>

                <button 
                  onClick={() => setIsLogin(false)}
                  className="w-full py-5 border-2 border-gray-100 text-gray-700 rounded-[1.5rem] font-black text-lg hover:bg-gray-50 hover:border-gray-200 transition-all flex items-center justify-center gap-3"
                >
                  <UserPlus size={22} className="text-gray-400" />
                  ลงทะเบียนบุคลากรใหม่
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full max-w-md mx-auto"
              >
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">ลงทะเบียนบุคลากร</h1>
                  <p className="text-gray-500 font-medium">กรุณากรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้งานใหม่</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="flex justify-center mb-6">
                    <FileUpload 
                      label="รูปโปรไฟล์"
                      isCircle={true}
                      currentImageUrl={imageUrl}
                      onUploadSuccess={(url) => setImageUrl(url)}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">ชื่อ-นามสกุล</label>
                      <input 
                        required
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="นายสมชาย ใจดี"
                        className="w-full px-5 py-3 bg-[#f3f6f9] border-2 border-transparent rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-gray-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">เลขบัตรประชาชน</label>
                      <input 
                        required
                        type="text" 
                        maxLength={13}
                        value={idCard}
                        onChange={(e) => setIdCard(e.target.value.replace(/\D/g, ''))}
                        placeholder="146XXXXXXXXXXXXX"
                        className="w-full px-5 py-3 bg-[#f3f6f9] border-2 border-transparent rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-gray-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">อีเมล</label>
                      <input 
                        required
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="w-full px-5 py-3 bg-[#f3f6f9] border-2 border-transparent rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-gray-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">รหัสผ่าน</label>
                      <input 
                        required
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-5 py-3 bg-[#f3f6f9] border-2 border-transparent rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-gray-700"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'สมัครสมาชิก'
                    )}
                  </button>

                  <button 
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="w-full py-2 text-gray-400 font-bold hover:text-blue-600 transition-all text-sm"
                  >
                    มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
