/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  UserCheck, 
  Eye, 
  Sparkles,
  ChevronDown,
  Trash2,
  Lock,
  Calendar,
  AlertTriangle,
  AlertCircle,
  BookOpen,
  Download,
  Settings,
  Save,
  ListOrdered
} from "lucide-react";
import { CandidateApplication, ApplicationStatus, DocumentUploads } from "../types";
import { MASTER_PROGRAMS, LICENCE_SPECIALTIES, COMPATIBILITY_RULES, getCompatibilityDetails, L3_SPECIALTIES, getAcademicYear, setAcademicYear, getRegistrationPeriod, setRegistrationPeriod } from "../data/programs";
import { translations, LangType } from "../data/translations";

const isAppMaster80Percent = (app: CandidateApplication) => {
  return app.applicationType === "master" &&
    (app.university === "UNIV-LAGHOUAT" ||
     app.university === "جامعة عمار ثليجي - الأغواط" ||
     app.university === "Université Amar Telidji - Laghouat" ||
     app.university === "Amar Telidji University - Laghouat") &&
    app.graduationYear === 2026;
};

interface AdminPortalProps {
  applications: CandidateApplication[];
  onUpdateStatus: (id: string, updates: Partial<CandidateApplication>) => void;
  onResetApplications: () => void;
  onDeleteApplication: (id: string) => void;
  lang: LangType;
}

