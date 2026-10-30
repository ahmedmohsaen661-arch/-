'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  LogOut,
  Save,
  Upload,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  KeyRound,
  Eye,
  Settings,
  Sparkles,
  Image as ImageIcon,
  MessageSquareHeart,
  Tag,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { SiteContent, MemoryCard } from '@/lib/types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: SiteContent;
  onContentUpdated: (newContent: SiteContent) => void;
}

export default function AdminModal({ isOpen, onClose, content, onContentUpdated }: AdminModalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Form State
  const [activeTab, setActiveTab] = useState<'texts' | 'memories' | 'dalaa' | 'settings' | 'security'>('texts');
  const [formData, setFormData] = useState<SiteContent>(content);
  const [newDalaaWord, setNewDalaaWord] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Uploading state per card
  const [uploadingCardId, setUploadingCardId] = useState<number | null>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Sync formData with props when content updates
  useEffect(() => {
    setFormData(content);
  }, [content]);

  // Client-side image compression to ensure smooth and fail-safe uploads
  const compressImage = (file: File, maxWidth = 1600, maxHeight = 1600, quality = 0.85): Promise<File> => {
    return new Promise((resolve) => {
      if (file.type === 'image/svg+xml' || file.type === 'image/gif' || file.size < 500 * 1024) {
        resolve(file);
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              const cleanName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
              resolve(new File([blob], cleanName, { type: 'image/jpeg' }));
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  // Helper to attach authorization header
  const getAuthHeaders = (includeContentType = true): HeadersInit => {
    const headers: Record<string, string> = {};
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  };

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: getAuthHeaders(false),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        if (data.token && typeof window !== 'undefined') {
          localStorage.setItem('admin_token', data.token);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  // Check initial admin session
  useEffect(() => {
    if (isOpen) {
      checkAuthStatus();
    }
  }, [isOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (data.token && typeof window !== 'undefined') {
          localStorage.setItem('admin_token', data.token);
        }
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setAuthError(data.error || 'كلمة المرور غير صحيحة');
      }
    } catch {
      setAuthError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getAuthHeaders(false),
        credentials: 'include',
      });
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
      }
      setIsAuthenticated(false);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: getAuthHeaders(true),
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus({ type: 'success', message: 'تم حفظ جميع التعديلات بنجاح في قاعدة البيانات! ستظهر التعديلات دائماً حتى بعد قفل وفتح الموقع ✨' });
        onContentUpdated(data.content);
        if (typeof window !== 'undefined') {
          localStorage.setItem('romantic_content_cache', JSON.stringify(data.content));
        }
        setTimeout(() => setSaveStatus(null), 5000);
      } else {
        setSaveStatus({ type: 'error', message: data.error || 'فشل حفظ التعديلات' });
      }
    } catch (err: any) {
      setSaveStatus({ type: 'error', message: 'خطأ في الاتصال بالخادم أثناء الحفظ: ' + (err?.message || '') });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (cardId: number, file: File) => {
    setUploadingCardId(cardId);
    setSaveStatus(null);

    try {
      // 1. Compress image client-side to guarantee rapid upload without payload limits
      const optimizedFile = await compressImage(file);

      const body = new FormData();
      body.append('file', optimizedFile);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: getAuthHeaders(false),
        credentials: 'include',
        body,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Update local memory card image
        const updatedMemories = formData.memories.map((m) =>
          m.id === cardId ? { ...m, image: data.url } : m
        );
        const updatedForm = { ...formData, memories: updatedMemories };
        setFormData(updatedForm);

        // Auto-persist immediately to DB
        try {
          await fetch('/api/content', {
            method: 'PUT',
            headers: getAuthHeaders(true),
            credentials: 'include',
            body: JSON.stringify(updatedForm),
          });
          onContentUpdated(updatedForm);
          if (typeof window !== 'undefined') {
            localStorage.setItem('romantic_content_cache', JSON.stringify(updatedForm));
          }
        } catch (saveErr) {
          console.warn('Auto-save warning:', saveErr);
        }

        setSaveStatus({ type: 'success', message: 'تم رفع الصورة وتثبيتها بنجاح! تم حفظ التعديل بشكل دائم في قاعدة البيانات ✨' });
      } else {
        setSaveStatus({ type: 'error', message: data.error || 'فشل رفع الصورة، يرجى المحاولة مرة أخرى' });
      }
    } catch (err: any) {
      setSaveStatus({ type: 'error', message: 'خطأ أثناء رفع الصورة: ' + (err?.message || '') });
    } finally {
      setUploadingCardId(null);
    }
  };

  const handleAddDalaa = () => {
    if (!newDalaaWord.trim()) return;
    if (formData.dalaaWords.includes(newDalaaWord.trim())) return;
    setFormData({
      ...formData,
      dalaaWords: [...formData.dalaaWords, newDalaaWord.trim()],
    });
    setNewDalaaWord('');
  };

  const handleRemoveDalaa = (index: number) => {
    const updated = [...formData.dalaaWords];
    updated.splice(index, 1);
    setFormData({ ...formData, dalaaWords: updated });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeStatus(null);

    if (newPassword !== confirmPassword) {
      setPasswordChangeStatus({ type: 'error', message: 'كلمة المرور الجديدة غير متطابقة مع التأكيد' });
      return;
    }

    if (newPassword.length < 4) {
      setPasswordChangeStatus({ type: 'error', message: 'يجب أن تتكون كلمة المرور من 4 أحرف أو أرقام على الأقل' });
      return;
    }

    setIsChangingPassword(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setPasswordChangeStatus({ type: 'success', message: 'تم تحديث كلمة المرور بنجاح! استخدمها للدخول مستقبلاً.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordChangeStatus({ type: 'error', message: data.error || 'فشل تحديث كلمة المرور' });
      }
    } catch {
      setPasswordChangeStatus({ type: 'error', message: 'خطأ في الاتصال بالخادم' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-rose-200 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-rose-50 via-cream-50 to-pink-50 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500 text-white shadow-md">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 font-cairo">
                لوحة التحكم الإدارية
              </h2>
              <span className="text-xs text-rose-600 font-medium">
                التحكم الكامل بمحتوى موقع المفاجأة
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {!isAuthenticated ? (
          /* Login Screen */
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-6 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2 font-cairo">
              تسجيل الدخول للوحة الإدارة
            </h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm">
              هذه المنطقة مخصصة لحبيبها فقط لتعديل كل التفاصيل والرسائل والصور.
            </p>

            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
              {authError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs sm:text-sm font-medium border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label className="block text-right text-xs font-semibold text-gray-600 mb-1.5">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الخاصة بك"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-right outline-none transition-all font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>جارٍ التحقق...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>دخول للوحة التحكم</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Tabs Bar */}
            <div className="flex border-b border-gray-200 px-4 sm:px-6 bg-gray-50/50 overflow-x-auto gap-2 py-2">
              <button
                onClick={() => setActiveTab('texts')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === 'texts'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200/60'
                }`}
              >
                <MessageSquareHeart className="w-4 h-4" />
                <span>الرسائل والنصوص</span>
              </button>

              <button
                onClick={() => setActiveTab('memories')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === 'memories'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200/60'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>الصور والذكريات (4 كروت)</span>
              </button>

              <button
                onClick={() => setActiveTab('dalaa')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === 'dalaa'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200/60'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>كلمات الدلع</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === 'settings'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200/60'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>العد التنازلي والمفاجأة</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === 'security'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200/60'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>كلمة المرور</span>
              </button>
            </div>

            {/* Notification Banner */}
            {saveStatus && (
              <div
                className={`mx-6 mt-4 p-3 rounded-xl border flex items-center gap-2 text-xs sm:text-sm font-semibold transition-all ${
                  saveStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}
              >
                {saveStatus.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                )}
                <span>{saveStatus.message}</span>
              </div>
            )}

            {/* Scrollable Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              
              {/* TAB 1: Texts & Messages */}
              {activeTab === 'texts' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      عبارة واجهة العد التنازلي الترحيبية
                    </label>
                    <input
                      type="text"
                      value={formData.countdownGreeting}
                      onChange={(e) => setFormData({ ...formData, countdownGreeting: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-right font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      عنوان الاحتفال الرئيسي في صفحة المفاجأة
                    </label>
                    <input
                      type="text"
                      value={formData.celebrationTitle}
                      onChange={(e) => setFormData({ ...formData, celebrationTitle: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-right font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      عنوان قسم الرسالة الرئيسية
                    </label>
                    <input
                      type="text"
                      value={formData.mainMessageTitle}
                      onChange={(e) => setFormData({ ...formData, mainMessageTitle: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-right font-medium"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-bold text-gray-700">
                        محتوى الرسالة الرئيسية (&quot;رسالة من حبيبك ❤️&quot;)
                      </label>
                      <span className="text-xs text-rose-500 font-medium">
                        (عدد غير محدود من الكلمات مع حفظ الأسطر والفقرات)
                      </span>
                    </div>
                    <textarea
                      rows={10}
                      value={formData.mainMessage}
                      onChange={(e) => setFormData({ ...formData, mainMessage: e.target.value })}
                      placeholder="اكتب هنا كل ما في قلبك بكل صدق وحب..."
                      className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-right font-amiri text-lg leading-relaxed resize-y"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: Memories & 4 Photo Cards */}
              {activeTab === 'memories' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      عنوان قسم الذكريات
                    </label>
                    <input
                      type="text"
                      value={formData.memoriesTitle}
                      onChange={(e) => setFormData({ ...formData, memoriesTitle: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-right font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {formData.memories.map((card, idx) => (
                      <div
                        key={card.id}
                        className="p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-sm space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-rose-100 pb-2">
                          <span className="font-bold text-rose-700 text-sm">
                            البطاقة رقم {idx + 1}
                          </span>
                          {uploadingCardId === card.id && (
                            <span className="text-xs text-rose-500 flex items-center gap-1 font-semibold animate-pulse">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              جارٍ رفع الصورة...
                            </span>
                          )}
                        </div>

                        {/* Image Preview & Upload */}
                        <div className="space-y-2">
                          <div className="relative w-full h-44 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                            {card.image ? (
                              <img
                                src={card.image}
                                alt={card.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                <ImageIcon className="w-8 h-8 mb-1" />
                                <span className="text-xs">لا توجد صورة</span>
                              </div>
                            )}
                          </div>

                          {/* Native File Upload Button */}
                          <div className="flex items-center gap-2">
                            <label className="flex-1 cursor-pointer py-2 px-3 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 transition-colors text-xs font-bold flex items-center justify-center gap-2 shadow-sm">
                              <Upload className="w-3.5 h-3.5" />
                              <span>رفع صورة من جهازي</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleFileUpload(card.id, file);
                                    e.target.value = '';
                                  }
                                }}
                              />
                            </label>

                            {card.image && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = formData.memories.map((m) =>
                                    m.id === card.id ? { ...m, image: '' } : m
                                  );
                                  setFormData({ ...formData, memories: updated });
                                }}
                                className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="مسح الصورة"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* Direct Image URL input */}
                          <div>
                            <input
                              type="text"
                              value={card.image}
                              placeholder="أو الصق رابط صورة مباشرة هنا (URL)..."
                              onChange={(e) => {
                                const updated = formData.memories.map((m) =>
                                  m.id === card.id ? { ...m, image: e.target.value } : m
                                );
                                setFormData({ ...formData, memories: updated });
                              }}
                              className="w-full px-3 py-1.5 rounded-xl border border-gray-200 focus:border-rose-400 outline-none text-xs text-left dir-ltr font-mono bg-white/70"
                            />
                          </div>
                        </div>

                        {/* Title Input */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            عنوان الصورة
                          </label>
                          <input
                            type="text"
                            value={card.title}
                            onChange={(e) => {
                              const updated = formData.memories.map((m) =>
                                m.id === card.id ? { ...m, title: e.target.value } : m
                              );
                              setFormData({ ...formData, memories: updated });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-rose-500 outline-none text-right text-sm"
                          />
                        </div>

                        {/* Note Input */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            الملاحظة (تظهر في النافذة المنبثقة عند الضغط)
                          </label>
                          <textarea
                            rows={3}
                            value={card.note}
                            onChange={(e) => {
                              const updated = formData.memories.map((m) =>
                                m.id === card.id ? { ...m, note: e.target.value } : m
                              );
                              setFormData({ ...formData, memories: updated });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-rose-500 outline-none text-right text-sm font-amiri leading-relaxed resize-y"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: Dala' Nicknames */}
              {activeTab === 'dalaa' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      عنوان قسم الدلع
                    </label>
                    <input
                      type="text"
                      value={formData.dalaaTitle}
                      onChange={(e) => setFormData({ ...formData, dalaaTitle: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-right font-medium"
                    />
                  </div>

                  {/* Add New Word Input */}
                  <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 flex items-center gap-2">
                    <input
                      type="text"
                      value={newDalaaWord}
                      onChange={(e) => setNewDalaaWord(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddDalaa();
                        }
                      }}
                      placeholder="أضف كلمة دلع جديدة (مثال: وتيني، فراشتي...)"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 focus:border-rose-500 outline-none text-right text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddDalaa}
                      className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة</span>
                    </button>
                  </div>

                  {/* List of current words */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-600 block mb-2">
                      كلمات الدلع الحالية ({formData.dalaaWords.length}):
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {formData.dalaaWords.map((word, index) => (
                        <div
                          key={index}
                          className="px-3.5 py-1.5 rounded-full bg-white border border-rose-200 text-gray-800 text-sm font-semibold flex items-center gap-2 shadow-sm"
                        >
                          <span>{word}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDalaa(index)}
                            className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="حذف"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Surprise & Countdown Settings */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
                    <h4 className="font-bold text-amber-900 text-sm sm:text-base flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                      <span>التحكم في حالة المفاجأة والعد التنازلي</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                      وفقاً للقاعدة، بمجرد فتح صفحة المفاجأة في 31 أكتوبر، تظل مفتوحة دائماً ولا يظهر العد التنازلي مجدداً. يمكنك من هنا اختبار صفحة المفاجأة فوراً أو إعادة قفلها للعد التنازلي.
                    </p>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, isUnlocked: true });
                          setSaveStatus({ type: 'success', message: 'تم فتح صفحة المفاجأة! اضغط "حفظ التغييرات" لتثبيتها في قاعدة البيانات.' });
                        }}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                          formData.isUnlocked
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Eye className="w-4 h-4" />
                        <span>{formData.isUnlocked ? '✓ صفحة المفاجأة مفتوحة حالياً' : 'فتح المفاجأة فوراً (معاينة)'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, isUnlocked: false });
                          setSaveStatus({ type: 'success', message: 'تمت إعادة ضبط الموقع ليظهر العد التنازلي مجدداً! اضغط "حفظ التغييرات".' });
                        }}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                          !formData.isUnlocked
                            ? 'bg-rose-500 text-white shadow-md'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>{!formData.isUnlocked ? '✓ وضع العد التنازلي نشط' : 'إعادة قفل الموقع (إظهار العد التنازلي)'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      توقيت نهاية العد التنازلي (ISO Format)
                    </label>
                    <input
                      type="text"
                      value={formData.targetDate}
                      onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                      placeholder="2026-10-31T00:00:00+02:00"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-rose-500 outline-none text-left font-mono text-sm dir-ltr"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, targetDate: '2026-10-31T00:00:00+02:00' })}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors"
                      >
                        31 أكتوبر 2026 (موعد عيد الميلاد)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const future = new Date(Date.now() + 3 * 3600 * 1000).toISOString();
                          setFormData({ ...formData, targetDate: future });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors"
                      >
                        بعد 3 ساعات (اختبار)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const future = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
                          setFormData({ ...formData, targetDate: future });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors"
                      >
                        بعد 24 ساعة (اختبار)
                      </button>
                    </div>
                    <span className="text-xs text-gray-400 mt-1.5 block">
                      التوقيت الافتراضي هو 31 أكتوبر 2026 منتصف الليل بتوقيت مصر (UTC+2).
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 5: Security & Change Password */}
              {activeTab === 'security' && (
                <div className="max-w-md mx-auto space-y-6">
                  <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 text-center">
                    <KeyRound className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                    <h4 className="font-bold text-gray-800 text-base">تغيير كلمة المرور</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      كلمة المرور الحالية مشفرة بواسطة خوارزمية Bcrypt. يمكنك تغييرها في أي وقت لحماية لوحة التحكم.
                    </p>
                  </div>

                  {passwordChangeStatus && (
                    <div
                      className={`p-3 rounded-xl border flex items-center gap-2 text-xs sm:text-sm font-semibold ${
                        passwordChangeStatus.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-red-50 text-red-800 border-red-200'
                      }`}
                    >
                      {passwordChangeStatus.type === 'success' ? (
                        <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      )}
                      <span>{passwordChangeStatus.message}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        كلمة المرور الحالية
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="كلمة المرور الحالية"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-rose-500 outline-none text-right text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        كلمة المرور الجديدة
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="كلمة المرور الجديدة"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-rose-500 outline-none text-right text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        تأكيد كلمة المرور الجديدة
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="أعد كتابة كلمة المرور الجديدة"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-rose-500 outline-none text-right text-sm"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>جارٍ التحديث والتشفير...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>تحديث كلمة المرور</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Modal Footer / Save Changes Bar */}
            <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-gray-500">
                جميع البيانات يتم حفظها بشكل دائم في قاعدة البيانات وتظهر فوراً للزوار.
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-200/60 font-semibold text-sm transition-all"
                >
                  إلغاء
                </button>

                <button
                  type="button"
                  onClick={handleSaveAll}
                  disabled={isSaving}
                  className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جارٍ الحفظ في قاعدة البيانات...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>حفظ التغييرات</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

