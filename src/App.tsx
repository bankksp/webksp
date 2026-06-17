import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useSchoolInfo } from './hooks/useSchoolInfo';
import { useNewPostNotification } from './hooks/useNewPostNotification';

// Public Pages

import { Home } from './pages/Home';
import { About } from './pages/About';
import { Staff } from './pages/Staff';
import { StaffProfile } from './pages/StaffProfile';
import { StaffEdit } from './pages/StaffEdit';
import { Posts } from './pages/Posts';
import { PostDetail } from './pages/PostDetail';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { ExecutiveDirectory } from './pages/ExecutiveDirectory';
import { BoardOfDirectors } from './pages/BoardOfDirectors';
import { Information } from './pages/Information';
import { Portfolio } from './pages/Portfolio';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';

// Admin Pages
import { Dashboard } from './pages/admin/Dashboard';
import { PostManager } from './pages/admin/PostManager';
import { StaffManager } from './pages/admin/StaffManager';
import { UserManager } from './pages/admin/UserManager';
import { ExecutiveManager } from './pages/admin/ExecutiveManager';
import { InfoDocumentManager } from './pages/admin/InfoDocumentManager';
import { HomeEditor } from './pages/admin/HomeEditor';
import { SchoolInfoEditor } from './pages/admin/SchoolInfoEditor';
import { Statistics } from './pages/admin/Statistics';

// Layouts
import { Layout } from './components/Layout';
import { AdminLayout } from './components/AdminLayout';
import { getPosts, getStaff, getExecutives, getInfoDocuments } from './services/dataService';

// Data Prefetcher Component
const DataPrefetcher = () => {
  useNewPostNotification();

  useEffect(() => {
    // Prefetch common data in background
    const prefetch = async () => {
      try {
        await Promise.all([
          getPosts(),
          getStaff(),
          getExecutives(),
          getInfoDocuments()
        ]);
      } catch (e) {
        console.warn('Prefetch failed:', e);
      }
    };
    
    // Small delay to let initial page load first
    const timer = setTimeout(prefetch, 2000);
    return () => clearTimeout(timer);
  }, []);
  
  return null;
};

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user.role === 'admin' || user.email?.toLowerCase() === 'nanthaphat@ksp.ac.th';
  const isApproved = user.status === 'approved' || isAdmin;

  if (!isApproved && !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Global Head Tags Manager
const GlobalHead = () => {
  const { schoolInfo } = useSchoolInfo();
  const logoUrl = schoolInfo?.logoUrl || "https://s.imgz.io/2026/04/04/ccddd146d75a508fb2.png";

  return (
    <Helmet>
      <title>โรงเรียนกาฬสินธุ์ปัญญานุกูล</title>
      <meta name="description" content="โรงเรียนกาฬสินธุ์ปัญญานุกูล มุ่งเน้นการจัดการศึกษาสำหรับเด็กที่มีความต้องการจำเป็นพิเศษ พัฒนาทักษะชีวิต วิชาการ และอาชีพ" />
      <meta name="keywords" content="โรงเรียนกาฬสินธุ์ปัญญานุกูล, กาฬสินธุ์ปัญญานุกูล, โรงเรียนพิเศษ, เด็กพิเศษ, การศึกษาพิเศษ, กาฬสินธุ์" />
      <meta property="og:title" content="โรงเรียนกาฬสินธุ์ปัญญานุกูล" />
      <meta property="og:description" content="โรงเรียนกาฬสินธุ์ปัญญานุกูล มุ่งเน้นการจัดการศึกษาสำหรับเด็กที่มีความต้องการจำเป็นพิเศษ" />
      <meta property="og:image" content={logoUrl} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="canonical" href={window.location.href} />
      <link rel="icon" type="image/png" href={logoUrl} />
      <link rel="apple-touch-icon" href={logoUrl} />
    </Helmet>
  );
};

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <GlobalHead />
          <Toaster position="bottom-right" richColors closeButton toastOptions={{ className: 'font-sans' }} />
          <DataPrefetcher />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/about" element={<Layout><About /></Layout>} />
            <Route path="/about/:section" element={<Layout><About /></Layout>} />
            <Route path="/staff" element={<Layout><Staff /></Layout>} />
            <Route path="/staff/:category" element={<Layout><Staff /></Layout>} />
            <Route path="/staff/profile/:id" element={<Layout><StaffProfile /></Layout>} />
            <Route path="/staff/edit" element={<Layout><StaffEdit /></Layout>} />
            <Route path="/posts" element={<Layout><Posts /></Layout>} />
            <Route path="/posts/:category" element={<Layout><Posts /></Layout>} />
            <Route path="/p/:id" element={<Layout><PostDetail /></Layout>} />
            {/* Legacy route for compatibility */}
            <Route path="/post/:id" element={<Layout><PostDetail /></Layout>} />
            <Route path="/contact" element={<Layout><Contact /></Layout>} />
            <Route path="/login" element={<Login />} />
            <Route path="/executives" element={<Layout><ExecutiveDirectory /></Layout>} />
            <Route path="/board" element={<Layout><BoardOfDirectors /></Layout>} />
            <Route path="/info" element={<Layout><Information /></Layout>} />
            <Route path="/info/:category" element={<Layout><Information /></Layout>} />
            <Route path="/portfolio" element={<Layout><Portfolio /></Layout>} />
            <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
            <Route path="/terms" element={<Layout><Terms /></Layout>} />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/posts" element={
              <ProtectedRoute adminOnly={true}>
                <AdminLayout>
                  <PostManager />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/staff" element={
              <ProtectedRoute adminOnly={true}>
                <AdminLayout>
                  <StaffManager />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute adminOnly={true}>
                <AdminLayout>
                  <UserManager />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/executives" element={
              <ProtectedRoute adminOnly={true}>
                <AdminLayout>
                  <ExecutiveManager />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/info" element={
              <ProtectedRoute adminOnly={true}>
                <AdminLayout>
                  <InfoDocumentManager />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/home-editor" element={
              <ProtectedRoute adminOnly={true}>
                <AdminLayout>
                  <HomeEditor />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/school-info" element={
              <ProtectedRoute adminOnly={true}>
                <AdminLayout>
                  <SchoolInfoEditor />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/statistics" element={
              <ProtectedRoute adminOnly={true}>
                <AdminLayout>
                  <Statistics />
                </AdminLayout>
              </ProtectedRoute>
            } />

            {/* Short URLs for Posts (e.g., /ksp1) */}
            {/* Placing this at the very end (before fallback) to avoid matching static routes like /admin */}
            <Route path="/:id" element={<Layout><PostDetail /></Layout>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  );
}
