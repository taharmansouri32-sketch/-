/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Search, 
  FileText, 
  Calendar, 
  Clock, 
  Info, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  FileDown,
  Printer,
  Copy,
  Check
} from "lucide-react";
import { CandidateApplication, ApplicationStatus } from "../types";
import { MASTER_PROGRAMS, LICENCE_SPECIALTIES, UNIVERSITIES, L3_SPECIALTIES } from "../data/programs";
import { translations, LangType } from "../data/translations";

interface StatusTrackerProps {
  applications: CandidateApplication[];
  onSelectedApplicationForReceipt: (app: CandidateApplication) => void;
  lang: LangType;
  isSiteAdmin?: boolean;
}

export default function StatusTracker({ 
  applications, 
  onSelectedApplicationForReceipt,
  lang,
  isSiteAdmin = false
}: StatusTrackerProps) {
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<"master" | "l3_specialty">("master");
  const [queryString, setQueryString] = useState("");
  const [searched, setSearched] = useState(false);
  const [matchedApp, setMatchedApp] = useState<CandidateApplication | null>(null);
  const [errorMess, setErrorMess] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // States for Admitted List Preview & Export Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProgId, setSelectedProgId] = useState<string | null>(null);
  const [selectedProgName, setSelectedProgName] = useState<string | null>(null);
  const [selectedProgType, setSelectedProgType] = useState<"master" | "l3_specialty" | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMess(null);
    setMatchedApp(null);
    setSearched(true);

    const term = queryString.trim().toUpperCase();

    if (!term) {
      setErrorMess(lang === "ar" ? "يرجى كتابة رقم بطاقة الطالب أو رقم التسجيل للبحث" : "Please enter a valid student card number or application registration ID.");
      return;
    }

    // Attempt to match against Registration ID or National student ID (BAC / Student Card)
    const found = applications.find(app => {
      const gMatch = app.id.toUpperCase() === term || app.nationalStudentId.toUpperCase() === term;
      if (!gMatch) return false;
      return app.applicationType === activeTab;
    });

    if (found) {
      setMatchedApp(found);
    } else {
      setErrorMess(lang === "ar" 
        ? "عذراً، لم يتم العثور على أي ملف ترشح مسجل بالرقم المدخل ضمن الطور المحدد. يرجى التأكد من الرقم والطور والمحاولة مجدداً." 
        : lang === "fr"
        ? "Désolé, aucun dossier de candidature n'a été trouvé avec ce numéro pour cette phase. Veuillez vérifier et réessayer."
        : "Sorry, no application dossier matches the provided ID under the selected phase. Please double check and try again.");
    }
  };

  // Helper date formatter
  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    if (lang === "ar") {
      return d.toLocaleDateString("ar-DZ");
    }
    return d.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US");
  };

  const getStatusBadgeClass = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.ACCEPTED:
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case ApplicationStatus.REJECTED:
        return "bg-rose-100 text-rose-800 border-rose-200";
      case ApplicationStatus.PENDING:
      default:
        return "bg-amber-100 text-amber-800 border-amber-200 font-medium animate-pulse";
    }
  };

  const getStatusText = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.ACCEPTED:
        return lang === "ar" ? "مقبول بصفة مؤقتة" : lang === "fr" ? "Admis Provisoirement" : "Provisionally Accepted";
      case ApplicationStatus.REJECTED:
        return lang === "ar" ? "مرفوض بيداغوجياً" : lang === "fr" ? "Refusé" : "Rejected Scholastically";
      case ApplicationStatus.PENDING:
      default:
        return lang === "ar" ? "قيد الدراسة والفرز" : lang === "fr" ? "En cours d'examen" : "Under Pedagogical Review";
    }
  };

  // Helper strings localization
  const getProgName = (pId: string | undefined, type?: "master" | "l3_specialty") => {
    if (!pId) return "";
    if (type === "l3_specialty") {
      const spec = L3_SPECIALTIES.find(s => s.id === pId);
      if (spec) {
        if (lang === "ar") return spec.nameAr;
        if (lang === "en") return spec.nameEn;
        return spec.nameFr || spec.nameEn;
      }
    }
    const p = MASTER_PROGRAMS.find(prog => prog.id === pId);
    if (p) {
      if (lang === "ar") return p.nameAr;
      if (lang === "en") return p.nameEn;
      return p.nameFr || p.nameEn;
    }
    // Fallback search L3 Specialty
    const spec = L3_SPECIALTIES.find(s => s.id === pId);
    if (spec) {
      if (lang === "ar") return spec.nameAr;
      if (lang === "en") return spec.nameEn;
      return spec.nameFr || spec.nameEn;
    }
    return pId;
  };

  const getProgFaculty = (pId: string | undefined, type?: "master" | "l3_specialty") => {
    if (!pId) return "";
    if (type === "l3_specialty") {
      return lang === "ar" 
        ? "كلية التكنولوجيا - قسم الهندسة الميكانيكية" 
        : lang === "fr"
        ? "Faculté de Technologie - Département de Génie Méc."
        : "Faculty of Technology - Department of Mechanical Eng.";
    }
    const p = MASTER_PROGRAMS.find(prog => prog.id === pId);
    if (!p) {
      const isL3Spec = L3_SPECIALTIES.some(s => s.id === pId);
      if (isL3Spec) {
        return lang === "ar" 
          ? "كلية التكنولوجيا - قسم الهندسة الميكانيكية" 
          : lang === "fr"
          ? "Faculté de Technologie - Département de Génie Méc."
          : "Faculty of Technology - Department of Mechanical Eng.";
      }
      return "";
    }
    if (lang === "ar") return p.facultyAr;
    if (lang === "en") return p.facultyEn;
    return p.facultyFr || p.facultyEn;
  };

  const getSpecName = (sId: string) => {
    const spec = LICENCE_SPECIALTIES.find(s => s.id === sId);
    if (!spec) return sId;
    if (lang === "ar") return spec.nameAr;
    if (lang === "en") return spec.nameEn;
    return spec.nameFr || spec.nameEn;
  };

  const handleCopyModalTable = (admittedList: CandidateApplication[]) => {
    const headers = [
      lang === "ar" ? "رقم المترشح" : "Registration ID",
      lang === "ar" ? "رقم الطالب الوطني" : "National ID",
      lang === "ar" ? "الاسم" : "First Name",
      lang === "ar" ? "اللقب" : "Last Name",
      lang === "ar" ? "شعبة الليسانس السابقة" : "Previous Specialty",
      lang === "ar" ? "معدل الترتيب البيداغوجي" : "GPA Score"
    ];
    
    const rows = admittedList.map(app => {
      const prevSpec = LICENCE_SPECIALTIES.find(s => s.id === app.licenceSpecialty);
      const prevSpecName = app.applicationType === "l3_specialty" ? "السنة الثانية ليسانس L2" : (prevSpec?.nameAr || app.licenceSpecialty);
      const studentFirstName = lang === "ar" ? app.firstNameAr : app.firstNameEn;
      const studentLastName = lang === "ar" ? app.lastNameAr : app.lastNameEn;
      return [
        app.id,
        app.nationalStudentId,
        studentFirstName,
        studentLastName,
        prevSpecName,
        app.licenceGpa ? app.licenceGpa.toFixed(2) : ""
      ];
    });

    const textToCopy = [headers.join("\t"), ...rows.map(r => r.join("\t"))].join("\n");
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error("Clipboard copy failed: ", err);
      });
  };

  const triggerRawCSVDownload = (programId: string, programName: string, admittedList: CandidateApplication[]) => {
    const csvHeaders = [
      lang === "ar" ? "رقم المترشح" : "Registration ID",
      lang === "ar" ? "رقم البكالوريا/الطالب" : "Student National ID",
      lang === "ar" ? "الاسم" : "First Name",
      lang === "ar" ? "اللقب" : "Last Name",
      lang === "ar" ? "البريد الإلكتروني" : "Email Address",
      lang === "ar" ? "رقم الهاتف" : "Phone Number",
      lang === "ar" ? "الطور الدراسي" : "Level",
      lang === "ar" ? "تخصص ليسانس السابق" : "Previous Licence Specialty",
      lang === "ar" ? "المعدل الترتيبي" : "GPA Score",
      lang === "ar" ? "التخصص المقبول فيه بصفة مؤقتة" : "Provisionally Assigned Specialty",
      lang === "ar" ? "السنة الدراسية" : "Academic Year"
    ];

    const csvRows = admittedList.map(app => {
      const prevSpec = LICENCE_SPECIALTIES.find(s => s.id === app.licenceSpecialty);
      const prevSpecName = app.applicationType === "l3_specialty" ? "السنة الثانية ليسانس L2" : (prevSpec?.nameAr || app.licenceSpecialty);
      const levelLabel = app.applicationType === "l3_specialty" ? "السنة الثالثة ليسانس L3" : "السنة الأولى ماستر M1";
      const studentFirstName = lang === "ar" ? app.firstNameAr : app.firstNameEn;
      const studentLastName = lang === "ar" ? app.lastNameAr : app.lastNameEn;
      const currentYear = "2025/2026";

      return [
        app.id,
        app.nationalStudentId,
        studentFirstName,
        studentLastName,
        app.email,
        app.phone,
        levelLabel,
        prevSpecName,
        app.licenceGpa ? app.licenceGpa.toFixed(2) : "",
        programName,
        currentYear
      ].map(val => {
        const escaped = String(val ?? "").replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(",");
    });

    const csvContent = "\uFEFF" + [csvHeaders.join(","), ...csvRows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `liste_admis_${programId.toLowerCase()}_2025-2026.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportToExcel = (programId: string, programName: string, type: "master" | "l3_specialty") => {
    setSelectedProgId(programId);
    setSelectedProgName(programName);
    setSelectedProgType(type);
    setModalOpen(true);
  };

  return (
    <div className="bg-slate-50 py-10 px-4 min-fluid" id="status-tracker-section">
      <div className="max-w-3xl mx-auto">
        
        {/* Search header inquiry panel */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-md">
          <div className="text-center space-y-2 mb-6">
            <h3 className="text-lg sm:text-xl font-extrabold text-[#11235a]">
              {lang === "ar" 
                ? "البحث والاستعلام عن ملفات الترشح (ماستر / طور أول ليسانس)" 
                : lang === "fr"
                ? "Suivi & Recherche de Dossier (Master / L3)" 
                : "Application Status Lookup (Master / L3 Specialty)"}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {lang === "ar" 
                ? "أدخل رقم بطاقة الطالب" 
                : "Enter candidate card ID / registration number."}
            </p>
          </div>

          {/* Segment Selector tabs */}
          <div className="flex justify-center mb-6" id="search-track-tabs">
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200/60 inline-flex gap-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("master");
                  setErrorMess(null);
                  setMatchedApp(null);
                  setSearched(false);
                }}
                className={`px-4 py-2 rounded-lg font-bold text-xs cursor-pointer transition-all duration-150 ${
                  activeTab === "master"
                    ? "bg-[#11235a] text-white shadow-xs"
                    : "text-slate-500 hover:text-[#11235a]"
                }`}
                id="search-tab-master"
              >
                {lang === "ar" ? "طور الماستر (M1)" : lang === "fr" ? "Master (M1)" : "Master (M1)"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("l3_specialty");
                  setErrorMess(null);
                  setMatchedApp(null);
                  setSearched(false);
                }}
                className={`px-4 py-2 rounded-lg font-bold text-xs cursor-pointer transition-all duration-150 ${
                  activeTab === "l3_specialty"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-emerald-650"
                }`}
                id="search-tab-l3"
              >
                {lang === "ar" ? "طور أول ليسانس (L3)" : lang === "fr" ? "Licence (L3)" : "Licence (L3)"}
              </button>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <input
                type="text"
                value={queryString}
                onChange={(e) => setQueryString(e.target.value)}
                placeholder={
                  activeTab === "master"
                    ? (lang === "ar" ? "مثال رقم بطاقة طالب" : "e.g. Student Card ID")
                    : activeTab === "l3_specialty"
                    ? (lang === "ar" ? "مثال رقم بطاقة طالب" : "e.g. Student Card ID")
                    : (lang === "ar" ? "مثال رقم بطاقة طالب..." : "Enter Student Card ID...")
                }
                className="w-full text-sm px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#11235a] focus:outline-none font-sans tracking-wide text-center"
                id="search-status-input"
              />
              <Search className={`w-5 h-5 text-slate-400 absolute top-3.5 ${lang === 'ar' ? 'right-3' : 'right-3'}`} />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#11235a] hover:bg-[#16307e] text-white font-bold rounded-xl text-sm transition-all duration-150 cursor-pointer shadow-sm flex items-center justify-center gap-2 shrink-0"
              id="search-status-submit"
            >
              <span>{lang === "ar" ? "استعلام ومطابقة" : "Inquire & Match"}</span>
            </button>
          </form>

          {errorMess && (
            <div className="mt-4 p-4 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold leading-relaxed flex items-center gap-2 text-start">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{errorMess}</span>
            </div>
          )}
        </div>

        {/* Search results detail section */}
        {searched && matchedApp && (
          <div className="mt-8 bg-white rounded-2xl border border-slate-200/85 shadow-lg overflow-hidden animate-fade-in" id="app-status-result-card">
            
            {/* Header with Applicant overview */}
            <div className="bg-gradient-to-br from-[#121f42] to-slate-900 p-6 text-white border-b-4 border-official-emerald text-start">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] bg-amber-400 text-slate-900 font-mono font-bold px-2 py-0.5 rounded-full select-all">
                    {lang === "ar" ? "رقم الملف:" : "Application ID:"} {matchedApp.id}
                  </span>
                  <h4 className="text-lg sm:text-xl font-bold mt-2 font-sans text-white">
                    {matchedApp.firstNameAr} {matchedApp.lastNameAr}
                  </h4>
                  <p className="text-xs text-slate-300 font-sans">{matchedApp.firstNameEn} {matchedApp.lastNameEn}</p>
                </div>

                <div className={`text-xs px-3 py-1.5 rounded-lg border font-bold ${getStatusBadgeClass(matchedApp.status)}`}>
                  {getStatusText(matchedApp.status)}
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6 text-start">
              
              {/* Tracker visual Stepper progress bar */}
              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                  {lang === "ar" ? "الخط الزمني للملف الإلكتروني" : "Application Progress Timeline"}
                </h5>
                
                <div className="relative">
                  <div className={`absolute top-0 bottom-0 w-[2px] bg-slate-100 z-0 ${lang === 'ar' ? 'right-4.5' : 'left-4.5'}`}></div>

                  <div className="space-y-6 relative z-10">
                    
                    {/* Step 1: Received */}
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-500 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-emerald-650" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {lang === "ar" ? "إيداع الملف بنجاح وتوليد الوصل الرقمي" : "Dossier Submitted Successfully"}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {lang === "ar" 
                            ? `تم تسجيل معلومات الترشح بالمنصة الوطنية يوم ${formatDate(matchedApp.createdAt)}` 
                            : `Registered on the academic cloud portal on ${formatDate(matchedApp.createdAt)}`}
                        </p>
                      </div>
                    </div>

                    {/* Step 2: Under Review */}
                    <div className="flex items-start gap-4">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${
                        matchedApp.status === ApplicationStatus.PENDING 
                          ? "bg-amber-100 border-amber-400 text-amber-700 animate-pulse" 
                          : "bg-emerald-100 border-emerald-500 text-emerald-700"
                      }`}>
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {lang === "ar" ? "الدراسة والتدقيق العلمي والترتيب البيداغوجي" : "In-Depth Scientific Review"}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {matchedApp.status === ApplicationStatus.PENDING 
                            ? (lang === "ar" ? "الملف قيد المذاكرة والمقايسة من جهة رؤساء اللجان البيداغوجية للأقسام." : "The committee is currently evaluating GPAs, capacities, and license major matching coefficients.") 
                            : (lang === "ar" ? "تمت دراسة الملف ومطابقته علمياً بالكامل." : "Completed scientific transcript review.")}
                        </p>
                      </div>
                    </div>

                    {/* Step 3: Result */}
                    <div className="flex items-start gap-4">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${
                        matchedApp.status === ApplicationStatus.PENDING 
                          ? "bg-slate-100 border-slate-200 text-slate-400" 
                          : matchedApp.status === ApplicationStatus.ACCEPTED 
                            ? "bg-emerald-100 border-emerald-500 text-emerald-600" 
                            : "bg-rose-100 border-rose-400 text-rose-600"
                      }`}>
                        {matchedApp.status === ApplicationStatus.PENDING ? (
                          <Info className="w-5 h-5" />
                        ) : matchedApp.status === ApplicationStatus.ACCEPTED ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {lang === "ar" ? "صدور القرار النهائي للترشيح" : "Orientation Decision Issued"}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {matchedApp.status === ApplicationStatus.PENDING 
                            ? (lang === "ar" ? "يصدر القرار فور اكتمال أعمال لجان الانتقاء التابعة للأقسام." : "Output verdict will be declared once merit sorting completes.") 
                            : matchedApp.status === ApplicationStatus.ACCEPTED 
                              ? (lang === "ar" ? "تم القبول المبدئي في التخصص بنجاح" : "Decision rendered: Provisionally admitted") 
                              : (lang === "ar" ? "تم إرسال قرار اللجنة البيداغوجية بالرفض" : "Decision rendered: Scholastically Rejected")}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Specific Outcomes Alert details */}
              <div className="pt-2">
                {matchedApp.status === ApplicationStatus.ACCEPTED && (
                  <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-full text-emerald-700">
                        <CheckCircle2 className="w-6 h-6 border-emerald-400 text-emerald-600" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-emerald-950 text-base">
                          {lang === "ar" 
                            ? (matchedApp.applicationType === "l3_specialty" ? "تهانينا الحارة! تم قبول توجيهكم للتخصص بنجاح" : "تهانينا الحارة! تم قبولكم في الماستر")
                            : (matchedApp.applicationType === "l3_specialty" ? "Congratulations! Assigned to L3 Specialty" : "Congratulations! Admitted to Second Cycle Master studies")}
                        </h5>
                        <p className="text-xs text-emerald-850">
                          {lang === "ar" 
                            ? (matchedApp.applicationType === "l3_specialty" ? "تلقى رغبتكم وملفكم موافقة وإقراراً بالتوجيه البيداغوجي المعتمد." : "تلقى ملفكم الأكاديمي موافقة رسمية مقترنة بمعامل المطابقة الاستحقاقية.") 
                            : (matchedApp.applicationType === "l3_specialty" ? "Your application was processed and matched to an L3 specialty based on GPA merit." : "Your dossier was scientifically selected and matched to your preference based on academic ranking.")}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-emerald-100 space-y-2 shadow-sm">
                      <p className="text-xs text-slate-400">
                        {lang === "ar" 
                          ? (matchedApp.applicationType === "l3_specialty" ? "التخصص الموجه إليه (طور ليسانس L3):" : "التخصص المقبول فيه:") 
                          : "Admitted/Assigned Specialty:"}
                      </p>
                      <p className="text-sm font-extrabold text-slate-800">
                        {getProgName(matchedApp.acceptedProgramId, matchedApp.applicationType)}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100 mt-2">
                        <span>{lang === "ar" ? "الرغبة المستجابة:" : "Choice Rank Matched:"} <span className="font-bold text-emerald-750">#{(matchedApp.acceptedChoiceIndex ?? 0) + 1}</span></span>
                        <span>•</span>
                        <span>{lang === "ar" ? "القسم والمسار:" : "Department & Path:"} <span>{getProgFaculty(matchedApp.acceptedProgramId, matchedApp.applicationType)}</span></span>
                      </div>
                    </div>

                    <div className="p-3 bg-white text-xs border border-amber-200 text-amber-900 rounded-xl flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        {lang === "ar" ? (
                          <span><strong>خطوات هامة لإتمام التسجيل:</strong> يرجى تحميل واستخراج وصل الترشح المعتمد أدناه، والتقدم إلى مكتب شؤون الطلبة بالكلية المعنية لتسليم الملف الأصلي الورقي وإتمام التسجيل النهائي خلال أجل لا يتعدى 5 أيام.</span>
                        ) : (
                          <span><strong>Registration Notice:</strong> Please download and print the official candidacy receipt below, and report to the designated Faculty’s student services office within 5 business days to hand in original credentials.</span>
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectedApplicationForReceipt(matchedApp!)}
                      className="w-full sm:w-auto px-6 py-3 bg-official-emerald hover:bg-emerald-650 text-white font-bold rounded-xl text-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <Printer className="w-4 h-4" />
                      <span>{lang === "ar" ? "عرض واستخراج وصل التسجيل الرسمي المعتمد" : "View & Download Official Admission Receipt"}</span>
                    </button>
                  </div>
                )}

                {matchedApp.status === ApplicationStatus.REJECTED && (
                  <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-100 rounded-full text-rose-700">
                        <XCircle className="w-6 h-6 text-rose-600" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-rose-950 text-base">
                          {lang === "ar" 
                            ? (matchedApp.applicationType === "l3_specialty" ? "تنبيه: تعذر إتمام التوجيه للشعب المطلوبة" : "تنبيه: تعذر قبول الملف البيداغوجي")
                            : "Application Scholastically Rejected"}
                        </h5>
                        <p className="text-xs text-rose-800">
                          {lang === "ar" ? "نأسف لإعلامكم بأن اللجنة البيداغوجية للقسم لم توافق على طلبكم الفني الحالي." : "We regret to inform you that the scientific committee found you ineligible for admission during current cycles."}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-rose-100 shadow-sm">
                      <span className="text-xs text-slate-400 block mb-1">{lang === "ar" ? "سبب تعذر القبول بيداغوجياً:" : "Ineligibility Justification Reason:"}</span>
                      <p className="text-xs font-bold text-rose-900 leading-relaxed font-sans block bg-rose-50/50 p-3 rounded border border-rose-100">
                        {matchedApp.rejectionReason || (
                          lang === "ar" 
                            ? (matchedApp.applicationType === "l3_specialty" ? "عدم استيفاء أحد الشروط البيداغوجية لتخصصات الليسانس الأربع المرغوبة لامتلاء المقاعد المتاحة." : "عدم استيفاء أحد الشروط البيداغوجية لتخصصات الماستر الأربع المرغوبة.") 
                            : "Mismatch of minimal recommended GPA or background major requirements."
                        )}
                      </p>
                    </div>

                    <div className="p-3 bg-white text-xs border border-slate-200 text-slate-600 rounded-lg flex items-start gap-2 leading-relaxed">
                      <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <p>
                        {lang === "ar" 
                          ? "يمكنكم تقديم طعن رسمي للعمادة لمراجعة معامل المواءمة خلال 48 ساعة من صدور القرار المعتمد." 
                          : "You may submit an official appeal request to the Dean of High Studies within 48 hours for immediate review."}
                      </p>
                    </div>
                  </div>
                )}

                {matchedApp.status === ApplicationStatus.PENDING && (
                  <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-bold text-amber-950 text-sm">
                          {lang === "ar" 
                            ? (matchedApp.applicationType === "l3_specialty" ? "الملف قيد المذاكرة للتوجيه في السنة الثالثة بالقسم" : "الملف قيد المذاكرة والترتيب العلمي بالقسم")
                            : "Pedagogical assessment active"}
                        </h5>
                        <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                          {lang === "ar" 
                            ? (matchedApp.applicationType === "l3_specialty" ? "تم استلام وثائقك الأكاديمية بنجاح. حالياً، يقوم رؤساء المسارات بالتحقق البيداغوجي لترتيبك الاستحقاقي وتأكيد السعات الاستيعابية المتاحة لكل رغبة للطلب الأول." : "تم استلام وثائقك الأكاديمية بنجاح. حالياً، يقوم الفريق الإداري بالتحقق البيداغوجي لنسبة مطابقة شهادة ليسانس وتأكيد السعات الاستيعابية المتاحة لكل رغبة.")
                            : "Your credentials have been loaded onto the college cloud. Administrators are actively sorting applications using GPAs, capacities and license-bachelor specialty match factors."}
                        </p>
                        <p className="text-xs text-slate-400 mt-2 font-mono">
                          {lang === "ar" ? "يرجى معاينة حالة القبول بالتخصصات بانتظام." : "Please revisit this dashboard regularly to inspect decisions."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Public Accepted Students Lists Download Directory */}
        {isSiteAdmin && (
          <div className="mt-8 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-md space-y-6 animate-fade-in" id="public-results-directory">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-150 text-start">
              <div className="flex items-start gap-2.5">
                <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-700 border border-emerald-105">
                  <FileDown className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-[#11235a]">
                    {lang === "ar" ? "🔑 القوائم والمحاضر الرسمية للطلاب المقبولين والموجهين" : "🔑 Official Lists of Admitted & Assigned Candidates"}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed">
                    {lang === "ar" 
                      ? "تحميل محاضر التوجيه للطلاب المقبولين بصفة مؤقتة في صيغة Excel (شاملة المعدلات الترتيبية وترتيب الاستحقاق) لجميع الشعب والمسارات المتاحة بحلبة جامعة عمار ثليجي بالأغواط." 
                      : "Download standard Excel files containing the full, provisionally admitted candidate registers, index rankings and GPA scores."}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="public-reports-columns">
              {/* Master lists column */}
              <div className="space-y-3.5" id="master-reports-container">
                <h5 className="text-[10px] font-extrabold text-[#ca4a24] uppercase tracking-wider block bg-rose-50/50 px-3 py-1.5 rounded-lg border border-rose-100/60 text-start">
                  🎓 {lang === "ar" ? "قوائم مسارات الماستر (M1):" : "Master Stream Lists:"}
                </h5>
                <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                  {MASTER_PROGRAMS.map((p) => {
                    const admittedCount = applications.filter(app => app.status === ApplicationStatus.ACCEPTED && app.acceptedProgramId === p.id).length;
                    return (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200/55 hover:bg-slate-100/30 transition-all text-xs text-start">
                        <div className="min-w-0 pr-2">
                          <span className="font-extrabold text-slate-700 block truncate text-xs" title={lang === "ar" ? p.nameAr : p.nameEn}>
                            {lang === "ar" ? p.nameAr.split(" (")[0] : p.nameEn}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                            {lang === "ar" ? `الطلاب المقبولون: ${admittedCount} من ${p.capacity} مقاعد` : `Admitted: ${admittedCount} of ${p.capacity} seats`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleExportToExcel(p.id, lang === "ar" ? p.nameAr : p.nameEn, "master")}
                          className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 transition-all flex items-center justify-center cursor-pointer shrink-0"
                          title={lang === "ar" ? "تحميل كملف Excel" : "Download Excel Sheet"}
                          id={`btn-public-download-master-${p.id}`}
                        >
                          <FileDown className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* L3 lists column */}
              <div className="space-y-3.5" id="l3-reports-container">
                <h5 className="text-[10px] font-extrabold text-[#2a4fac] uppercase tracking-wider block bg-blue-50/50 px-3 py-1.5 rounded-lg border border-blue-100/60 text-start">
                  🏫 {lang === "ar" ? "شعب التوجيه للسنة الثالثة ليسانس (L3):" : "L3 Specialty Placement Lists:"}
                </h5>
                <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                  {L3_SPECIALTIES.map((s) => {
                    const admittedCount = applications.filter(app => app.status === ApplicationStatus.ACCEPTED && app.acceptedProgramId === s.id).length;
                    return (
                      <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200/55 hover:bg-slate-100/30 transition-all text-xs text-start">
                        <div className="min-w-0 pr-2">
                          <span className="font-extrabold text-slate-700 block truncate text-xs">
                            {lang === "ar" ? s.nameAr : s.nameEn}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                            {lang === "ar" ? `الطلاب المقبولون: ${admittedCount} من ${s.capacity} مقاعد` : `Admitted: ${admittedCount} of ${s.capacity} seats`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleExportToExcel(s.id, lang === "ar" ? s.nameAr : s.nameEn, "l3_specialty")}
                          className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 transition-all flex items-center justify-center cursor-pointer shrink-0"
                          title={lang === "ar" ? "تحميل كملف Excel" : "Download Excel Sheet"}
                          id={`btn-public-download-l3-${s.id}`}
                        >
                          <FileDown className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="text-[10px] sm:text-xs text-amber-800 bg-amber-50/80 p-3.5 rounded-xl border border-amber-200/60 leading-relaxed text-start flex items-start gap-2.5 shadow-2xs">
              <span className="text-sm">💡</span>
              <p>
                {lang === "ar" 
                  ? "قوائم الطلاب أعلاه مستخرجة ومعدلة تزامناً مع قرارات لجان التوجيه والتحقق البيداغوجي وتعتبر كأوراق رسمية مؤقتة. الملفات بصيغة CSV ملائمة وتفتح مباشرة في جميع الأجهزة عبر برامج جداول البيانات كـ Microsoft Excel أو Google Sheets." 
                  : "Student registers displayed reflect actual real-time algorithmic orientation outputs. Files contain complete compatibility weights, overall rankings, and student details encoded using high-precision UTF-8 encoding."}
              </p>
            </div>
          </div>
        )}

        {/* Floating download error toast */}
        {downloadError && (
          <div className="fixed bottom-5 right-5 left-5 sm:left-auto sm:w-96 bg-rose-50 border border-rose-200 p-4 rounded-xl shadow-lg z-50 flex items-start gap-3 animate-fade-in" style={{ direction: lang === "ar" ? "rtl" : "ltr" }}>
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-start">
              <p className="text-xs font-extrabold text-slate-800">
                {lang === "ar" ? "تنبيه واجهة الاستخدام" : "System Notification"}
              </p>
              <p className="text-xs text-rose-700 mt-1 font-medium">
                {downloadError}
              </p>
            </div>
            <button 
              onClick={() => setDownloadError(null)} 
              className="text-slate-400 hover:text-slate-600 text-xs font-bold shrink-0 self-center"
            >
              ✕
            </button>
          </div>
        )}

        {/* Real-time Accepted Students Interactive Preview & Export Dialog */}
        {modalOpen && selectedProgId && selectedProgName && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" style={{ direction: lang === "ar" ? "rtl" : "ltr" }}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 shadow-2xl">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between text-start bg-[#11235a] text-white shrink-0">
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                    🎓 {lang === "ar" ? "معاينة وتصدير قائمة الطلاب المقبولين" : "Review & Export Admitted Candidates"}
                  </h4>
                  <p className="text-xs text-slate-200 font-medium mt-1">
                    {selectedProgName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-1 px-2.5 rounded-lg text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 transition-all font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Body table */}
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-150 text-start">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">{lang === "ar" ? "إجمالي المقبولين" : "Total Accepted"}</span>
                    <span className="text-base font-extrabold text-[#11235a]">
                      {applications.filter(app => app.status === ApplicationStatus.ACCEPTED && app.acceptedProgramId === selectedProgId).length} {lang === "ar" ? "طالب مقبول بصفة مؤقتة" : "Provisionally registered"}
                    </span>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {/* Copy to Clipboard Trigger */}
                    <button
                      type="button"
                      onClick={() => handleCopyModalTable(applications.filter(app => app.status === ApplicationStatus.ACCEPTED && app.acceptedProgramId === selectedProgId))}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                        copySuccess 
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                          : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-600 animate-scale-up" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      {copySuccess 
                        ? (lang === "ar" ? "تم نسخ البيانات!" : "Excel data copied!") 
                        : (lang === "ar" ? "نسخ البيانات لـ Excel" : "Copy for Excel/Sheets")}
                    </button>

                    {/* Trigger File Download Fallback */}
                    <button
                      type="button"
                      onClick={() => triggerRawCSVDownload(selectedProgId, selectedProgName, applications.filter(app => app.status === ApplicationStatus.ACCEPTED && app.acceptedProgramId === selectedProgId))}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      {lang === "ar" ? "تحميل ملف CSV" : "Download raw CSV"}
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200/60 rounded-xl overflow-x-auto shadow-2xs">
                  <table className="w-full text-xs text-start">
                    <thead className="bg-[#11235a]/5 text-[#11235a] border-b border-slate-200/70 font-extrabold">
                      <tr>
                        <th className="p-3 text-start min-w-[100px]">{lang === "ar" ? "رقم المترشح" : "Reg ID"}</th>
                        <th className="p-3 text-start font-bold">{lang === "ar" ? "الاسم واللقب" : "Candidate Name"}</th>
                        <th className="p-3 text-start font-bold hidden sm:table-cell">{lang === "ar" ? "التخصص السابق" : "Previous Specialty"}</th>
                        <th className="p-3 text-center font-bold">{lang === "ar" ? "المعدل" : "GPA"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {applications.filter(app => app.status === ApplicationStatus.ACCEPTED && app.acceptedProgramId === selectedProgId).length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">
                            {lang === "ar" ? "⚠️ قائمة المقبولين فارغة حالياً لعدم وجود ملفات بيداغوجية معتمدة لهذا التخصص." : "This specialty admission roster is currently empty."}
                          </td>
                        </tr>
                      ) : (
                        applications.filter(app => app.status === ApplicationStatus.ACCEPTED && app.acceptedProgramId === selectedProgId).map((app, idx) => {
                          const prevSpec = LICENCE_SPECIALTIES.find(s => s.id === app.licenceSpecialty);
                          const prevSpecName = app.applicationType === "l3_specialty" ? "السنة الثانية ليسانس L2" : (prevSpec?.nameAr || app.licenceSpecialty);
                          const fullName = lang === "ar" ? `${app.lastNameAr} ${app.firstNameAr}` : `${app.firstNameEn} ${app.lastNameEn}`;
                          return (
                            <tr key={app.id} className="hover:bg-slate-50/50 transition-all text-slate-700">
                              <td className="p-3 font-mono text-[11px] font-extrabold text-slate-500">{app.id}</td>
                              <td className="p-3 font-bold text-slate-900 text-start">{fullName}</td>
                              <td className="p-3 hidden sm:table-cell text-slate-600 text-start">{prevSpecName}</td>
                              <td className="p-3 text-center text-emerald-850 font-mono font-extrabold">{app.licenceGpa ? app.licenceGpa.toFixed(2) : ""}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="text-[10px] sm:text-xs text-slate-500 font-medium leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-150 flex items-start gap-2.5 text-start">
                  <span>💡</span>
                  <p>
                    {lang === "ar" 
                      ? "يمكنك الضغط على 'نسخ البيانات لـ Excel' ثم فتح برنامج Microsoft Excel أو Google Sheets واختيار لصق (Ctrl+V) للحصول على البيانات في جداول مرتبة مباشرة دون أي عقبات ترميز عربية." 
                      : "You can click 'Copy for Excel/Sheets' and paste (Ctrl+V) directly inside any spreadsheet processor such as MS Excel or Google Sheets with automatic parsing."}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-150 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Printer className="w-3.5 h-3.5" />
                  {lang === "ar" ? "طباعة القوائم" : "Print Report / Save PDF"}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  {lang === "ar" ? "إغلاق" : "Close"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
