import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Download, Mail, MoreVertical, X } from 'lucide-react';
import api from '../../api/api';
import DEFAULT_PACKAGE, {
  getAnswerKeyTemplateCsv,
  getQuestionsTemplateCsv,
  getMailListTemplateCsv,
} from '../../utils/testPackageStore';
import { usePackageData } from '../../context/PackageContext';

const StatusBadge = ({ status }) => (
  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-teal-800 text-white uppercase tracking-wider">
    {status}
  </span>
);

const SettingsTab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all sm:px-6 ${
      active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
    }`}
  >
    {label}
  </button>
);

const SectionHeader = ({ title, subtitle, actionLabel, onAction, secondaryLabel, secondaryAction }) => (
  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div className="flex min-w-0 flex-col">
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <p className="text-gray-400 text-sm mt-0.5">{subtitle}</p>
    </div>
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
      {secondaryLabel && secondaryAction && (
        <button
          onClick={secondaryAction}
          className="flex w-full items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm border border-[#f59e0b] text-[#f59e0b] bg-white hover:bg-[#fef6eb] sm:w-auto"
        >
          {secondaryLabel}
        </button>
      )}
      <button
        onClick={onAction}
        className="flex w-full items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm bg-[#f59e0b] hover:bg-[#d97706] text-white sm:w-auto"
      >
        {actionLabel}
      </button>
    </div>
  </div>
);

const parseSheetRows = (input) => {
  const lines = input.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  const rows = lines.map((line) => line.split(delimiter).map((cell) => cell.trim()));
  const first = rows[0].map((c) => c.toLowerCase());
  const hasHeader = first.includes('section') || first.includes('question');
  const body = hasHeader ? rows.slice(1) : rows;

  return body
    .map((cols) => ({
      sectionName: cols[0] || 'Section 1',
      question: cols[1] || '',
      questionType: cols[2] || 'likert5',
      dimension: cols[3] || '',
      reverseScored: String(cols[4]).toLowerCase() === 'true',
      correctOption: Number(cols[5]) || null,
      marks: Number(cols[6]) || 1,
      durationMinutes: Number(cols[7]) || null,
    }))
    .filter((r) => r.question);
};

const provideNewPackageForm = () => ({
  name: '',
  price: '',
  priceLabel: '',
  features: '',
  description: '',
  questionPdf: DEFAULT_PACKAGE.questionPdf,
  answerKeyPdf: DEFAULT_PACKAGE.answerKeyPdf,
  sections: [
    {
      id: `section-${Date.now()}`,
      name: 'Section 1',
      durationMinutes: 20,
      questions: [
        {
          text: '',
          questionType: 'likert5',
          dimension: '',
          reverseScored: false,
          correctOption: null,
          marks: 1,
        },
      ],
    },
  ],
  status: 'Draft',
});

const Settings = () => {
  const {
    packages,
    coupons: contextCoupons,
    mailLists,
    activePackage: contextActivePackage,
    refresh,
  } = usePackageData();
  const [activeTab, setActiveTab] = useState('pricing');
  const [coupons, setCoupons] = useState([]);
  const [mailListState, setMailListState] = useState([]);
  const [couponForm, setCouponForm] = useState({ code: '', discount: '', validUntil: '' });
  const [mailListInput, setMailListInput] = useState('');
  const latestMailList = mailListState[0];
  const latestMailListCount = latestMailList?.entries?.length || 0;
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [sheetRowsInput, setSheetRowsInput] = useState('');
  const activePackage = contextActivePackage || DEFAULT_PACKAGE;
  const [packageForm, setPackageForm] = useState(activePackage);
  const [packageModalMode, setPackageModalMode] = useState('edit');
  const [activePackageMenu, setActivePackageMenu] = useState('');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    setCoupons(contextCoupons);
  }, [contextCoupons]);

  useEffect(() => {
    setMailListState(mailLists);
  }, [mailLists]);

  useEffect(() => {
    setPackageForm(activePackage);
  }, [activePackage]);

  const openCreatePackageModal = () => {
    setPackageModalMode('create');
    setPackageForm(provideNewPackageForm());
    setSheetRowsInput('');
    setIsPackageModalOpen(true);
  };

  const openEditPackageModal = (pkg = activePackage) => {
    setActivePackageMenu('');
    setPackageModalMode('edit');
    setPackageForm(pkg);
    setSheetRowsInput('');
    setIsPackageModalOpen(true);
  };

  const closePackageModal = () => setIsPackageModalOpen(false);

  const updatePackageField = (key, value) => {
    setPackageForm((prev) => ({ ...prev, [key]: value }));
  };

  const addSection = () => {
    setPackageForm((prev) => ({
      ...prev,
      sections: [...(prev.sections || []), { id: Date.now(), name: `Section ${(prev.sections || []).length + 1}`, durationMinutes: 20, questions: [{ text: '', questionType: 'likert5', dimension: '', reverseScored: false, correctOption: null, marks: 1 }] }],
    }));
  };

  const removeSection = (sectionId) => {
    setPackageForm((prev) => ({
      ...prev,
      sections: (prev.sections || []).filter((s) => s.id !== sectionId),
    }));
  };

  const updateSection = (sectionId, key, value) => {
    setPackageForm((prev) => ({
      ...prev,
      sections: (prev.sections || []).map((s) => (s.id === sectionId ? { ...s, [key]: value } : s)),
    }));
  };

  const addQuestion = (sectionId) => {
    setPackageForm((prev) => ({
      ...prev,
      sections: (prev.sections || []).map((s) =>
        s.id === sectionId ? { ...s, questions: [...(s.questions || []), { text: '', questionType: 'likert5', dimension: '', reverseScored: false, correctOption: null, marks: 1 }] } : s
      ),
    }));
  };

  const updateQuestion = (sectionId, qIdx, key, value) => {
    setPackageForm((prev) => ({
      ...prev,
      sections: (prev.sections || []).map((s) => {
        if (s.id !== sectionId) return s;
        const next = [...(s.questions || [])];
        const existing = typeof next[qIdx] === 'string'
          ? { text: next[qIdx], questionType: 'likert5', dimension: '', reverseScored: false, correctOption: null, marks: 1 }
          : (next[qIdx] || { text: '', questionType: 'likert5', dimension: '', reverseScored: false, correctOption: null, marks: 1 });
        next[qIdx] = { ...existing, [key]: value };
        return { ...s, questions: next };
      }),
    }));
  };

  const removeQuestion = (sectionId, qIdx) => {
    setPackageForm((prev) => ({
      ...prev,
      sections: (prev.sections || []).map((s) => {
        if (s.id !== sectionId) return s;
        const next = (s.questions || []).filter((_, index) => index !== qIdx);
        return { ...s, questions: next.length ? next : [{ text: '', questionType: 'likert5', dimension: '', reverseScored: false, correctOption: null, marks: 1 }] };
      }),
    }));
  };

  const handleImportFromSheets = () => {
    const rows = parseSheetRows(sheetRowsInput);
    if (rows.length === 0) return;

    setPackageForm((prev) => {
      const sections = [...(prev.sections || [])];
      rows.forEach((row) => {
        const idx = sections.findIndex((s) => s.name.toLowerCase() === row.sectionName.toLowerCase());
        if (idx === -1) {
          sections.push({
            id: Date.now() + Math.random(),
            name: row.sectionName,
            durationMinutes: row.durationMinutes || 20,
            questions: [{
              text: row.question,
              questionType: row.questionType || 'likert5',
              dimension: row.dimension || '',
              reverseScored: !!row.reverseScored,
              correctOption: row.correctOption,
              marks: row.marks || 1,
            }],
          });
        } else {
          const existingQuestions = (sections[idx].questions || []).map((q) =>
            typeof q === 'string' ? { text: q, questionType: 'likert5', dimension: '', reverseScored: false, correctOption: null, marks: 1 } : q
          );
          sections[idx] = {
            ...sections[idx],
            durationMinutes: row.durationMinutes || sections[idx].durationMinutes || 20,
            questions: [...existingQuestions.filter((q) => q.text), {
              text: row.question,
              questionType: row.questionType || 'likert5',
              dimension: row.dimension || '',
              reverseScored: !!row.reverseScored,
              correctOption: row.correctOption,
              marks: row.marks || 1,
            }],
          };
        }
      });
      return { ...prev, sections };
    });
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([getQuestionsTemplateCsv()], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAnswerKeyTemplate = () => {
    const blob = new Blob([getAnswerKeyTemplateCsv()], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'answer_key_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadMailTemplate = () => {
    const blob = new Blob([getMailListTemplateCsv()], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mail_list_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError('Current password and new password are required');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }

    try {
      await api.post('/v1/admin/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMessage('Password updated successfully');
    } catch (err) {
      setPasswordError(err?.response?.data?.msg || 'Failed to update password');
    }
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    const cleanSections = (packageForm.sections || [])
      .map((s) => ({
        ...s,
        name: (s.name || '').trim(),
        questions: (s.questions || [])
          .map((q) => (typeof q === 'string' ? { text: q.trim(), questionType: 'likert5', dimension: '', reverseScored: false, correctOption: null, marks: 1 } : {
            text: (q.text || '').trim(),
            questionType: q.questionType || 'likert5',
            dimension: q.dimension || '',
            reverseScored: !!q.reverseScored,
            correctOption: q.correctOption != null ? Number(q.correctOption) : null,
            marks: q.marks != null ? Number(q.marks) : 1,
          }))
          .filter((q) => q.text),
      }))
      .filter((s) => s.name && s.questions.length);

    if (!packageForm.name?.trim() || !packageForm.price?.trim() || cleanSections.length === 0) return;

    const totalQuestions = cleanSections.reduce((sum, s) => sum + s.questions.length, 0);
    const numericPrice = Number((packageForm.price || "").replace(/[^\d.]/g, "")) || 0;
    const payload = {
      id: packageModalMode === 'edit' ? packageForm._id || packageForm.id : undefined,
      name: packageForm.name.trim(),
      priceLabel: packageForm.price?.trim(),
      price: numericPrice,
      displayPrice: packageForm.price?.trim(),
      features: packageForm.features?.trim() || `${cleanSections.length} sections, ${totalQuestions} questions`,
      description: packageForm.description || '',
      pdfQuestion: packageForm.questionPdf || DEFAULT_PACKAGE.questionPdf,
      answerKeyPdf: packageForm.answerKeyPdf || DEFAULT_PACKAGE.answerKeyPdf,
      sections: cleanSections,
      isActive: packageModalMode === 'edit',
      status: packageModalMode === 'edit' ? 'Active' : 'Draft',
    };

    try {
      await api.post("/v1/admin/packages", payload);
      setIsPackageModalOpen(false);
      setSheetRowsInput('');
      refresh();
    } catch (err) {
      console.error("Failed to save package", err);
    }
  };

  const handleTogglePackageVisibility = async (pkg) => {
    try {
      await api.post("/v1/admin/packages", {
        id: pkg._id || pkg.id,
        name: pkg.name,
        priceLabel: pkg.priceLabel || pkg.displayPrice || pkg.price,
        price: pkg.price,
        displayPrice: pkg.displayPrice || pkg.priceLabel || pkg.price,
        features: pkg.features || '',
        description: pkg.description || '',
        pdfQuestion: pkg.pdfQuestion || DEFAULT_PACKAGE.questionPdf,
        answerKeyPdf: pkg.answerKeyPdf || DEFAULT_PACKAGE.answerKeyPdf,
        sections: pkg.sections || [],
        isActive: !pkg.isActive,
        status: "Active",
      });
      refresh();
    } catch (err) {
      console.error("Failed to update package visibility", err);
    }
  };

  const handleDeletePackage = async (pkg) => {
    if (!pkg?._id && !pkg?.id) return;
    if (pkg?.isDefault) return;

    const confirmed = window.confirm(`Delete package ${pkg.name}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      setActivePackageMenu('');
      await api.delete(`/v1/admin/packages/${pkg._id || pkg.id}`);
      refresh();
    } catch (err) {
      console.error("Failed to delete package", err);
    }
  };

  const resetCouponForm = () => setCouponForm({ code: '', discount: '', validUntil: '' });

  const handleCouponChange = (key, value) => {
    setCouponForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddCoupon = async () => {
    if (!couponForm.code.trim() || !couponForm.discount.trim() || !couponForm.validUntil.trim()) return;
    const code = couponForm.code.trim().toUpperCase();
    const discountValue = Number(couponForm.discount.replace(/[^\d.]/g, "")) || 0;
    if (discountValue <= 0) return;
    const payload = {
      code,
      discountType: couponForm.discount.includes("%") ? "percentage" : "fixed",
      value: discountValue,
      validUntil: couponForm.validUntil,
    };
    try {
      await api.post("/v1/admin/coupons", payload);
      resetCouponForm();
      refresh();
    } catch (err) {
      console.error("Failed to add coupon", err);
    }
  };

  const handleRemoveCoupon = async (id) => {
    try {
      await api.delete(`/v1/admin/coupons/${id}`);
      refresh();
    } catch (err) {
      console.error("Failed to delete coupon", err);
    }
  };

  const handleImportMailList = async () => {
    const lines = mailListInput.split("\n").map((l) => l.trim()).filter(Boolean);
    const entries = lines.map((line) => {
      const [name, email] = line.split(",").map((x) => x.trim());
      return { name: name || email || "Recipient", email };
    }).filter((item) => item.email);
    if (!entries.length) return;
    try {
      await api.post("/v1/admin/mail-lists", { entries });
      setMailListInput("");
      refresh();
    } catch (err) {
      console.error("Failed to upload mail list", err);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto font-['Inter'] animate-in fade-in duration-500 p-6 md:p-8 w-full flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight sm:text-3xl">System Settings</h1>
        <p className="text-gray-400 text-sm font-medium">Configure platform settings and preferences</p>
      </div>

      <div className="flex w-full flex-wrap gap-1.5 rounded-xl bg-[#f1f5f9] p-1.5 md:w-auto md:self-center">
        <SettingsTab label="Pricing" active={activeTab === 'pricing'} onClick={() => setActiveTab('pricing')} />
        <SettingsTab label="Email Templates" active={activeTab === 'emails'} onClick={() => setActiveTab('emails')} />
        <SettingsTab label="Notifications" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
        <SettingsTab label="Account" active={activeTab === 'account'} onClick={() => setActiveTab('account')} />
      </div>

      {activeTab === 'pricing' && (
        <div className="flex flex-col gap-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
            <SectionHeader
              title="Test Packages"
              subtitle="Manage all packages and decide which active ones are visible to users"
              actionLabel="Edit Package"
              onAction={() => openEditPackageModal(activePackage)}
              secondaryLabel="Create Package"
              secondaryAction={openCreatePackageModal}
            />
            <div className="space-y-4 md:hidden">
              {(packages || []).map((pkg) => (
                <div key={pkg._id || pkg.id} className="rounded-2xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="text-base font-bold text-gray-900 break-words">{pkg?.name}</h4>
                      <p className="mt-1 text-sm text-gray-500 break-words">{pkg?.features}</p>
                    </div>
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setActivePackageMenu((current) => (current === (pkg._id || pkg.id) ? '' : (pkg._id || pkg.id)))}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>
                      {activePackageMenu === (pkg._id || pkg.id) && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-10 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => openEditPackageModal(pkg)}
                            className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50"
                          >
                            Edit package
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActivePackageMenu('');
                              handleTogglePackageVisibility(pkg);
                            }}
                            className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50"
                          >
                            {pkg?.isActive ? 'Hide package' : 'Show package'}
                          </button>
                          {!pkg?.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleDeletePackage(pkg)}
                              className="w-full px-4 py-3 text-left text-sm text-rose-600 hover:bg-rose-50"
                            >
                              Delete package
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-gray-50 px-3 py-2">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Price</p>
                      <p className="mt-1 font-extrabold text-gray-900">{pkg?.priceLabel || pkg?.displayPrice || pkg?.price}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 px-3 py-2">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Status</p>
                      <div className="mt-2"><StatusBadge status={pkg?.status || 'Active'} /></div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Visible To Users</p>
                    <button
                      type="button"
                      onClick={() => handleTogglePackageVisibility(pkg)}
                      className={`mt-2 px-3 py-1 rounded-full text-xs font-bold border transition ${
                        pkg?.isActive
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      {pkg?.isActive ? 'Visible' : 'Hidden'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Package Name</th>
                    <th className="py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Features</th>
                    <th className="py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Price</th>
                    <th className="py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                    <th className="py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Visible To Users</th>
                    <th className="py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(packages || []).map((pkg) => (
                    <tr key={pkg._id || pkg.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-6 text-sm font-bold text-gray-900">{pkg?.name}</td>
                      <td className="py-6 text-sm text-gray-500 font-medium">{pkg?.features}</td>
                      <td className="py-6 text-center text-sm font-extrabold text-gray-900">
                        {pkg?.priceLabel || pkg?.displayPrice || pkg?.price}
                      </td>
                      <td className="py-6 text-center"><StatusBadge status={pkg?.status || 'Active'} /></td>
                      <td className="py-6 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePackageVisibility(pkg)}
                          className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                            pkg?.isActive
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-slate-200 bg-white text-slate-600'
                          }`}
                        >
                          {pkg?.isActive ? 'Visible' : 'Hidden'}
                        </button>
                      </td>
                      <td className="py-6 text-right relative">
                        <button
                          type="button"
                          onClick={() => setActivePackageMenu((current) => (current === (pkg._id || pkg.id) ? '' : (pkg._id || pkg.id)))}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <MoreVertical size={18} />
                        </button>
                        {activePackageMenu === (pkg._id || pkg.id) && (
                          <div className="absolute right-6 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-10 overflow-hidden">
                            <button
                              type="button"
                              onClick={() => openEditPackageModal(pkg)}
                              className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50"
                            >
                              Edit package
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActivePackageMenu('');
                                handleTogglePackageVisibility(pkg);
                              }}
                              className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50"
                            >
                              {pkg?.isActive ? 'Hide package' : 'Show package'}
                            </button>
                            {!pkg?.isDefault && (
                              <button
                                type="button"
                                onClick={() => handleDeletePackage(pkg)}
                                className="w-full px-4 py-3 text-left text-sm text-rose-600 hover:bg-rose-50"
                              >
                                Delete package
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Coupon Codes</h3>
                <p className="text-sm text-gray-500">Create codes that customers can apply at checkout.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input value={couponForm.code} onChange={(e) => handleCouponChange('code', e.target.value)} placeholder="Code" className="px-3 py-2 border rounded-lg text-sm border-gray-200 focus:ring-2 focus:ring-teal-100" />
              <input value={couponForm.discount} onChange={(e) => handleCouponChange('discount', e.target.value)} placeholder="Discount (50% or ₹200)" className="px-3 py-2 border rounded-lg text-sm border-gray-200 focus:ring-2 focus:ring-teal-100" />
              <input type="date" value={couponForm.validUntil} onChange={(e) => handleCouponChange('validUntil', e.target.value)} className="px-3 py-2 border rounded-lg text-sm border-gray-200 focus:ring-2 focus:ring-teal-100" />
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={handleAddCoupon} className="px-4 py-2 rounded-xl bg-[#14b8a6] text-white text-sm font-semibold hover:bg-teal-700 transition">Add Coupon</button>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase text-gray-500">Mail list CSV (name,email)</label>
              <textarea
                value={mailListInput}
                onChange={(e) => setMailListInput(e.target.value)}
                rows={3}
                placeholder="John Doe,john@example.com"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-teal-100"
              />
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleImportMailList} className="px-4 py-2 rounded-xl border border-[#14b8a6] text-[#14b8a6] text-sm font-semibold hover:bg-teal-50">Upload Mail List</button>
                <span className="text-xs text-gray-500">
                  {latestMailListCount} email(s) ready · {latestMailList?.label || "Latest upload"}
                </span>
                <button type="button" onClick={handleDownloadMailTemplate} className="px-3 py-1 rounded-lg border border-[#14b8a6] text-[#14b8a6] text-xs font-semibold hover:bg-teal-50">Download Mail Template</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Code</th>
                    <th className="py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Discount</th>
                    <th className="py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Valid Until</th>
                    <th className="py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <span className="bg-teal-50 text-[#14b8a6] px-3 py-1 rounded-md text-xs font-extrabold tracking-wider border border-teal-100 uppercase">{coupon.code}</span>
                          <button
                            type="button"
                            onClick={async () => {
                              if (navigator.clipboard) {
                                await navigator.clipboard.writeText(coupon.code);
                              }
                            }}
                            className="text-xs font-semibold text-[#0B908E] hover:text-[#0F766E]"
                          >
                            Copy
                          </button>
                        </div>
                      </td>
                      <td className="py-4 text-center text-sm font-extrabold text-gray-900">{coupon.discount}</td>
                      <td className="py-4 text-center text-sm font-medium text-gray-500">{coupon.validUntil}</td>
                      <td className="py-4 text-right">
                        <button type="button" onClick={() => handleRemoveCoupon(coupon.id)} className="text-xs font-semibold text-rose-500 hover:text-rose-700">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'emails' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center gap-4">
          <div className="p-4 bg-gray-50 rounded-full text-gray-300"><Mail size={40} /></div>
          <h3 className="text-xl font-bold text-gray-900">Email Templates Management</h3>
          <p className="text-gray-400 max-w-md">Configure automated emails sent to users after test completions, registrations, and payment successes.</p>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center gap-4">
          <div className="p-4 bg-gray-50 rounded-full text-gray-300"><Bell size={40} /></div>
          <h3 className="text-xl font-bold text-gray-900">Push & In-App Notifications</h3>
          <p className="text-gray-400 max-w-md">Set rules for triggers that notify administrators and users about critical events on the platform.</p>
        </div>
      )}

      {activeTab === 'account' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl">
          <h3 className="text-xl font-bold text-gray-900">Service Password</h3>
          <p className="text-gray-400 text-sm mt-1">Change the password used to access the service dashboard.</p>

          <form className="space-y-4 mt-6" onSubmit={handlePasswordChange}>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
              placeholder="Current password"
              className="w-full px-4 py-3 border rounded-xl text-sm border-gray-200 focus:ring-2 focus:ring-teal-100"
            />
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              placeholder="New password"
              className="w-full px-4 py-3 border rounded-xl text-sm border-gray-200 focus:ring-2 focus:ring-teal-100"
            />
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Confirm new password"
              className="w-full px-4 py-3 border rounded-xl text-sm border-gray-200 focus:ring-2 focus:ring-teal-100"
            />
            {passwordError && <p className="text-sm text-rose-500">{passwordError}</p>}
            {passwordMessage && <p className="text-sm text-emerald-600">{passwordMessage}</p>}
            <button type="submit" className="px-5 py-3 rounded-xl bg-[#14b8a6] text-white text-sm font-semibold hover:bg-teal-700 transition">
              Change Password
            </button>
          </form>
        </div>
      )}

      {isPackageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-6 relative">
            <button
              type="button"
              onClick={closePackageModal}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
            >
              <X size={18} />
            </button>
            <h3 className="text-xl font-bold text-gray-900">{packageModalMode === 'edit' ? 'Edit Package' : 'Create Package'}</h3>
            <p className="text-sm text-gray-400 mt-1">Upload section questions from Google Sheets and control whether the package is visible to users.</p>

            <form className="mt-6 space-y-5" onSubmit={handleSavePackage}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Package Name</label>
                  <input value={packageForm.name || ''} onChange={(e) => updatePackageField('name', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-teal-100" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price</label>
                  <input value={packageForm.price || ''} onChange={(e) => updatePackageField('price', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-teal-100" />
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-bold text-gray-800">Google Sheets Import</h4>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={handleDownloadTemplate} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#14b8a6] text-[#14b8a6] text-xs font-semibold hover:bg-teal-50"><Download size={14} /> Questions Template</button>
                    <button type="button" onClick={handleDownloadAnswerKeyTemplate} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#14b8a6] text-[#14b8a6] text-xs font-semibold hover:bg-teal-50"><Download size={14} /> Answer Key Template</button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Columns: `section`, `question`, `questionType`, `dimension`, `reverseScored`, `correctOption`, `marks`, `durationMinutes(optional)`</p>
                <textarea value={sheetRowsInput} onChange={(e) => setSheetRowsInput(e.target.value)} rows={4} className="mt-3 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-teal-100" placeholder={'Section 1\tI am outgoing\tlikert5\tExtraversion\tfalse\t\t1\t25\nSection 1\tI keep options open\tlikert5\tConscientiousness\ttrue\t\t1\t25\nSection 1\tI start conversations easily\thspq_abc\tWarmth\tfalse\t\t1\t25'} />
                <button type="button" onClick={handleImportFromSheets} className="mt-3 px-4 py-2 rounded-lg border border-[#14b8a6] text-[#14b8a6] text-sm font-semibold hover:bg-teal-50">Import Rows</button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-800">Sections & Questions</h4>
                  <button type="button" onClick={addSection} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#f59e0b] text-white hover:bg-[#d97706]">+ Add Section</button>
                </div>

                {(packageForm.sections || []).map((section) => (
                  <div key={section.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Section Name</label>
                        <input value={section.name || ''} onChange={(e) => updateSection(section.id, 'name', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-teal-100" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Duration (min)</label>
                        <input type="number" min="1" value={section.durationMinutes || 20} onChange={(e) => updateSection(section.id, 'durationMinutes', Number(e.target.value) || 20)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-teal-100" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      {(section.questions || []).map((q, qIdx) => {
                        const question = typeof q === 'string' ? { text: q, questionType: 'likert5', dimension: '', reverseScored: false, correctOption: null, marks: 1 } : q;
                        return (
                        <div key={`${section.id}-${qIdx}`} className="grid grid-cols-1 md:grid-cols-6 gap-2">
                          <input value={question.text || ''} onChange={(e) => updateQuestion(section.id, qIdx, 'text', e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-teal-100" placeholder={`Question ${qIdx + 1}`} />
                          <select value={question.questionType || 'likert5'} onChange={(e) => updateQuestion(section.id, qIdx, 'questionType', e.target.value)} className="px-2 py-2 rounded-lg border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-teal-100">
                            <option value="likert5">Likert 1-5</option>
                            <option value="hspq_abc">HSPQ A/B/C</option>
                            <option value="objective">Objective (Answer Key)</option>
                          </select>
                          <input value={question.dimension || ''} onChange={(e) => updateQuestion(section.id, qIdx, 'dimension', e.target.value)} className="px-2 py-2 rounded-lg border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-teal-100" placeholder="Dimension" />
                          <label className="inline-flex items-center gap-2 px-2 py-2 rounded-lg border border-gray-200 text-xs">
                            <input type="checkbox" checked={!!question.reverseScored} onChange={(e) => updateQuestion(section.id, qIdx, 'reverseScored', e.target.checked)} />
                            Reverse
                          </label>
                          <input type="number" min="1" max="5" value={question.correctOption ?? ''} onChange={(e) => updateQuestion(section.id, qIdx, 'correctOption', e.target.value ? Number(e.target.value) : null)} className="w-20 px-2 py-2 rounded-lg border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-teal-100" placeholder="Ans" />
                          <input type="number" min="1" value={question.marks ?? 1} onChange={(e) => updateQuestion(section.id, qIdx, 'marks', Number(e.target.value) || 1)} className="w-20 px-2 py-2 rounded-lg border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-teal-100" placeholder="Marks" />
                          <button type="button" onClick={() => removeQuestion(section.id, qIdx)} className="px-2.5 py-2 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">Remove</button>
                        </div>
                      )})}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <button type="button" onClick={() => addQuestion(section.id)} className="px-3 py-1.5 rounded-lg border border-[#14b8a6] text-[#14b8a6] text-xs font-semibold hover:bg-teal-50">+ Add Question</button>
                      <button type="button" onClick={() => removeSection(section.id)} className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50" disabled={(packageForm.sections || []).length <= 1}>Remove Section</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={closePackageModal} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#f59e0b] text-white text-sm font-semibold hover:bg-[#d97706]">Save Package</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