export default function AdminPortal({
  applications,
  onUpdateStatus,
  onResetApplications,
  onDeleteApplication,
  lang
}: AdminPortalProps) {
  const t = translations[lang];

  // Safe GPA formatting helper
  const safeFormatGpa = (val: any, digits: number = 2) => {
    if (val === null || val === undefined || isNaN(Number(val))) return "0.00";
    return Number(val).toFixed(digits);
  };

  // Authentication bypass state (for mock/preview demo ease)
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [authError, setAuthError] = useState("");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [trackFilter, setTrackFilter] = useState<string>("all");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  const [sortByGpa, setSortByGpa] = useState<"desc" | "asc" | "none">("desc");
  const [groupBySpecialty, setGroupBySpecialty] = useState<boolean>(true);

  // Selection state for details drawer
  const [selectedApp, setSelectedApp] = useState<CandidateApplication | null>(null);

  // Custom confirmation modal states for safe, non-blocking iframe deletion and resets
  const [deleteCandidateTarget, setDeleteCandidateTarget] = useState<CandidateApplication | null>(null);
  const [deleteDocTarget, setDeleteDocTarget] = useState<{ app: CandidateApplication; key: keyof DocumentUploads } | null>(null);
  const [resetDbTarget, setResetDbTarget] = useState<boolean>(false);

  // Manual rejection reason option state
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");

  // Auto merit sorting simulation logging
  const [algoLog, setAlgoLog] = useState<string[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);

  // System Configurations & Seats state
  const [academicYearInput, setAcademicYearInput] = useState<string>(getAcademicYear());
  
  // Registration Period configurations state
  const [regMaster80StartDate, setRegMaster80StartDate] = useState<string>(() => getRegistrationPeriod("master_80").startDate);
  const [regMaster80EndDate, setRegMaster80EndDate] = useState<string>(() => getRegistrationPeriod("master_80").endDate);
  const [regMaster80Enabled, setRegMaster80Enabled] = useState<boolean>(() => getRegistrationPeriod("master_80").isEnabled);

  const [regMaster20StartDate, setRegMaster20StartDate] = useState<string>(() => getRegistrationPeriod("master_20").startDate);
  const [regMaster20EndDate, setRegMaster20EndDate] = useState<string>(() => getRegistrationPeriod("master_20").endDate);
  const [regMaster20Enabled, setRegMaster20Enabled] = useState<boolean>(() => getRegistrationPeriod("master_20").isEnabled);

  const [regL3StartDate, setRegL3StartDate] = useState<string>(() => getRegistrationPeriod("l3_specialty").startDate);
  const [regL3EndDate, setRegL3EndDate] = useState<string>(() => getRegistrationPeriod("l3_specialty").endDate);
  const [regL3Enabled, setRegL3Enabled] = useState<boolean>(() => getRegistrationPeriod("l3_specialty").isEnabled);
  
  // Track configurations locally for react input feedback
  const [masterCapacities, setMasterCapacities] = useState<Record<string, number>>(() => {
    const caps: Record<string, number> = {};
    MASTER_PROGRAMS.forEach(p => {
      caps[p.id] = p.capacity;
    });
    return caps;
  });

  const [l3Capacities, setL3Capacities] = useState<Record<string, number>>(() => {
    const caps: Record<string, number> = {};
    L3_SPECIALTIES.forEach(s => {
      caps[s.id] = s.capacity;
    });
    return caps;
  });

  const [capacitySavedToast, setCapacitySavedToast] = useState<boolean>(false);
  const [downloadErrorToast, setDownloadErrorToast] = useState<string | null>(null);

  // Save changes handler
  const handleSaveSystemConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setAcademicYear(academicYearInput);
    setRegistrationPeriod("master_80", regMaster80StartDate, regMaster80EndDate, regMaster80Enabled);
    setRegistrationPeriod("master_20", regMaster20StartDate, regMaster20EndDate, regMaster20Enabled);
    // Also update legacy format for safety
    setRegistrationPeriod("master", regMaster80StartDate, regMaster80EndDate, regMaster80Enabled);
    
    setRegistrationPeriod("l3_specialty", regL3StartDate, regL3EndDate, regL3Enabled);
    
    // Dispatch custom event to notify external listeners (like ApplicationForm and Header) about saved dates
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("reg-period-updated"));
    }

    const updatedCaps: Record<string, number> = {};
    MASTER_PROGRAMS.forEach(p => {
      p.capacity = Number(masterCapacities[p.id] ?? p.capacity);
      updatedCaps[p.id] = p.capacity;
    });
    L3_SPECIALTIES.forEach(s => {
      s.capacity = Number(l3Capacities[s.id] ?? s.capacity);
      updatedCaps[s.id] = s.capacity;
    });
    localStorage.setItem("pedagogical_capacities", JSON.stringify(updatedCaps));

    setCapacitySavedToast(true);
    setTimeout(() => setCapacitySavedToast(false), 3000);
  };

  // Export List of Accepted Students function
  const handleExportToExcel = (programId: string, programName: string, type: "master" | "l3_specialty") => {
    const admitted = applications.filter(app => 
      app.status === ApplicationStatus.ACCEPTED && 
      app.acceptedProgramId === programId
    );
    
    if (admitted.length === 0) {
      setDownloadErrorToast(
        lang === "ar" 
          ? `عذراً! لا يوجد أي طالب مقبول في تخصص (${programName}) حالياً لتصدير القائمة.` 
          : `No admitted candidates found for (${programName}) yet.`
      );
      setTimeout(() => setDownloadErrorToast(null), 5000);
      return;
    }

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

    const csvRows = admitted.map(app => {
      const prevSpecName = app.applicationType === "l3_specialty" ? "السنة الثانية ليسانس L2" : (LICENCE_SPECIALTIES.find(s => s.id === app.licenceSpecialty)?.nameAr || app.licenceSpecialty);
      const levelLabel = app.applicationType === "l3_specialty" ? "السنة الثالثة ليسانس L3" : "السنة الأولى ماستر M1";
      const studentFirstName = lang === "ar" ? app.firstNameAr : app.firstNameEn;
      const studentLastName = lang === "ar" ? app.lastNameAr : app.lastNameEn;
      const currentYear = academicYearInput || "2025/2026";

      return [
        app.id,
        app.nationalStudentId,
        studentFirstName,
        studentLastName,
        app.email,
        app.phone,
        levelLabel,
        prevSpecName,
        safeFormatGpa(app.licenceGpa, 2),
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
    link.setAttribute("download", `liste_admis_${programId.toLowerCase()}_${academicYearInput.replace(/\//g, "-")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // Static Localized UI Helper functions
  const getProgName = (p: typeof MASTER_PROGRAMS[0]) => {
    if (lang === "ar") return p.nameAr;
    if (lang === "en") return p.nameEn;
    return p.nameFr || p.nameEn;
  };

  const getSpecName = (s: typeof LICENCE_SPECIALTIES[0]) => {
    if (lang === "ar") return s.nameAr;
    if (lang === "en") return s.nameEn;
    return s.nameFr || s.nameEn;
  };

  const currentProgramName = (progId: string | undefined, candidate?: CandidateApplication) => {
    if (!progId) return "";
    if (candidate?.applicationType === "l3_specialty" || L3_SPECIALTIES.some(x => x.id === progId)) {
      const spec = L3_SPECIALTIES.find(x => x.id === progId);
      return spec ? (lang === "ar" ? spec.nameAr : lang === "en" ? spec.nameEn : spec.nameFr) : progId;
    }
    const p = MASTER_PROGRAMS.find(x => x.id === progId);
    return p ? getProgName(p) : progId;
  };

  const getChoiceLabelAndDetails = (choiceId: string, candidate: CandidateApplication) => {
    if (candidate.applicationType === "l3_specialty") {
      const spec = L3_SPECIALTIES.find(p => p.id === choiceId);
      if (!spec) return { name: choiceId, capacity: 20, isAllowed: true, coeff: 1.0, adjustedGpa: candidate.licenceGpa, label: lang === "ar" ? "مطابق مباشر" : "Direct match" };
      return {
        name: lang === "ar" ? spec.nameAr : lang === "en" ? spec.nameEn : spec.nameFr,
        capacity: spec.capacity,
        isAllowed: true,
        coeff: 1.0,
        adjustedGpa: candidate.licenceGpa,
        label: lang === "ar" ? "رغبة بيداغوجية موجهة" : "Pedagogical preference assignment"
      };
    } else {
      const program = MASTER_PROGRAMS.find(p => p.id === choiceId);
      if (!program) return { name: choiceId, capacity: 40, isAllowed: true, coeff: 1.0, adjustedGpa: candidate.licenceGpa, label: "" };
      const compDetails = getCompatibilityDetails(choiceId, candidate.licenceSpecialty);
      return {
        name: getProgName(program).split(" (")[0],
        capacity: program.capacity,
        isAllowed: compDetails.coeff > 0,
        coeff: compDetails.coeff,
        adjustedGpa: candidate.licenceGpa * compDetails.coeff,
        label: lang === "ar" ? compDetails.labelAr : compDetails.labelFr
      };
    }
  };

  // Simple auth gate handler
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = adminEmail.trim().toLowerCase();
    
    if (cleanEmail !== "taharmansouri32@gmail.com") {
      setAuthError(
        lang === "ar"
          ? "البريد الإلكتروني المدخل غير مصرح له كمدير للموقع."
          : "The entered email address is not authorized as an administrator."
      );
      return;
    }

    if (accessCode === "2026") {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError(
        lang === "ar" 
          ? "رمز المرور الإداري خاطئ؛ يرجى إدخال الرمز السري المعتمد لوزارة التعليم العالي (2026)."
          : "Invalid access code. Please try again with the approved administrative credentials (2026)."
      );
    }
  };

  // Stats calculate
  const totalApps = applications.length;
  const acceptedApps = applications.filter(a => a.status === ApplicationStatus.ACCEPTED).length;
  const rejectedApps = applications.filter(a => a.status === ApplicationStatus.REJECTED).length;
  const pendingApps = applications.filter(a => a.status === ApplicationStatus.PENDING).length;
  
  const averageGpa = totalApps > 0 
    ? safeFormatGpa(applications.reduce((acc, current) => acc + (current.licenceGpa || 0), 0) / totalApps, 2) 
    : "0.00";

  // Data Filtering & Sorting Flow
  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      `${app.firstNameAr} ${app.lastNameAr}`.includes(searchTerm) ||
      `${app.firstNameEn} ${app.lastNameEn}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.includes(searchTerm) ||
      app.nationalStudentId.includes(searchTerm);

    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesTrack = trackFilter === "all" || app.applicationType === trackFilter || (!app.applicationType && trackFilter === "master");
    const matchesSpecialty = specialtyFilter === "all" || app.licenceSpecialty === specialtyFilter;

    return matchesSearch && matchesStatus && matchesTrack && matchesSpecialty;
  }).sort((a, b) => {
    if (sortByGpa === "desc") {
      return b.licenceGpa - a.licenceGpa; // Highest GPA first (Standard academic ranking!)
    } else if (sortByGpa === "asc") {
      return a.licenceGpa - b.licenceGpa;
    }
    return 0;
  });

  // Helper to retrieve the current ranking within the oriented specialty
  const getRankInProgram = (app: CandidateApplication): { rank: number; total: number } => {
    if (app.status !== ApplicationStatus.ACCEPTED || !app.acceptedProgramId) {
      return { rank: 0, total: 0 };
    }
    const isL3 = app.applicationType === "l3_specialty";
    const sameProg = applications.filter(a => a.status === ApplicationStatus.ACCEPTED && a.acceptedProgramId === app.acceptedProgramId);
    
    sameProg.sort((a, b) => {
      if (isL3) {
        const scoreA = ((a.l1Gpa ?? a.licenceGpa) + (a.l2Gpa ?? a.licenceGpa)) / 2;
        const scoreB = ((b.l1Gpa ?? b.licenceGpa) + (b.l2Gpa ?? b.licenceGpa)) / 2;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return b.licenceGpa - a.licenceGpa;
      } else {
        const coeffA = getCompatibilityDetails(app.acceptedProgramId!, a.licenceSpecialty).coeff;
        const coeffB = getCompatibilityDetails(app.acceptedProgramId!, b.licenceSpecialty).coeff;
        const scoreA = a.licenceGpa * coeffA;
        const scoreB = b.licenceGpa * coeffB;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return b.licenceGpa - a.licenceGpa;
      }
    });

    const rankIdx = sameProg.findIndex(a => a.id === app.id);
    return {
      rank: rankIdx !== -1 ? rankIdx + 1 : 0,
      total: sameProg.length
    };
  };

  // Action: Accept candidate into a specific preference index (0 to 3)
  const handleAcceptManual = (app: CandidateApplication, choiceIndex: number) => {
    const targetProgramId = app.choices[choiceIndex];
    onUpdateStatus(app.id, {
      status: ApplicationStatus.ACCEPTED,
      acceptedChoiceIndex: choiceIndex,
      acceptedProgramId: targetProgramId,
      rejectionReason: undefined
    });
    // Sync current visual drawer details
    setSelectedApp(prev => prev ? { 
      ...prev, 
      status: ApplicationStatus.ACCEPTED,
      acceptedChoiceIndex: choiceIndex,
      acceptedProgramId: targetProgramId,
      rejectionReason: undefined
    } : null);
  };

  // Action: Reject candidate with specified reason
  const handleRejectManual = (app: CandidateApplication) => {
    const defaultReason = lang === "ar" 
      ? "عدم التوافق التام لملف ليسانس مع المتطلبات التقنية للشعبة"
      : "Incompatibility of Licence major credentials with specific requirements.";
    const finalReason = rejectionReasonInput.trim() || defaultReason;

    onUpdateStatus(app.id, {
      status: ApplicationStatus.REJECTED,
      rejectionReason: finalReason,
      acceptedChoiceIndex: undefined,
      acceptedProgramId: undefined
    });
    setRejectionReasonInput("");
    // Sync UI drawer details
    setSelectedApp(prev => prev ? {
      ...prev,
      status: ApplicationStatus.REJECTED,
      rejectionReason: finalReason,
      acceptedChoiceIndex: undefined,
      acceptedProgramId: undefined
    } : null);
  };

  // Action: Reset candidate to pending
  const handleRevertPending = (app: CandidateApplication) => {
    onUpdateStatus(app.id, {
      status: ApplicationStatus.PENDING,
      rejectionReason: undefined,
      acceptedChoiceIndex: undefined,
      acceptedProgramId: undefined
    });
    setSelectedApp(prev => prev ? {
      ...prev,
      status: ApplicationStatus.PENDING,
      rejectionReason: undefined,
      acceptedChoiceIndex: undefined,
      acceptedProgramId: undefined
    } : null);
  };

  // Action: Delete attached document from student dossier
  const handleDeleteIndividualFile = (app: CandidateApplication, key: keyof DocumentUploads) => {
    const updatedDocs = {
      ...app.documents,
      [key]: false
    };
    const updatedFileNames = app.uploadedFileNames ? { ...app.uploadedFileNames } : {};
    delete updatedFileNames[key];

    onUpdateStatus(app.id, {
      documents: updatedDocs,
      uploadedFileNames: updatedFileNames
    });

    setSelectedApp(prev => prev ? {
      ...prev,
      documents: updatedDocs,
      uploadedFileNames: updatedFileNames
    } : null);
  };

  // Simulated merit-based matching algorithm (Gale-Shapley style optimization with exact compatibility coefficients)
  const runAutoMeritSorting = () => {
    const logs: string[] = [];
    
    if (lang === "ar") {
      logs.push("⚙️ بدء تشغيل خوارزمية الفرز الاستحقاقي بوزارة التعليم العالي التلقائي للماستر لدفعة 2026...");
      logs.push(`🔍 فحص وتحليل طلبات الترشح السارية بالمنصة (العدد الإجمالي: ${applications.length}).`);
    } else if (lang === "fr") {
      logs.push("⚙️ Lancement de l'algorithme d'orientation et d'affectation au mérite (GPA)...");
      logs.push(`🔍 Analyse de la base de données des candidatures actives (Total : ${applications.length}).`);
    } else {
      logs.push("⚙️ Booting merit-based academic placement optimization engine (GPA sorting)...");
      logs.push(`🔍 Scanning active candidate roster records (Injected pool size: ${applications.length}).`);
    }

    // Isolate pending candidates by track
    const pendingMasterApps = applications.filter(app => (app.applicationType === "master" || !app.applicationType) && app.status === ApplicationStatus.PENDING);
    const pendingL3Apps = applications.filter(app => app.applicationType === "l3_specialty" && app.status === ApplicationStatus.PENDING);

    if (pendingMasterApps.length === 0 && pendingL3Apps.length === 0) {
      if (lang === "ar") {
        logs.push("⚠️ معلومات: لا توجد أي ملفات معلقة بقيد الدراسة لتطبيق الفرز عليها حالياً.");
      } else {
        logs.push("⚠️ Info: No pending applications are available to process in the current pool.");
      }
      setAlgoLog(logs);
      setShowLogModal(true);
      return;
    }

    // 1. RUN MASTER MERIT-BASED SORTING
    if (pendingMasterApps.length > 0) {
      if (lang === "ar") {
        logs.push(`📑 عدد ملفات الماستر قيد الدراسة المستهدفة للتوجيه: ${pendingMasterApps.length} مترشح.`);
        logs.push("--------------------------------------------------------------------------------");
      } else {
        logs.push(`📑 Master pending files identified for placement: ${pendingMasterApps.length} applicants.`);
        logs.push("--------------------------------------------------------------------------------");
      }

      const activeCapacities: Record<string, number> = {};
      MASTER_PROGRAMS.forEach(prog => {
        activeCapacities[prog.id] = prog.capacity;
      });

      applications.forEach(app => {
        if ((app.applicationType === "master" || !app.applicationType) && app.status === ApplicationStatus.ACCEPTED && app.acceptedProgramId) {
          activeCapacities[app.acceptedProgramId] = Math.max(0, activeCapacities[app.acceptedProgramId] - 1);
        }
      });

      const loopCandidates = pendingMasterApps.map(app => ({
        app,
        currentChoiceIdx: 0,
        studentName: lang === "ar" ? `${app.firstNameAr} ${app.lastNameAr}` : `${app.firstNameEn} ${app.lastNameEn}`,
        specialtyLabel: LICENCE_SPECIALTIES.find(s => s.id === app.licenceSpecialty)?.nameAr || app.licenceSpecialty
      }));

      let round = 1;
      let stable = false;
      let provisionalAssignments: Record<string, typeof loopCandidates> = {};
      MASTER_PROGRAMS.forEach(p => { provisionalAssignments[p.id] = []; });

      while (!stable) {
        if (lang === "ar") {
          logs.push(`🔄 جولة الماستر رقم ${round} لمداولات اللجنة البيداغوجية والفرز الاستحقاقي...`);
        } else {
          logs.push(`🔄 Master Round #${round} of pedagogical matching deliberations...`);
        }

        let changed = false;
        const activeProposals: Record<string, typeof loopCandidates> = {};
        MASTER_PROGRAMS.forEach(p => { activeProposals[p.id] = []; });

        loopCandidates.forEach(cand => {
          if (cand.currentChoiceIdx < 4) {
            const preferredProgramId = cand.app.choices[cand.currentChoiceIdx];
            if (preferredProgramId && activeProposals[preferredProgramId]) {
              activeProposals[preferredProgramId].push(cand);
            } else {
              cand.currentChoiceIdx = 4;
            }
          }
        });

        MASTER_PROGRAMS.forEach(prog => {
          const slots = activeCapacities[prog.id];
          const bids = activeProposals[prog.id];
          if (bids.length === 0) return;

          bids.sort((a, b) => {
            const detailsA = getCompatibilityDetails(prog.id, a.app.licenceSpecialty);
            const scoreA = a.app.licenceGpa * detailsA.coeff;
            const detailsB = getCompatibilityDetails(prog.id, b.app.licenceSpecialty);
            const scoreB = b.app.licenceGpa * detailsB.coeff;

            if (scoreB !== scoreA) {
              return scoreB - scoreA;
            }
            return b.app.licenceGpa - a.app.licenceGpa;
          });

          const acceptedForProg: typeof bids = [];
          const rejectedForProg: typeof bids = [];

          bids.forEach((cand) => {
            const details = getCompatibilityDetails(prog.id, cand.app.licenceSpecialty);
            if (details.coeff === 0) {
              rejectedForProg.push(cand);
              if (lang === "ar") {
                logs.push(`   ⚠️ استبعاد المترشح: ${cand.studentName} من تخصص ${prog.nameAr.split(" (")[0]} - تخصص ليسانس (${cand.specialtyLabel}) غير متوافق نهائياً مع شعبة الماستر.`);
              } else {
                logs.push(`   ⚠️ Reject ${cand.studentName} from ${prog.nameEn} - Licence background (${cand.specialtyLabel}) is incompatible.`);
              }
            } else if (acceptedForProg.length < slots) {
              acceptedForProg.push(cand);
            } else {
              rejectedForProg.push(cand);
            }
          });

          rejectedForProg.forEach(cand => {
            cand.currentChoiceIdx += 1;
            changed = true;
          });

          provisionalAssignments[prog.id] = acceptedForProg;
        });

        if (!changed || round > 10) {
          stable = true;
        } else {
          round++;
        }
      }

      logs.push("--------------------------------------------------------------------------------");
      if (lang === "ar") {
        logs.push("💾 الانتهاء من فرز مترشحي الماستر بالتوافق البيداغوجي الموجه؛ تحديث حالات القبول...");
      } else {
        logs.push("💾 Finalizing pedagogical placement results for Master; updating student dossiers...");
      }

      let totalMatchedDuringRun = 0;
      let totalRejectedDuringRun = 0;

      MASTER_PROGRAMS.forEach(prog => {
        const finalAccepts = provisionalAssignments[prog.id] || [];
        finalAccepts.forEach((cand) => {
          const details = getCompatibilityDetails(prog.id, cand.app.licenceSpecialty);
          const score = cand.app.licenceGpa * details.coeff;
          
          onUpdateStatus(cand.app.id, {
            status: ApplicationStatus.ACCEPTED,
            acceptedChoiceIndex: cand.currentChoiceIdx,
            acceptedProgramId: prog.id,
            rejectionReason: undefined
          });

          totalMatchedDuringRun++;
          if (lang === "ar") {
            logs.push(`   🎯 المترشح: ${cand.studentName} [معدل: ${safeFormatGpa(cand.app.licenceGpa, 2)} | التوافق: ${safeFormatGpa(details.coeff, 2)} - مرتبة ${details.rank}] تم توجيهه لرغبته رقم ${cand.currentChoiceIdx + 1}: ${prog.nameAr.split(" (")[0]} بمعدل توجيه قدره: ${safeFormatGpa(score, 2)} / 20`);
          } else {
            logs.push(`   🎯 Admitted Master: ${cand.studentName} [GPA: ${safeFormatGpa(cand.app.licenceGpa, 2)} | Coeff: ${safeFormatGpa(details.coeff, 2)} - Rank ${details.rank}] directed to Choice #${cand.currentChoiceIdx + 1}: ${prog.nameEn} with Merit Score: ${safeFormatGpa(score, 2)} / 20`);
          }
        });
      });

      loopCandidates.forEach(cand => {
        if (cand.currentChoiceIdx >= 4) {
          onUpdateStatus(cand.app.id, {
            status: ApplicationStatus.REJECTED,
            rejectionReason: lang === "ar" 
              ? "الامتلاء التام للمقاعد البيداغوجية المتوفرة للتخصصات الأربع المرغوبة مع عدم كفاية معدل الترتيب المقابل للتصنيفات المقبولة."
              : "Pedagogical capacity fully saturated across all four selected preferences combined with insufficient rank GPA.",
            acceptedChoiceIndex: undefined,
            acceptedProgramId: undefined
          });

          totalRejectedDuringRun++;
          if (lang === "ar") {
            logs.push(`   🛑 المترشح: ${cand.studentName} [معدل: ${safeFormatGpa(cand.app.licenceGpa, 2)}] تعذر تلبية أي من رغباته الأربع لامتلاء السعة البيداغوجية لملفات ذات معدل ترتيب أعلى.`);
          } else {
            logs.push(`   🛑 Candidate Master: ${cand.studentName} [GPA: ${safeFormatGpa(cand.app.licenceGpa, 2)}] could not be placed due to seat capacity saturation by higher merit candidates.`);
          }
        }
      });

      logs.push("--------------------------------------------------------------------------------");
      if (lang === "ar") {
        logs.push(`✅ تمت تسوية وتصفية جميع طلاب الماستر بنجاح! المقبولون: ${totalMatchedDuringRun} • المرفوضون: ${totalRejectedDuringRun}`);
      } else {
        logs.push(`✅ Placement algorithm for Master files executed! Admitted: ${totalMatchedDuringRun} • Saturated: ${totalRejectedDuringRun}`);
      }
    }

    // 2. RUN L3 SPECIALTY MERIT-BASED ORIENTATION
    if (pendingL3Apps.length > 0) {
      logs.push("");
      if (lang === "ar") {
        logs.push("⚙️ بدء تشغيل خوارزمية توزيع طلبة السنة الثانية ليسانس على تخصصات السنة الثالثة (L3)...");
        logs.push(`📑 عدد الطلبة قيد التوجيه: ${pendingL3Apps.length} طالب.`);
      } else {
        logs.push("⚙️ Booting 2nd Year orientation and specialty assignment algorithm (L2 to L3)...");
        logs.push(`📑 Target students identified for L3 specialty assignment: ${pendingL3Apps.length} applicants.`);
      }

      const activeL3Capacities: Record<string, number> = {};
      L3_SPECIALTIES.forEach(spec => {
        activeL3Capacities[spec.id] = spec.capacity;
      });

      applications.forEach(app => {
        if (app.applicationType === "l3_specialty" && app.status === ApplicationStatus.ACCEPTED && app.acceptedProgramId) {
          activeL3Capacities[app.acceptedProgramId] = Math.max(0, activeL3Capacities[app.acceptedProgramId] - 1);
        }
      });

      const loopL3Candidates = pendingL3Apps.map(app => ({
        app,
        currentChoiceIdx: 0,
        studentName: lang === "ar" ? `${app.firstNameAr} ${app.lastNameAr}` : `${app.firstNameEn} ${app.lastNameEn}`
      }));

      let l3Stable = false;
      let l3Round = 1;
      let provisionalL3Assignments: Record<string, typeof loopL3Candidates> = {};
      L3_SPECIALTIES.forEach(s => { provisionalL3Assignments[s.id] = []; });

      while (!l3Stable) {
        let l3Changed = false;
        const activeL3Proposals: Record<string, typeof loopL3Candidates> = {};
        L3_SPECIALTIES.forEach(s => { activeL3Proposals[s.id] = []; });

        loopL3Candidates.forEach(cand => {
          if (cand.currentChoiceIdx < 4) {
            const preferredL3Id = cand.app.choices[cand.currentChoiceIdx];
            if (preferredL3Id && activeL3Proposals[preferredL3Id]) {
              activeL3Proposals[preferredL3Id].push(cand);
            } else {
              cand.currentChoiceIdx = 4;
            }
          }
        });

        L3_SPECIALTIES.forEach(spec => {
          const slots = activeL3Capacities[spec.id];
          const bids = activeL3Proposals[spec.id];
          if (bids.length === 0) return;

          bids.sort((a, b) => b.app.licenceGpa - a.app.licenceGpa);

          const acceptedForSpec: typeof bids = [];
          const rejectedForSpec: typeof bids = [];

          bids.forEach(cand => {
            if (acceptedForSpec.length < slots) {
              acceptedForSpec.push(cand);
            } else {
              rejectedForSpec.push(cand);
            }
          });

          rejectedForSpec.forEach(cand => {
            cand.currentChoiceIdx += 1;
            l3Changed = true;
          });

          provisionalL3Assignments[spec.id] = acceptedForSpec;
        });

        if (!l3Changed || l3Round > 10) {
          l3Stable = true;
        } else {
          l3Round++;
        }
      }

      let newlyPlacedL3 = 0;
      let unplacedL3 = 0;

      L3_SPECIALTIES.forEach(spec => {
        const specsObj = provisionalL3Assignments[spec.id] || [];
        specsObj.forEach(cand => {
          onUpdateStatus(cand.app.id, {
            status: ApplicationStatus.ACCEPTED,
            acceptedChoiceIndex: cand.currentChoiceIdx,
            acceptedProgramId: spec.id,
            rejectionReason: undefined
          });
          newlyPlacedL3++;
          const specLabel = lang === "ar" ? spec.nameAr : spec.nameEn;
          if (lang === "ar") {
            logs.push(`   🎯 الطالب: ${cand.studentName} [معدل الترتيب: ${safeFormatGpa(cand.app.licenceGpa, 2)}] تم توجيهه لرغبته رقم ${cand.currentChoiceIdx + 1}: ${specLabel}`);
          } else {
            logs.push(`   🎯 Student: ${cand.studentName} [GPA: ${safeFormatGpa(cand.app.licenceGpa, 2)}] assigned to Choice #${cand.currentChoiceIdx + 1}: ${specLabel}`);
          }
        });
      });

      loopL3Candidates.forEach(cand => {
        if (cand.currentChoiceIdx >= 4) {
          onUpdateStatus(cand.app.id, {
            status: ApplicationStatus.REJECTED,
            rejectionReason: lang === "ar"
              ? "اكتمال السعة البيداغوجية لجميع التخصصات الأربعة المرغوبة من طرف طلاب ذوي معدلات ترتيب أعلى."
              : "All 4 chosen L3 specialties are fully saturated by higher-ranking students.",
            acceptedChoiceIndex: undefined,
            acceptedProgramId: undefined
          });
          unplacedL3++;
          if (lang === "ar") {
            logs.push(`   🛑 الطالب: ${cand.studentName} [معدل الترتيب: ${safeFormatGpa(cand.app.licenceGpa, 2)}] تعذر توجيهه للامتلاء الكامل لجميع الشعب المرغوبة.`);
          } else {
            logs.push(`   🛑 Student: ${cand.studentName} [GPA: ${safeFormatGpa(cand.app.licenceGpa, 2)}] could not be assigned to any of their 4 requested specialties due to capacity saturation.`);
          }
        }
      });

      if (lang === "ar") {
        logs.push(`✅ جرى توزيع طلبة الـ L3 بنجاح! المقبولون: ${newlyPlacedL3} • المتعذر توجيههم للامتلاء: ${unplacedL3}`);
      } else {
        logs.push(`✅ L3 student assignment completed! Assigned: ${newlyPlacedL3} • Unassigned due to capacity: ${unplacedL3}`);
      }
    }

    setAlgoLog(logs);
    setShowLogModal(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-slate-50 py-16 px-4 flex justify-center" id="admin-login-lock">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xl text-center space-y-6">
          <div className="mx-auto w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100 font-bold">
            <Lock className="w-6 h-6 text-official-blue" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {lang === "ar" ? "بوابة الدخول المحمية للجنة العلمية" : "Protected Scientific Roster Portal"}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {lang === "ar" 
                ? "يخضع هذا الفضاء الأكاديمي لسرية المداولات ويسمح فقط للموظفين المرخصين بالعبور" 
                : "This space is strictly confidential. Only authorized academic staff may proceed."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4 text-start">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                {lang === "ar" ? "أدخل البريد الإلكتروني للمسؤول المعتمد:" : "Enter Authorized Administrator Email:"}
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@univ-lagh.dz"
                className="w-full text-center text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-official-blue font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                {lang === "ar" ? "أدخل رمز المرور السري الخاص باللجنة:" : "Key Code Verification:"}
              </label>
              <input
                type="password"
                required
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="2026"
                className="w-full text-center text-sm px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-official-blue font-mono"
              />
            </div>

            {authError && <p className="text-xs text-rose-600 font-medium text-center">{authError}</p>}

            <button
              type="submit"
              className="w-full py-2.5 bg-official-blue hover:bg-blue-800 text-white font-bold text-sm rounded-lg transition-all cursor-pointer"
            >
              {lang === "ar" ? "فك تشفير قفل الفضاء البيداغوجي" : "Authorize Entry"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Build grouped/sorted rows based on the requested specialty grouping setting
  const renderedRows: (
    | { type: "header"; programName: string; count: number; track: "master" | "l3_specialty" | "other" }
    | { type: "row"; app: CandidateApplication; globalIndex: number; specialtyRank: number; specialtyTotal: number }
  )[] = [];

  if (groupBySpecialty) {
    // 1. Group active Master programs
    MASTER_PROGRAMS.forEach(prog => {
      const acceptedAppsForProg = filteredApps.filter(
        a => a.status === ApplicationStatus.ACCEPTED && a.acceptedProgramId === prog.id
      );
      if (acceptedAppsForProg.length > 0) {
        // Sort this list of accepted students by specialty-specific merit score descending
        acceptedAppsForProg.sort((a, b) => {
          const coeffA = getCompatibilityDetails(prog.id, a.licenceSpecialty).coeff;
          const coeffB = getCompatibilityDetails(prog.id, b.licenceSpecialty).coeff;
          const scoreA = a.licenceGpa * coeffA;
          const scoreB = b.licenceGpa * coeffB;
          if (scoreB !== scoreA) return scoreB - scoreA;
          return b.licenceGpa - a.licenceGpa;
        });

        renderedRows.push({
          type: "header",
          programName: lang === "ar" ? prog.nameAr : prog.nameEn,
          count: acceptedAppsForProg.length,
          track: "master"
        });

        acceptedAppsForProg.forEach((app, index) => {
          renderedRows.push({
            type: "row",
            app,
            globalIndex: filteredApps.findIndex(x => x.id === app.id),
            specialtyRank: index + 1,
            specialtyTotal: acceptedAppsForProg.length
          });
        });
      }
    });

    // 2. Group active L3 specialties
    L3_SPECIALTIES.forEach(spec => {
      const acceptedAppsForSpec = filteredApps.filter(
        a => a.status === ApplicationStatus.ACCEPTED && a.acceptedProgramId === spec.id
      );
      if (acceptedAppsForSpec.length > 0) {
        // Sort by L3 score formula
        acceptedAppsForSpec.sort((a, b) => {
          const scoreA = ((a.l1Gpa ?? a.licenceGpa) + (a.l2Gpa ?? a.licenceGpa)) / 2;
          const scoreB = ((b.l1Gpa ?? b.licenceGpa) + (b.l2Gpa ?? b.licenceGpa)) / 2;
          if (scoreB !== scoreA) return scoreB - scoreA;
          return b.licenceGpa - a.licenceGpa;
        });

        renderedRows.push({
          type: "header",
          programName: lang === "ar" ? spec.nameAr : spec.nameEn,
          count: acceptedAppsForSpec.length,
          track: "l3_specialty"
        });

        acceptedAppsForSpec.forEach((app, index) => {
          renderedRows.push({
            type: "row",
            app,
            globalIndex: filteredApps.findIndex(x => x.id === app.id),
            specialtyRank: index + 1,
            specialtyTotal: acceptedAppsForSpec.length
          });
        });
      }
    });

    // 3. Other/Pending/Rejected students
    const unassignedApps = filteredApps.filter(
      a => a.status !== ApplicationStatus.ACCEPTED || !a.acceptedProgramId
    );
    if (unassignedApps.length > 0) {
      renderedRows.push({
        type: "header",
        programName: lang === "ar" ? "طلبات قيد المذاكرة والتدقيق أو مرفوضة / غير موجهة بعد" : "Candidates under review, rejected or unallocated",
        count: unassignedApps.length,
        track: "other"
      });

      unassignedApps.forEach((app) => {
        renderedRows.push({
          type: "row",
          app,
          globalIndex: filteredApps.findIndex(x => x.id === app.id),
          specialtyRank: 0,
          specialtyTotal: 0
        });
      });
    }
  } else {
    // Standard flat list style
    filteredApps.forEach((app, filterIdx) => {
      const rankInfo = getRankInProgram(app);
      renderedRows.push({
        type: "row",
        app,
        globalIndex: filterIdx,
        specialtyRank: rankInfo.rank,
        specialtyTotal: rankInfo.total
      });
    });
  }

  return (
    <div className="bg-slate-50 py-10 px-4 min-fluid" id="admin-portal-dashboard">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Admin actions control bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-start">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {lang === "ar" ? "فضاء التدقيق لعمادة كليات المقايسة والتدرج" : "Dean of Graduate Studies Audit Desk Panel"}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === "ar" 
                ? "مراجعة بيداغوجية، تصفية المترشحين، والفرز الآلي للاستحقاق والرغبات" 
                : "Pedagogical screening, candidate management, and real-time Gale-Shapley GPA matching engine."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <button
              type="button"
              onClick={runAutoMeritSorting}
              className="px-4 py-2 bg-official-emerald hover:bg-emerald-650 text-white font-semibold rounded-lg text-xs transition-all duration-150 flex items-center gap-1.5 shadow-xs cursor-pointer"
              id="btn-run-auto-merit"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>{lang === "ar" ? "تشغيل الفرز الاستحقاقي الآلي بالـ GPA" : "Run Auto GPA Placement (Algorithm)"}</span>
            </button>

            <button
              type="button"
              onClick={() => setResetDbTarget(true)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-all duration-150 cursor-pointer"
              id="btn-seed-reset"
            >
              {lang === "ar" ? "تفريغ وتصفير سجلات المترشحين" : "Wipe & Reset Registrations"}
            </button>
          </div>
        </div>

        {/* Dynamic Statistics Widgets Banner */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-start">
          
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[10px] sm:text-xs">
                {lang === "ar" ? "الملفات الكلية المودعة" : "Total Applications"}
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1 block">{totalApps}</span>
            </div>
            <div className="p-2.5 bg-slate-100 rounded-lg text-slate-600 shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[10px] sm:text-xs">
                {lang === "ar" ? "المقبولون بصفة مؤقتة" : "Provisionally Admitted"}
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-800 font-mono mt-1 block">{acceptedApps}</span>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-700 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[10px] sm:text-xs">
                {lang === "ar" ? "الملفات قيد الدراسة حالياً" : "Under review"}
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-700 font-mono mt-1 block">{pendingApps}</span>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg text-amber-600 shrink-0">
              <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[10px] sm:text-xs">
                {lang === "ar" ? "الملفات المرفوضة" : "Candidatures Rejected"}
              </span>
              <span className="text-xl sm:text-2xl font-black text-rose-800 font-mono mt-1 block">{rejectedApps}</span>
            </div>
            <div className="p-2.5 bg-rose-50 rounded-lg text-rose-700 shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between col-span-2 md:col-span-1">
            <div>
              <span className="text-slate-400 block text-[10px] sm:text-xs">
                {lang === "ar" ? "متوسط المعدلات العام" : "Roster Average GPA"}
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-800 font-mono mt-1 block">{averageGpa} <span className="text-xs text-slate-400">/20</span></span>
            </div>
            <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-700 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

        </div>

        {/* ================= CONFIGURATION & SEAT EDITORS & EXPORTS BAR ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-start" id="system-config-section">
          
          {/* Form to edit Academic Year & Seat Limits */}
          <form onSubmit={handleSaveSystemConfig} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-7 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Settings className="w-5 h-5 text-official-blue" />
                <h4 className="text-sm font-extrabold text-slate-800">
                  {lang === "ar" ? "إعدادات السنة الإجمالية والمقاعد البيداغوجية" : "System Configurations & Pedagogical Seats Limits"}
                </h4>
              </div>

              {/* Academic Year Input */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <label className="text-xs font-bold text-slate-700 flex flex-col">
                  <span>{lang === "ar" ? "السنة الدراسية الجارية:" : "Academic Registration Year:"}</span>
                  <span className="text-[10px] font-normal text-slate-400">{lang === "ar" ? "يظهر في كافّة وصولات الطلاب" : "Featured in all digital transcripts"}</span>
                </label>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    value={academicYearInput}
                    onChange={(e) => setAcademicYearInput(e.target.value)}
                    placeholder="مثال: 2025/2026"
                    className="w-full text-xs font-mono font-bold px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-official-blue bg-slate-50 text-center text-slate-800"
                    id="input-academic-year"
                  />
                </div>
              </div>

              {/* Registration Period Dates */}
              <div className="border-t border-slate-100 pt-3.5 space-y-4">
                {/* 1. Master Period - 80% Category */}
                <div className="space-y-3 bg-rose-50/30 p-3 rounded-xl border border-rose-100/70">
                  <h5 className="text-[11px] font-extrabold text-[#ca4a24] uppercase tracking-wider block bg-rose-50 px-2.5 py-1 rounded leading-relaxed text-start">
                    {lang === "ar" ? "🔑 فترات ترشيح ماستر 80% (خريجي الأغواط - السنة الحالية):" : "🔑 Master (80% - Current Laghouat Grads) Registration Period:"}
                  </h5>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-1">
                    {/* Start Date */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5 text-start">
                        {lang === "ar" ? "تاريخ فتح باب الترشح (80%):" : "Master 80% Start Date:"}
                      </label>
                      <input
                        type="date"
                        required
                        value={regMaster80StartDate}
                        onChange={(e) => setRegMaster80StartDate(e.target.value)}
                        className="w-full text-xs font-mono font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#ca4a24] bg-white text-slate-800"
                        id="input-reg-master80-start-date"
                      />
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5 text-start">
                        {lang === "ar" ? "تاريخ غلق باب الترشح (80%):" : "Master 80% End Date:"}
                      </label>
                      <input
                        type="date"
                        required
                        value={regMaster80EndDate}
                        onChange={(e) => setRegMaster80EndDate(e.target.value)}
                        className="w-full text-xs font-mono font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#ca4a24] bg-white text-slate-800"
                        id="input-reg-master80-end-date"
                      />
                    </div>
                  </div>

                  {/* Status Checkbox */}
                  <div className="flex items-center gap-2 text-start">
                    <input
                      type="checkbox"
                      id="checkbox-reg-master80-enabled"
                      checked={regMaster80Enabled}
                      onChange={(e) => setRegMaster80Enabled(e.target.checked)}
                      className="w-3.5 h-3.5 text-[#ca4a24] focus:ring-[#ca4a24] border-slate-300 rounded cursor-pointer"
                    />
                    <label htmlFor="checkbox-reg-master80-enabled" className="text-[11px] font-bold text-slate-700 cursor-pointer select-none">
                      {lang === "ar" ? "تفعيل القيود الزمنية للماستر 80%" : "Enable timeframe limits for Master 80%"}
                    </label>
                  </div>
                </div>

                {/* 2. Master Period - 20% Category */}
                <div className="space-y-3 bg-amber-50/30 p-3 rounded-xl border border-amber-200/50">
                  <h5 className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider block bg-amber-50 px-2.5 py-1 rounded leading-relaxed text-start">
                    {lang === "ar" ? "🔑 فترات ترشيح ماستر 20% (السنوات السابقة وجامعات أخرى):" : "🔑 Master (20% - Previous Years / Other Univs) Registration Period:"}
                  </h5>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-1">
                    {/* Start Date */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5 text-start">
                        {lang === "ar" ? "تاريخ فتح باب الترشح (20%):" : "Master 20% Start Date:"}
                      </label>
                      <input
                        type="date"
                        required
                        value={regMaster20StartDate}
                        onChange={(e) => setRegMaster20StartDate(e.target.value)}
                        className="w-full text-xs font-mono font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-600 bg-white text-slate-800"
                        id="input-reg-master20-start-date"
                      />
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5 text-start">
                        {lang === "ar" ? "تاريخ غلق باب الترشح (20%):" : "Master 20% End Date:"}
                      </label>
                      <input
                        type="date"
                        required
                        value={regMaster20EndDate}
                        onChange={(e) => setRegMaster20EndDate(e.target.value)}
                        className="w-full text-xs font-mono font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-600 bg-white text-slate-800"
                        id="input-reg-master20-end-date"
                      />
                    </div>
                  </div>

                  {/* Status Checkbox */}
                  <div className="flex items-center gap-2 text-start">
                    <input
                      type="checkbox"
                      id="checkbox-reg-master20-enabled"
                      checked={regMaster20Enabled}
                      onChange={(e) => setRegMaster20Enabled(e.target.checked)}
                      className="w-3.5 h-3.5 text-amber-600 focus:ring-amber-600 border-slate-300 rounded cursor-pointer"
                    />
                    <label htmlFor="checkbox-reg-master20-enabled" className="text-[11px] font-bold text-slate-700 cursor-pointer select-none">
                      {lang === "ar" ? "تفعيل القيود الزمنية للماستر 20%" : "Enable timeframe limits for Master 20%"}
                    </label>
                  </div>
                </div>

                {/* 2. L3 Specialty Period */}
                <div className="space-y-3 bg-blue-50/20 p-3 rounded-xl border border-blue-100">
                  <h5 className="text-[11px] font-extrabold text-[#2a4fac] uppercase tracking-wider block bg-blue-50 px-2 py-0.5 rounded leading-relaxed text-start">
                    {lang === "ar" ? "🔑 فترة ترشيح وتوجيه السنة الثالثة ليسانس (L3):" : "🔑 L3 Specialty Orientation Period:"}
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-1">
                    {/* Start Date */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5 text-start">
                        {lang === "ar" ? "تاريخ فتح باب التوجيه L3:" : "L3 Start Date:"}
                      </label>
                      <input
                        type="date"
                        required
                        value={regL3StartDate}
                        onChange={(e) => setRegL3StartDate(e.target.value)}
                        className="w-full text-xs font-mono font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#2a4fac] bg-white text-slate-800"
                        id="input-reg-l3-start-date"
                      />
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5 text-start">
                        {lang === "ar" ? "تاريخ غلق باب التوجيه L3:" : "L3 End Date:"}
                      </label>
                      <input
                        type="date"
                        required
                        value={regL3EndDate}
                        onChange={(e) => setRegL3EndDate(e.target.value)}
                        className="w-full text-xs font-mono font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#2a4fac] bg-white text-slate-800"
                        id="input-reg-l3-end-date"
                      />
                    </div>
                  </div>

                  {/* L3 Status Checkbox */}
                  <div className="flex items-center gap-2 text-start">
                    <input
                      type="checkbox"
                      id="checkbox-reg-l3-enabled"
                      checked={regL3Enabled}
                      onChange={(e) => setRegL3Enabled(e.target.checked)}
                      className="w-3.5 h-3.5 text-[#2a4fac] focus:ring-[#2a4fac] border-slate-300 rounded cursor-pointer"
                    />
                    <label htmlFor="checkbox-reg-l3-enabled" className="text-[11px] font-bold text-slate-705 cursor-pointer select-none">
                      {lang === "ar" ? "تفعيل القيود الزمنية للسنة الثالثة ليسانس حالياً" : "Enable timeframe limits for L3"}
                    </label>
                  </div>
                </div>
              </div>

              {/* Specialty seats limits */}
              <div className="space-y-3">
                <h5 className="text-[11px] font-extrabold text-[#112a61] uppercase tracking-wider block bg-slate-50 px-2.5 py-1 rounded">
                  {lang === "ar" ? "1- تحديد سعة مقاعد التوجيه للماستر (M1):" : "1. Setup Available Seats for Master (M1):"}
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MASTER_PROGRAMS.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-2 p-2 bg-slate-50/50 rounded-lg border border-slate-150">
                      <span className="text-xs font-semibold text-slate-700 truncate max-w-[150px] sm:max-w-[200px] block" title={lang === "ar" ? p.nameAr : p.nameEn}>
                        {lang === "ar" ? p.nameAr.split(" (")[0] : p.nameEn}
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        required
                        value={masterCapacities[p.id] ?? p.capacity}
                        onChange={(e) => setMasterCapacities({ ...masterCapacities, [p.id]: Number(e.target.value) })}
                        className="w-16 px-2 py-1 text-center font-mono text-xs font-extrabold rounded-lg border border-slate-300 bg-white text-slate-800"
                        id={`capacity-master-${p.id}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h5 className="text-[11px] font-extrabold text-[#112a61] uppercase tracking-wider block bg-slate-50 px-2.5 py-1 rounded">
                  {lang === "ar" ? "2- تحديد سعة الشعب والوفود للسنة الثالثة ليسانس (L3):" : "2. Setup Available Seats for L3 Specialties:"}
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {L3_SPECIALTIES.map((s) => (
                    <div key={s.id} className="flex items-center justify-between gap-2 p-2 bg-slate-50/50 rounded-lg border border-slate-150">
                      <span className="text-xs font-semibold text-slate-700 truncate max-w-[150px] sm:max-w-[200px] block">
                        {lang === "ar" ? s.nameAr : s.nameEn}
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        required
                        value={l3Capacities[s.id] ?? s.capacity}
                        onChange={(e) => setL3Capacities({ ...l3Capacities, [s.id]: Number(e.target.value) })}
                        className="w-16 px-2 py-1 text-center font-mono text-xs font-extrabold rounded-lg border border-slate-300 bg-white text-slate-800"
                        id={`capacity-l3-${s.id}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between gap-2 border-t border-slate-100 mt-2">
              <span className="text-[10px] text-slate-400">
                {lang === "ar" ? "* تغير السعة البيداغوجية يغير شروط الاستيعاب وجريان خوارزمية الفرز فوراً." : "* Modifying capacity changes matching constraints immediately."}
              </span>
              <button
                type="submit"
                className="px-4 py-2 bg-[#12255c] hover:bg-[#1a388a] text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
                id="btn-save-system-config"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{lang === "ar" ? "حفظ التحديثات والتبني 💾" : "Apply & Save Configurations"}</span>
              </button>
            </div>
            
            {capacitySavedToast && (
              <p className="text-center text-xs font-bold text-emerald-700 mt-2 bg-emerald-50 py-1 px-4 rounded-lg border border-emerald-200 animate-pulse">
                {lang === "ar" ? "✓ تم حفظ التحديثات بنجاح وإعادة معالجة السعة البيداغوجية!" : "✓ Settings applied successfully and database records synchronized!"}
              </p>
            )}
          </form>

          {/* Download & Export Admitted Lists to Excel / CSV */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-15 xl:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Download className="w-5 h-5 text-emerald-700" />
                <h4 className="text-sm font-extrabold text-slate-800">
                  {lang === "ar" ? "تحميل قوائم الطلبة المقبولين (Excel)" : "Download Admitted Lists (Excel)"}
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {lang === "ar" 
                  ? "تحميل كشوف الطلبة المقبولين ومخطط التوجيه لكل شعبة منفصلة بشكل متوافق تماماً مع Microsoft Excel لتحضير القوائم الإدارية الورقية الرسمية." 
                  : "Export Excel-compatible sheets containing lists of provisionally admitted students for department board reviews."}
              </p>

              {/* Specialty lists cards */}
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {/* Master export list */}
                <div className="space-y-2">
                  <div className="text-[10px] font-extrabold text-[#ca4a24] uppercase tracking-wider block bg-rose-50/50 px-2 py-0.5 rounded border border-rose-100/60 font-mono text-start">
                    {lang === "ar" ? "قوائم مسارات الماستر (M1):" : "Master Admissions lists:"}
                  </div>
                  {MASTER_PROGRAMS.map((p) => {
                    const admittedCount = applications.filter(app => app.status === ApplicationStatus.ACCEPTED && app.acceptedProgramId === p.id).length;
                    const capacitySeat = p.capacity;
                    return (
                      <div key={p.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-150 text-xs text-start">
                        <div className="min-w-0 pr-1">
                          <span className="font-bold text-slate-700 block truncate text-xs" title={lang === "ar" ? p.nameAr : p.nameEn}>
                            {lang === "ar" ? p.nameAr.split(" (")[0] : p.nameEn}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold block">
                            {lang === "ar" ? `المقبولون: ${admittedCount} من ${capacitySeat} مقعد` : `Admitted: ${admittedCount} of ${capacitySeat}`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleExportToExcel(p.id, lang === "ar" ? p.nameAr : p.nameEn, "master")}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 transition-all flex items-center justify-center cursor-pointer shrink-0"
                          title={lang === "ar" ? "تحميل ملف Excel" : "Export Excel Sheet"}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* L3 export list */}
                <div className="space-y-2 pt-2">
                  <div className="text-[10px] font-extrabold text-[#2a4fac] uppercase tracking-wider block bg-blue-50/50 px-2 py-0.5 rounded border border-blue-100/60 font-mono text-start">
                    {lang === "ar" ? "قوائم مسارات السنة الثالثة (L3):" : "L3 Admissions lists:"}
                  </div>
                  {L3_SPECIALTIES.map((s) => {
                    const admittedCount = applications.filter(app => app.status === ApplicationStatus.ACCEPTED && app.acceptedProgramId === s.id).length;
                    const capacitySeat = s.capacity;
                    return (
                      <div key={s.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-150 text-xs text-start">
                        <div className="min-w-0 pr-1">
                          <span className="font-bold text-slate-700 block truncate text-xs">
                            {lang === "ar" ? s.nameAr : s.nameEn}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold block">
                            {lang === "ar" ? `المقبولون: ${admittedCount} من ${capacitySeat} مقعد` : `Admitted: ${admittedCount} of ${capacitySeat}`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleExportToExcel(s.id, lang === "ar" ? s.nameAr : s.nameEn, "l3_specialty")}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 transition-all flex items-center justify-center cursor-pointer shrink-0"
                          title={lang === "ar" ? "تحميل ملف Excel" : "Export Excel Sheet"}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
            <div className="text-[10px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 leading-normal text-start">
              {lang === "ar" 
                ? "💡 بعد التحميل، يمكنك فتح الملف مباشرة في Microsoft Excel أو Google Sheets." 
                : "💡 Downloaded reports utilize a standard UTF-8 BOM encoding for seamless Arabic formatting in Excel."}
            </div>
          </div>

        </div>

        {/* Academic Placement Rules & Conditions Panel */}
        <div className="bg-gradient-to-br from-indigo-50/40 via-white to-emerald-50/20 p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm text-start space-y-4" id="placement-rules-panel">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-official-blue" />
            <h4 className="text-sm font-extrabold text-slate-800">
              {lang === "ar" ? "قواعد ومعايير شروط التوجيه والتصنيف البيداغوجي المعتمدة لكل طور:" : "Official Pedagogical Criteria & Ranking Conditions Per Academic Phase:"}
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Master Track Rules */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2" id="rule-card-master">
              <div className="flex items-center gap-2 pb-2 border-b border-rose-100">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <h5 className="font-bold text-rose-800 text-xs">
                  {lang === "ar" ? "طور الماستر (1st Year Postgrad - M1):" : "Postgraduate Master Stream Conditions:"}
                </h5>
              </div>
              <ul className="text-[11px] text-slate-600 space-y-1.5 list-disc list-inside">
                <li>
                  {lang === "ar" 
                    ? "الترشح مفتوح لحاملي شهادة ليسانس دفعة 2026 في التخصصات المتوافقة بيداغوجياً."
                    : "Admission open for 2026 Licence graduates holding matching academic streams."}
                </li>
                <li>
                  {lang === "ar"
                    ? "معدل الترتيب البيداغوجي المعتمد = معدل ليسانس تخرج × معامل التوافق البيداغوجي للشعبة."
                    : "Merit Score Formula = Cumulative Graduation GPA × Compatibility Coeff."}
                </li>
                <li>
                  {lang === "ar"
                    ? "درجات التوافق: تخصص مطابق تماماً = 1.00 • تخصص قريب = 0.80 أو 0.90 • غير متوافق = 0.00 (مرفوض تلقائياً)."
                    : "Compatibility Weights: Direct matches = 1.00; Kindred/close majors = 0.80-0.90; Unrelated = 0.00 (Rejected)."}
                </li>
                <li>
                  {lang === "ar"
                    ? "عدد المقاعد البيداغوجية المتاحة لكل تخصص ماستر محدد بـ 4 طلاب فقط."
                    : "Pedagogical capacity is strictly limited to 4 available seats per Master specialty."}
                </li>
                <li>
                  {lang === "ar"
                    ? "يتم تلبية الرغبات الـ 4 ترتيبياً على أساس معدل الاستحقاق الأعلى وصولاً للحد الأقصى للسعة البيداغوجية المتاحة لكل شعبة."
                    : "Preferences (1-4) are matched via a stable assignment algorithm up to the official seat capacities."}
                </li>
              </ul>
            </div>

            {/* L3 Track Rules */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2" id="rule-card-l3">
              <div className="flex items-center gap-2 pb-2 border-b border-indigo-100">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <h5 className="font-bold text-indigo-800 text-xs">
                  {lang === "ar" ? "طور السنة الثالثة ليسانس (3rd Year Undergrad - L3 Specialty):" : "Undergraduate L3 Specialty Stream Conditions:"}
                </h5>
              </div>
              <ul className="text-[11px] text-slate-600 space-y-1.5 list-disc list-inside">
                <li>
                  {lang === "ar"
                    ? "يستهدف طلبة السنة الثانية (L2) لتوجيههم وتوطينهم في تخصصات ومسارات السنة الثالثة ليسانس."
                    : "Targeting second-year (L2) students transitioning towards specific L3 majors."}
                </li>
                <li>
                  {lang === "ar"
                    ? "معدل الترتيب التوجيهي المعتمد = (معدل السنة أولى L1 + معدل السنة ثانية L2) / 2."
                    : "Merit Score Formula = (Year 1 L1 Average + Year 2 L2 Average) / 2."}
                </li>
                <li>
                  {lang === "ar"
                    ? "لا يتم تطبيق معاملات التوافق البيداغوجي هنا لكون الطور يمثل توجيه شعب داخلي جامعياً موحداً."
                    : "No compatibility coefficients are applied as this is a standardized inner university orientation."}
                </li>
                <li>
                  {lang === "ar"
                    ? "يرتب الطلبة ترتيباً تنازلياً، ثم يوجهون لتلبية رغباتهم الأربعة حسب الاستحقاق وقدرة استيعاب وتأطير الأفواج البيداغوجية."
                    : "Students are strictly sorted, then allocated into their choices (1-4) by merit up to limits."}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Filtering & Listing Controls Grid */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 text-start">
            <h4 className="text-sm font-bold text-slate-800">
              {lang === "ar" ? "قائمة المرشحين التفصيلية والترتيب المفصل" : "Detailed Candidates Registrar "}
            </h4>
            
            <div className="flex flex-wrap gap-2.5 justify-end">
              
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={lang === "ar" ? "ابحث عن مترشح بالاسم/الرقم..." : "Search name/ID..."}
                  className="text-xs px-3 py-2 pr-8 rounded-lg border border-slate-300 w-52 focus:outline-none focus:ring-1 focus:ring-official-blue text-center font-sans"
                  id="search-candidate-list"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
              </div>

              {/* Track / Stream Filter */}
              <select
                value={trackFilter}
                onChange={(e) => setTrackFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white cursor-pointer font-bold text-slate-800"
                id="filter-candidate-track"
              >
                <option value="all">{lang === "ar" ? "كل الأطوار (ماستر / L3)" : "All Tracks (Master / L3)"}</option>
                <option value="master">{lang === "ar" ? "طور الماستر" : "Master Track"}</option>
                <option value="l3_specialty">{lang === "ar" ? "طور السنة الثالثة ليسانس" : "L3 Specialty Placement"}</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white cursor-pointer font-bold"
                id="filter-candidate-status"
              >
                <option value="all">{lang === "ar" ? "كل الحالات البيداغوجية" : "All status"}</option>
                <option value={ApplicationStatus.PENDING}>{lang === "ar" ? "قيد الدراسة فقط" : "Under review only"}</option>
                <option value={ApplicationStatus.ACCEPTED}>{lang === "ar" ? "المقبولين فقط" : "Admitted only"}</option>
                <option value={ApplicationStatus.REJECTED}>{lang === "ar" ? "المرفوضين فقط" : "Rejected only"}</option>
              </select>

              {/* Specialty Filter */}
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white cursor-pointer font-bold"
                id="filter-licence-specialty"
              >
                <option value="all">{lang === "ar" ? "كل التخصصات (ليسانس)" : "All Licence Specialties"}</option>
                {LICENCE_SPECIALTIES.map(s => {
                  const specNamePart = getSpecName(s).split(" (")[0];
                  return (
                    <option key={s.id} value={s.id}>{specNamePart}</option>
                  );
                })}
              </select>

              {/* GPA Sort Trigger */}
              <button
                type="button"
                onClick={() => {
                  if (sortByGpa === "desc") setSortByGpa("asc");
                  else if (sortByGpa === "asc") setSortByGpa("none");
                  else setSortByGpa("desc");
                }}
                className={`text-xs px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1 cursor-pointer transition-all ${
                  sortByGpa !== "none" ? "bg-blue-50 border-blue-200 text-official-blue" : "border-slate-300 text-slate-700"
                }`}
              >
                <span>{lang === "ar" ? "ترتيب حسب المعدل:" : "Order by GPA:"}</span>
                <span className="underline font-mono">
                  {sortByGpa === "desc" ? (lang === "ar" ? "تنازلي ↓" : "Descending ↓") : sortByGpa === "asc" ? (lang === "ar" ? "تصاعدي ↑" : "Ascending ↑") : (lang === "ar" ? "افتراضي" : "Default")}
                </span>
              </button>

              {/* Specialty Grouping & Ranking Toggle */}
              <button
                type="button"
                onClick={() => setGroupBySpecialty(!groupBySpecialty)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1 cursor-pointer transition-all ${
                  groupBySpecialty ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "border-slate-300 text-slate-700"
                }`}
                id="btn-group-by-specialty"
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>
                  {lang === "ar" 
                    ? (groupBySpecialty ? "ترتيب تخصصي: مفعل ✓" : "ترتيب حسب كل تخصص") 
                    : (groupBySpecialty ? "Grouped by Specialty: ON ✓" : "Sort/Rank by Specialty")}
                </span>
              </button>

            </div>
          </div>

          {/* Roster database table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-right text-xs border-collapse font-sans" style={{ direction: lang === "ar" ? "rtl" : "ltr" }}>
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-start">
                  <th className="p-4 w-12 text-center">{lang === "ar" ? "الرقم" : "#"}</th>
                  <th className="p-4">{lang === "ar" ? "اسم ولقب الطالب" : "Candidate"}</th>
                  <th className="p-4">{lang === "ar" ? "رقم الطالب BAC" : "BAC ID"}</th>
                  <th className="p-4">{lang === "ar" ? "تخصص ليسانس" : "Licence Specialty"}</th>
                  <th className="p-4 text-center">{lang === "ar" ? "معدل التخرج" : "GPA /20"}</th>
                  <th className="p-4">{lang === "ar" ? "حالة القبول" : "Orientation Verdict"}</th>
                  <th className="p-4 text-center">{lang === "ar" ? "إجراءات التدقيق" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {renderedRows.length > 0 ? (
                  renderedRows.map((item, idx) => {
                    if (item.type === "header") {
                      return (
                        <tr key={`header-${idx}`} className="bg-slate-100/90 border-y border-slate-200 select-none">
                          <td colSpan={7} className="p-3 text-start font-extrabold text-xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${
                                  item.track === "master" ? "bg-rose-500" : item.track === "l3_specialty" ? "bg-indigo-500" : "bg-amber-500"
                                }`} />
                                <span className="text-slate-800 text-sm font-black">{item.programName}</span>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                item.track === "master" 
                                  ? "bg-rose-50 border-rose-100 text-rose-800" 
                                  : item.track === "l3_specialty" 
                                    ? "bg-indigo-50 border-indigo-100 text-indigo-800" 
                                    : "bg-amber-50 border-amber-100 text-amber-800"
                              }`}>
                                {lang === "ar" ? `المقبولون الموجهون: ${item.count} طلبة` : `Oriented: ${item.count} candidates`}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    const { app, globalIndex, specialtyRank } = item;
                    const specialtyObj = LICENCE_SPECIALTIES.find(s => s.id === app.licenceSpecialty);
                    const matchedSpecName = specialtyObj ? getSpecName(specialtyObj).split(" (")[0] : app.customLicenceSpecialty;

                    return (
                      <tr 
                        key={app.id} 
                        className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors text-start ${
                          app.status === ApplicationStatus.ACCEPTED ? "bg-emerald-50/15" : app.status === ApplicationStatus.REJECTED ? "bg-rose-50/10" : ""
                        }`}
                      >
                        <td className="p-4 text-center">
                          {specialtyRank > 0 ? (
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-sm font-black text-xs ${
                              specialtyRank === 1 
                                ? "bg-amber-100 text-amber-950 border border-amber-300 ring-2 ring-amber-200" 
                                : specialtyRank === 2
                                  ? "bg-slate-200 text-slate-800 border border-slate-300"
                                  : specialtyRank === 3
                                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                                    : "bg-indigo-50 text-indigo-900 border border-indigo-100"
                            }`} title={lang === "ar" ? `المرتبة ${specialtyRank} في التوجيه` : `Rank #${specialtyRank}`}>
                              {specialtyRank}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono font-bold">
                              {globalIndex + 1}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-slate-800 text-sm">{app.firstNameAr} {app.lastNameAr}</p>
                          <p className="text-[10px] text-slate-400 font-sans tracking-wide mt-0.5">{app.firstNameEn} {app.lastNameEn}</p>
                        </td>
                        <td className="p-4 font-mono text-slate-500 font-semibold select-all font-sans">
                          {app.nationalStudentId}
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-slate-700">{matchedSpecName}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[190px]">{app.university.split(" - ")[0]}</p>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <span className="font-sans font-mono text-sm sm:text-base font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 block">
                              {safeFormatGpa(app.licenceGpa, 2)}
                            </span>
                            {app.applicationType === "l3_specialty" && (
                              <span className="text-[9px] text-slate-500 font-mono whitespace-nowrap block bg-indigo-50 px-1 py-0.2 rounded border border-indigo-100 font-bold">
                                L1:{safeFormatGpa(app.l1Gpa ?? app.licenceGpa, 1)} | L2:{safeFormatGpa(app.l2Gpa ?? app.licenceGpa, 1)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-xs font-sans">
                          {app.status === ApplicationStatus.ACCEPTED ? (() => {
                            const comp = app.acceptedProgramId ? getCompatibilityDetails(app.acceptedProgramId, app.licenceSpecialty) : null;
                            const adjustedGpa = comp ? app.licenceGpa * comp.coeff : app.licenceGpa;
                            return (
                              <div className="space-y-1">
                                <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                  {lang === "ar" ? "مقبول بصفة مؤقتة" : "Provisionally admitted"}
                                </span>
                                <p className="text-[10px] text-emerald-950 font-bold max-w-[170px] truncate animate-fade-in" title={currentProgramName(app.acceptedProgramId)}>
                                  {lang === "ar" ? "رغبة" : "Choice"} {((app.acceptedChoiceIndex ?? 0) + 1)}: {currentProgramName(app.acceptedProgramId).split(" (")[0]}
                                </p>
                                {comp && (
                                  <p className="text-[9px] text-slate-500 font-medium whitespace-nowrap">
                                    {lang === "ar" 
                                      ? `المعامل: ${safeFormatGpa(comp.coeff, 2)} (رتبة ${comp.rank}) • درجة الترتيب: ${safeFormatGpa(adjustedGpa, 2)}`
                                      : `Coeff: ${safeFormatGpa(comp.coeff, 2)} (Rank ${comp.rank}) • Merit GPA: ${safeFormatGpa(adjustedGpa, 2)}`}
                                  </p>
                                )}
                              </div>
                            );
                          })() : app.status === ApplicationStatus.REJECTED ? (
                            <div className="space-y-1">
                              <span className="inline-block bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                {lang === "ar" ? "مرفوض بيداغوجياً" : "Rejected"}
                              </span>
                              <p className="text-[10px] text-rose-950 truncate max-w-[170px]" title={app.rejectionReason}>
                                {app.rejectionReason}
                              </p>
                            </div>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">
                              {lang === "ar" ? "قيد الدراسة والتدقيق" : "Under screening"}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedApp(app)}
                              className="p-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-lg transition-all cursor-pointer"
                              title="معاينة الملف"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteCandidateTarget(app)}
                              className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-all cursor-pointer"
                              title="حذف الملف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400">
                      <p className="font-bold text-slate-500">
                        {lang === "ar" ? "لا توجد أي ملفات تطابق مرشحات البحث الحالية." : "No records match criteria."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* MODAL 1: Candidate szczegółowy detail review modal drawer */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs text-start" id="admin-detail-modal">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col font-sans" style={{ direction: lang === "ar" ? "rtl" : "ltr" }}>
            
            {/* Modal header details */}
            <div className="bg-official-blue px-6 py-4 text-white flex items-center justify-between border-b-4 border-official-emerald shrink-0">
              <div>
                <span className="text-[10px] bg-[#12255c] text-official-emerald font-mono font-bold px-2 py-0.5 rounded">
                  {lang === "ar" ? "رقم المترشح الموحد:" : "Application ID:"} {selectedApp.id}
                </span>
                <h4 className="text-base font-bold mt-1.5">
                  {lang === "ar" ? "معاينة ملف بيداغوجي:" : "Pedagogical review:"} {selectedApp.firstNameAr} {selectedApp.lastNameAr}
                </h4>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedApp(null)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-grow text-xs sm:text-sm font-sans">
              
              {/* Score card info wrapper */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block text-[10px]">{lang === "ar" ? "الاسم الكامل بالخط اللاتيني:" : "Full Name (Latin):"}</span>
                  <span className="font-bold text-slate-800 font-sans mt-0.5 block">{selectedApp.firstNameEn} {selectedApp.lastNameEn}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">
                    {selectedApp.applicationType === "l3_specialty" 
                      ? (lang === "ar" ? "معدل التوجيه الترتيبي العام:" : "Overall Orientation GPA:")
                      : (lang === "ar" ? "معدل الليسانس العام:" : "Overall Licence GPA:")}
                  </span>
                  <span className="font-mono text-base font-black text-official-emerald bg-emerald-100/40 px-2 py-0.5 border border-emerald-200 rounded inline-block">
                    {safeFormatGpa(selectedApp.licenceGpa, 2)} / 20
                  </span>
                </div>
                {selectedApp.applicationType === "l3_specialty" ? (
                  <>
                    <div>
                      <span className="text-slate-400 block text-[10px]">{lang === "ar" ? "تفاصيل المسار ومعدلات الأطوار:" : "Yearly GPA breakdown:"}</span>
                      <span className="font-sans text-slate-800 font-bold block mt-0.5">
                        L1: <span className="font-mono text-indigo-700 font-black">{safeFormatGpa(selectedApp.l1Gpa ?? selectedApp.licenceGpa, 2)}</span>
                        {" | "}
                        L2: <span className="font-mono text-indigo-700 font-black">{safeFormatGpa(selectedApp.l2Gpa ?? selectedApp.licenceGpa, 2)}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">{lang === "ar" ? "الشعبة والجذع المشترك:" : "Main Track / Origin:"}</span>
                      <span className="font-bold text-slate-800 block">{lang === "ar" ? "ST - علوم وتكنولوجيا" : "ST - Science & Tech"}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-slate-400 block text-[10px]">{lang === "ar" ? "تخصص ودراسة الليسانس:" : "Licence Specialty:"}</span>
                      <span className="font-bold text-slate-800 font-sans">
                        {LICENCE_SPECIALTIES.find(s => s.id === selectedApp.licenceSpecialty) ? getSpecName(LICENCE_SPECIALTIES.find(s => s.id === selectedApp.licenceSpecialty)!) : selectedApp.customLicenceSpecialty}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">{lang === "ar" ? "مؤسسة التخرج تتبع:" : "Graduated from University:"}</span>
                      <span className="font-bold text-slate-800 font-sans">{selectedApp.university}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Handed electronic documents audit checks */}
              {selectedApp.applicationType === "master" && !isAppMaster80Percent(selectedApp) ? (
                <div>
                  <h5 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 mb-2">
                    {lang === "ar" ? "تدقيق المستندات والمرفقات الرقمية:" : "Dossier Documents Audit Checklist:"}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-medium text-slate-700">
                    {([
                      { key: "transcript", labelAr: "كشف نقاط تخرج الليسانس:", labelEn: "Bachelor transcripts:", format: "PDF" },
                      { key: "diploma", labelAr: "شهادة النجاح للثنائية ليسانس:", labelEn: "Licence success certificate:", format: "PDF" },
                      { key: "idCard", labelAr: "بطاقة الهوية الوطنية والوجهين:", labelEn: "National Identity Document:", format: "Image" },
                      { key: "motivation", labelAr: "رسالة الدافع (للإدماج بالماستر):", labelEn: "Motivation Letter (Optional):", format: "PDF" }
                    ] as { key: keyof DocumentUploads; labelAr: string; labelEn: string; format: string }[]).map(({ key, labelAr, labelEn, format }) => {
                      const isUploaded = selectedApp.documents[key];
                      const fileName = selectedApp.uploadedFileNames?.[key] || `${key}_dossier_${selectedApp.id.replace("-", "_")}.${format.toLowerCase() === "pdf" ? "pdf" : "png"}`;
                      return (
                        <div key={key} className="p-3 border rounded-xl bg-slate-50 flex flex-col justify-between gap-2 transition hover:border-slate-300">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-slate-700">{lang === "ar" ? labelAr : labelEn}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold whitespace-nowrap ${
                              isUploaded 
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                                : "bg-slate-100 text-slate-400 border border-slate-200"
                            }`}>
                              {isUploaded ? `✓ ${format} OK` : (lang === "ar" ? "غير مرفوع" : "Not uploaded")}
                            </span>
                          </div>
                          
                          {isUploaded ? (
                            <div className="flex items-center justify-between gap-1.5 border-t border-slate-200/60 pt-2 mt-1">
                              <span className="text-[10px] text-slate-400 truncate max-w-[130px] font-mono" title={fileName}>
                                {fileName}
                              </span>
                              <div className="flex gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => alert(lang === "ar" ? `تحميل وعرض المستند: ${fileName}` : `Downloading/Viewing: ${fileName}`)}
                                  className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-md border border-slate-200 hover:border-emerald-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                                  title={lang === "ar" ? "معاينة الملف" : "Preview file"}
                                >
                                  <Download className="w-3 h-3" />
                                  <span>{lang === "ar" ? "تحميل" : "View"}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteDocTarget({ app: selectedApp, key })}
                                  className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 rounded-md cursor-pointer transition-all"
                                  title={lang === "ar" ? "حذف هذا الملف" : "Delete this file"}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-[10px] text-slate-400 italic mt-1 bg-white p-1 rounded border border-dashed text-center">
                              {lang === "ar" ? "لا يوجد ملف مسجّل" : "No file registered"}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <h5 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 mb-2">
                    {lang === "ar" ? "تدقيق المستندات والمرفقات الرقمية:" : "Dossier Documents Audit Checklist:"}
                  </h5>
                  <div className="p-3 bg-blue-50/50 border border-blue-100 text-[#12255c] rounded-xl text-xs font-semibold text-start leading-relaxed animate-fade-in">
                    ℹ️ {selectedApp.applicationType === "l3_specialty" ? (
                      lang === "ar" 
                        ? "توجيه الطور الأول ليسانس: نظام التوجيه الأكاديمي الرقمي يستند على الكشوف المؤتمتة ودون الحاجة لرفع مستندات يدوياً." 
                        : "First-cycle L3 placement: Placement parameters based purely on automated transcripts, documentation uploads on Master only."
                    ) : (
                      lang === "ar"
                        ? "ترشح فئة 80% (خريجو الأغواط دفعة 2026): معفي من رفع الملفات؛ يتم سحب البيانات مباشرة من قاعدة البيانات الرسمية المدمجة بوزارة التعليم العالي."
                        : "Master 80% Quota (Laghouat grads 2026): Exempt from uploading files. Academic records are fetched automatically from parent university database logs."
                    )}
                  </div>
                </div>
              )}

              {/* choices with compatibility factors */}
              <div>
                <h5 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 mb-2">
                  {lang === "ar" ? "الرغبات الأربع ومعدلات الترتيب البيداغوجي (حسب معامل التوافق):" : "Candidate Preferences and Compatibility Screening:"}
                </h5>
                <div className="space-y-2">
                  {selectedApp.choices.map((choiceId, idx) => {
                    const details = getChoiceLabelAndDetails(choiceId, selectedApp);
                    return (
                      <div key={idx} className="p-3 border rounded-xl bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:bg-slate-100/50 transition">
                        <div>
                          <p className="text-xs font-bold text-slate-800">{lang === "ar" ? "رغبة" : "Choice"} {idx + 1}: {details.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">UID: {choiceId} • {lang === "ar" ? "السعة القصوى:" : "Max capacity:"} {details.capacity}</p>
                          <p className="text-[10px] font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.5 mt-1 rounded inline-block">
                            {lang === "ar" ? `معدل الترتيب البيداغوجي: ${safeFormatGpa(details.adjustedGpa, 2)} / 20` : `Merit GPA score: ${safeFormatGpa(details.adjustedGpa, 2)} / 20`}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-[9px] sm:text-[10px]">
                          <span className={`px-1.5 py-0.5 rounded font-extrabold ${details.isAllowed ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                            {details.isAllowed ? details.label : (lang === "ar" ? "غير مطابق" : "Incompatible")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Deciding layout admin controls */}
              <div className="border-t border-slate-200/80 pt-5 mt-4 space-y-4">
                <h5 className="text-xs font-bold text-rose-950 flex items-center gap-1 bg-amber-50 p-2 rounded">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>{lang === "ar" ? "قرار التوجيه البيداغوجي المباشر:" : "Direct Orientation Panel Placement Decision:"}</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-start">
                  
                  {/* Accept manual trigger choice */}
                  <div className="p-4 border rounded-xl bg-emerald-50/25 border-emerald-100 space-y-3">
                    <span className="text-xs font-bold text-emerald-950 block">✓ {lang === "ar" ? "منح القبول الفوري بالتخصص:" : "Accept Candidate into specialty:"}</span>
                    
                    <div className="grid grid-cols-2 gap-1.5">
                      {selectedApp.choices.map((choiceId, idx) => {
                        const mName = currentProgramName(choiceId, selectedApp).split(" (")[0];
                        const isCurrentlySelectedAsVerdict = 
                          selectedApp.status === ApplicationStatus.ACCEPTED && 
                          selectedApp.acceptedChoiceIndex === idx;

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleAcceptManual(selectedApp, idx)}
                            className={`p-2 rounded text-right text-[10px] font-bold border transition cursor-pointer flex flex-col justify-between h-14 ${
                              isCurrentlySelectedAsVerdict
                                ? "bg-emerald-700 text-white border-emerald-700 shadow-xs font-black"
                                : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                            }`}
                          >
                            <span>{lang === "ar" ? "رغبة" : "Vœu"} {idx + 1}</span>
                            <span className="truncate max-w-[120px] block font-normal text-[9px]">{mName}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reject manual trigger option */}
                  <div className="p-4 border rounded-xl bg-rose-50/15 border-rose-100 space-y-3">
                    <span className="text-xs font-bold text-rose-900 block">🛑 {lang === "ar" ? "رفض بيداغوجي للترشح:" : "Reject Application:"}</span>
                    
                    <div>
                      <select
                        value={rejectionReasonInput}
                        onChange={(e) => setRejectionReasonInput(e.target.value)}
                        className="w-full text-xs px-2 py-2 rounded border border-slate-200 bg-white"
                      >
                        <option value="">{lang === "ar" ? "-- اختر تبرير الرفض البيداغوجي --" : "-- Select rejection justification --"}</option>
                        {lang === "ar" ? (
                          <>
                            <option value="المعدل العام للتخرج (GPA) أقل من النسبة المئوية الدنيا للعلامة الاستحقاقية في كل الرغبات.">المعدل العام غير كافي للرغبات الأربع</option>
                            <option value="عدم التوافق التام لبنود ومواد شهادة ليسانس المحصل عليها مع الشروط المسبقة لشعبة الماستر المختارة.">تخصص وملف ليسانس غير متوافق</option>
                            <option value="وجود تزوير أو تباين صريح بين الوثائق المدونة في المنصة والمقاييس المسجلة رقمياً بملحق النقاط الدراسي.">الملف المرفق غير مقروء أو تباين البيانات</option>
                          </>
                        ) : (
                          <>
                            <option value="Overall graduation GPA does not reach minimum merit levels across the 4 choices.">GPA score too low</option>
                            <option value="Licence major background lacks core scientific compatible prerequisites.">Academic major incompatibilities</option>
                          </>
                        )}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRejectManual(selectedApp)}
                      className="w-full py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-[10px] rounded transition cursor-pointer"
                    >
                      {lang === "ar" ? "إرسال قرار الرفض البيداغوجي المبرر" : "Commit Rejection Verdict"}
                    </button>
                  </div>

                </div>

                {/* Option C: Revert state to pending or delete dossier */}
                <div className="flex justify-between items-center gap-2 pt-3 border-t border-slate-100 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setDeleteCandidateTarget(selectedApp)}
                    className="px-4 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-extrabold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                    id="btn-delete-selected-app"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>{lang === "ar" ? "حذف الملف البيداغوجي نهائياً" : "Delete dossier permanently"}</span>
                  </button>

                  {selectedApp.status !== ApplicationStatus.PENDING && (
                    <button
                      type="button"
                      onClick={() => handleRevertPending(selectedApp)}
                      className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-all cursor-pointer"
                    >
                      {lang === "ar" ? "إعادة حالة الملف إلى: قيد التدقيق والمذاكرة" : "Reset application status to: Screening / Pending"}
                    </button>
                  )}
                </div>
              </div>

            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-end shrink-0 gap-2">
              <button 
                type="button" 
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                {lang === "ar" ? "إغلاق النافذة" : "Close"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: Logging output from automated merit sorting algorithm simulation */}
      {showLogModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-55 flex items-center justify-center p-4 backdrop-blur-xs text-right" id="algo-log-modal">
          <div className="bg-slate-950 text-slate-105 rounded-2xl border border-slate-800 shadow-2xl max-w-3xl w-full flex flex-col max-h-[85vh]">
            
            <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-bold">
                  {lang === "ar" ? "تقرير تشغيل نظام التوجيه والفرز البيداغوجي الآلي بالـ GPA" : "Automated Placement Audit Log (Gale-Shapley Algorithm)"}
                </h4>
              </div>
              <button 
                type="button" 
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 font-mono text-xs overflow-y-auto flex-grow leading-relaxed space-y-1 block bg-black text-emerald-400 select-all" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
              {algoLog.map((line, idx) => (
                <div key={idx} className={line.startsWith("👤") || line.startsWith("Analyzing:") ? "text-white font-bold mt-3" : line.startsWith("   🎯") ? "text-emerald-300 font-bold" : line.startsWith("   ❌") || line.startsWith("   🛑") ? "text-rose-400 font-medium" : "text-emerald-400/90"}>
                  {line}
                </div>
              ))}
            </div>

            <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="px-5 py-2 hover:bg-white hover:text-slate-950 border border-slate-600 rounded-xl transition text-xs font-bold text-white cursor-pointer"
              >
                {lang === "ar" ? "الموافقة وإغلاق التقرير الفني" : "Close Audit Logs"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Floating error notification toast */}
      {downloadErrorToast && (
        <div className="fixed bottom-5 right-5 left-5 sm:left-auto sm:w-96 bg-rose-50 border border-rose-200 p-4 rounded-xl shadow-lg z-50 flex items-start gap-3 animate-fade-in" style={{ direction: lang === "ar" ? "rtl" : "ltr" }}>
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-start">
            <p className="text-xs font-extrabold text-slate-800">
              {lang === "ar" ? "تنبيه نظام الإدارة" : "Coordinator Panel Notification"}
            </p>
            <p className="text-xs text-rose-700 mt-1 font-medium">
              {downloadErrorToast}
            </p>
          </div>
          <button 
            onClick={() => setDownloadErrorToast(null)} 
            className="text-slate-400 hover:text-slate-600 text-xs font-bold shrink-0 self-center"
          >
            ✕
          </button>
        </div>
      )}

      {/* Custom Clean Confirmation Modals (to avoid iframe confirm blocks) */}
      {(deleteCandidateTarget || deleteDocTarget || resetDbTarget) && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in" style={{ direction: lang === "ar" ? "rtl" : "ltr" }}>
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up text-start">
            <div className="p-6">
              <div className="flex items-center gap-3 text-rose-600 mb-4">
                <div className="p-3 bg-rose-50 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                </div>
                <h4 className="text-base font-black text-slate-800">
                  {lang === "ar" ? "تأكيد الإجراء الهام" : "Confirm Important Action"}
                </h4>
              </div>

              <div className="text-slate-650 text-xs font-semibold leading-relaxed space-y-2">
                {deleteCandidateTarget && (
                  <p>
                    {lang === "ar"
                      ? `هل أنت متأكد من حذف ملف المترشح "${deleteCandidateTarget.firstNameAr} ${deleteCandidateTarget.lastNameAr}" نهائياً من قاعدة البيانات؟ لا يمكن التراجع عن هذا الإجراء.`
                      : `Are you sure you want to permanently delete the application dossier of "${deleteCandidateTarget.firstNameEn} ${deleteCandidateTarget.lastNameEn}"? This operation cannot be undone.`}
                  </p>
                )}

                {deleteDocTarget && (
                  <p>
                    {lang === "ar"
                      ? `هل أنت متأكد من حذف وثيقة "${deleteDocTarget.key === "transcript" ? "كشف النقاط" : deleteDocTarget.key === "diploma" ? "شهادة النجاح" : deleteDocTarget.key === "idCard" ? "بطاقة الهوية" : "رسالة الدافع"}" للمترشح "${deleteDocTarget.app.firstNameAr} ${deleteDocTarget.app.lastNameAr}" نهائياً؟`
                      : `Are you sure you want to permanently delete the document check "${deleteDocTarget.key === "transcript" ? "Transcript" : deleteDocTarget.key === "diploma" ? "Diploma" : deleteDocTarget.key === "idCard" ? "ID Card" : "Motivation Letter"}" from "${deleteDocTarget.app.firstNameEn} ${deleteDocTarget.app.lastNameEn}"'s folder?`}
                  </p>
                )}

                {resetDbTarget && (
                  <p>
                    {lang === "ar"
                      ? "تحذير: هل أنت متأكد من رغبتك في تفريغ وتصفير كافة سجلات المترشحين بالكلية نهائياً؟ سيتم محو جميع الملفات المرفقة والبيانات الأساسية وقرارات التوجيه المسجلة!"
                      : "Warning: Are you sure you want to delete all registry folders and reset the local database? This will permanently purge all uploaded candidate records, status audits, and manual allocations!"}
                  </p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setDeleteCandidateTarget(null);
                  setDeleteDocTarget(null);
                  setResetDbTarget(false);
                }}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-750 text-xs font-bold transition cursor-pointer"
              >
                {lang === "ar" ? "إلغاء الأمر" : "Cancel"}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  if (deleteCandidateTarget) {
                    onDeleteApplication(deleteCandidateTarget.id);
                    if (selectedApp?.id === deleteCandidateTarget.id) {
                      setSelectedApp(null);
                    }
                    setDeleteCandidateTarget(null);
                  } else if (deleteDocTarget) {
                    handleDeleteIndividualFile(deleteDocTarget.app, deleteDocTarget.key);
                    setDeleteDocTarget(null);
                  } else if (resetDbTarget) {
                    onResetApplications();
                    setSelectedApp(null);
                    setResetDbTarget(false);
                  }
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === "ar" ? "تأكيد الحذف النهائي" : "Confirm Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
