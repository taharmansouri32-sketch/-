/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import OfficialHeader from "./components/OfficialHeader";
import ApplicationForm from "./components/ApplicationForm";
import StatusTracker from "./components/StatusTracker";
import Receipt from "./components/Receipt";
import AdminPortal from "./components/AdminPortal";
import SpecialtiesModal from "./components/SpecialtiesModal";
import UserGuideModal from "./components/UserGuideModal";
import { CandidateApplication } from "./types";
import { INITIAL_CANDIDATES } from "./data/programs";
import { GraduationCap, ShieldAlert, X } from "lucide-react";
import { translations, LangType } from "./data/translations";

export default function App() {
  // Navigation view: 'apply' | 'track' | 'admin' | 'receipt'
  const [currentView, setCurrentView] = useState<"apply" | "track" | "admin" | "receipt">("apply");
  
  // Active language state: 'ar' | 'en' | 'fr'
  const [lang, setLang] = useState<LangType>("ar");

  // Specialties compliance guide modal visibility state
  const [isSpecialtiesGuideOpen, setIsSpecialtiesGuideOpen] = useState<boolean>(false);

  // User manual guide modal visibility state
  const [isUserGuideOpen, setIsUserGuideOpen] = useState<boolean>(false);

  // Site Administrator authentication state
  const [isSiteAdmin, setIsSiteAdmin] = useState<boolean>(false);

  // Controls display of the top interactive demo tip banner
  const [showDemoBanner, setShowDemoBanner] = useState<boolean>(false);

  // Storage for applications
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  
  // Selected application to render printed version of receipt
  const [selectedReceiptApp, setSelectedReceiptApp] = useState<CandidateApplication | null>(null);

  // Load applications from localStorage on boot, or fallback to the rich initial seed
  useEffect(() => {
    const stored = localStorage.getItem("master_applications");
    if (stored) {
      try {
        let parsed = JSON.parse(stored) as CandidateApplication[];
        // Filter out old trial candidates from cached registers
        const mockIds = ["M2026-8041", "M2026-1049", "M2026-3022", "M2026-9099", "L2026-4401", "L2026-5110", "L2026-8877", "L2026-9024"];
        parsed = parsed.filter(app => !mockIds.includes(app.id));
        setApplications(parsed);
        localStorage.setItem("master_applications", JSON.stringify(parsed));
      } catch (err) {
        console.error("Failed to parse stored applications, resetting...", err);
        setApplications([]);
        localStorage.setItem("master_applications", JSON.stringify([]));
      }
    } else {
      setApplications([]);
      localStorage.setItem("master_applications", JSON.stringify([]));
    }
  }, []);

  // Global event listener to open pedagogical compatibility guide
  useEffect(() => {
    const handleOpenGuide = () => {
      setIsSpecialtiesGuideOpen(true);
    };
    window.addEventListener("open-specialties-guide", handleOpenGuide);
    return () => {
      window.removeEventListener("open-specialties-guide", handleOpenGuide);
    };
  }, []);

  // Sync state variations with localStorage
  const saveApplications = (newApps: CandidateApplication[]) => {
    setApplications(newApps);
    localStorage.setItem("master_applications", JSON.stringify(newApps));
  };

  // Safe handler to set admin status on/off
  const handleSetIsSiteAdmin = (val: boolean) => {
    setIsSiteAdmin(val);
    if (!val && currentView === "admin") {
      setCurrentView("apply");
    }
  };

  // Action: Add new application
  const handleNewApplication = (newApp: CandidateApplication) => {
    const updated = [newApp, ...applications];
    saveApplications(updated);
    
    // Direct applicant toward their printable receipt immediately!
    setSelectedReceiptApp(newApp);
    setCurrentView("receipt");
  };

  // Action: Update candidate pedagogical status
  const handleUpdateStatus = (id: string, updates: Partial<CandidateApplication>) => {
    const updated = applications.map(app => 
      app.id === id ? { ...app, ...updates } : app
    );
    saveApplications(updated);
  };

  // Action: Reset Database to empty state
  const handleResetApplications = () => {
    saveApplications([]);
  };

  // Action: Delete student from Roster
  const handleDeleteApplication = (id: string) => {
    const updated = applications.filter(app => app.id !== id);
    saveApplications(updated);
  };

  // Safe navigation back to status lookup
  const handleNavToTracking = (idToSearch?: string) => {
    setCurrentView("track");
  };

  const t = translations[lang];

  const getDemoBarContent = () => {
    if (isSiteAdmin) {
      if (lang === "ar") {
        return (
          <span>⚙️ <strong>وضع التدقيق المعتمد نشط:</strong> يمكنك الآن معاينة <strong>فضاء الإدارة والتحكم ببرامج الماستر</strong>، ومراجعة استمارة الترشيح أعلاه!</span>
        );
      }
      if (lang === "fr") {
        return (
          <span>⚙️ <strong>Mode d'audit administratif actif :</strong> Vous pouvez accéder à l'<strong>Espace Administration</strong> et auditer les étapes du formulaire !</span>
        );
      }
      return (
        <span>⚙️ <strong>Administrative Audit Mode active:</strong> You can now access the <strong>Admin Portal</strong> and inspect the undergraduate registration lists!</span>
      );
    }

    if (lang === "ar") {
      return (
        <span>💡 <strong>لحق الدخول للمدير المصرح له:</strong> اضغط على <strong>&quot;دخول مسؤول الموقع&quot;</strong> واستعمل بريدك الإلكتروني المعتمد والرمز السري <strong className="bg-[#12255c] text-white px-1.5 py-0.5 rounded font-mono">2026</strong>!</span>
      );
    }
    if (lang === "fr") {
      return (
        <span>💡 <strong>Pour l'accès administratif autorisé :</strong> Cliquez sur <strong>&quot;Connexion Admin&quot;</strong> avec votre e-mail autorisé et le code de validation <strong className="bg-[#12255c] text-white px-1.5 py-0.5 rounded font-mono">2026</strong> !</span>
      );
    }
    return (
      <span>💡 <strong>For authorized administrator access:</strong> Click <strong>&quot;Admin Login&quot;</strong> and enter your authorized email alongside validation code <strong className="bg-[#12255c] text-white px-1.5 py-0.5 rounded font-mono">2026</strong>!</span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-official-emerald selection:text-white" dir={t.dir} id="app-viewport">
      
      {/* Official Top Bar for general layout except when printing active receipts */}
      {currentView !== "receipt" && (
        <OfficialHeader 
          currentView={currentView === "receipt" ? "track" : currentView} 
          setCurrentView={(v) => {
            setSelectedReceiptApp(null);
            setCurrentView(v);
          }}
          candidateCount={applications.length}
          lang={lang}
          setLang={setLang}
          isSiteAdmin={isSiteAdmin}
          setIsSiteAdmin={handleSetIsSiteAdmin}
          onOpenSpecialtiesGuide={() => setIsSpecialtiesGuideOpen(true)}
          onOpenUserGuide={() => setIsUserGuideOpen(true)}
        />
      )}

      {/* Floating Demo Informational Bar to guide users on quick reviewer login */}
      {currentView !== "receipt" && showDemoBanner && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200/60 text-amber-950 text-xs py-2.5 text-center font-bold px-4 flex justify-between items-center sm:gap-4 print:hidden shrink-0 shadow-xs relative z-30" id="interactive-demo-toast">
          <div className="flex items-center gap-2 mx-auto text-start">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="leading-relaxed text-amber-950">{getDemoBarContent()}</div>
          </div>
          <button
            type="button"
            onClick={() => setShowDemoBanner(false)}
            className="p-1 rounded-full text-amber-700/60 hover:text-amber-900 hover:bg-amber-100 transition-all cursor-pointer inline-flex items-center justify-center shrink-0"
            title={lang === "ar" ? "إغلاق التنبيه" : "Dismiss instruction"}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Primary Workspace Router */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView + (currentView === "receipt" && selectedReceiptApp ? `_${selectedReceiptApp.id}` : "")}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {currentView === "apply" && (
              <ApplicationForm 
                onApplicationSubmit={handleNewApplication}
                onNavigateToTracking={handleNavToTracking}
                lang={lang}
                isSiteAdmin={isSiteAdmin}
              />
            )}

            {currentView === "track" && (
              <StatusTracker 
                applications={applications}
                onSelectedApplicationForReceipt={(app) => {
                  setSelectedReceiptApp(app);
                  setCurrentView("receipt");
                }}
                lang={lang}
                isSiteAdmin={isSiteAdmin}
              />
            )}

            {currentView === "admin" && (
              <AdminPortal 
                applications={applications}
                onUpdateStatus={handleUpdateStatus}
                onResetApplications={handleResetApplications}
                onDeleteApplication={handleDeleteApplication}
                lang={lang}
              />
            )}

            {currentView === "receipt" && selectedReceiptApp && (
              <Receipt 
                application={selectedReceiptApp}
                onBackToTracking={() => {
                  setSelectedReceiptApp(null);
                  setCurrentView("track");
                }}
                lang={lang}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Branding except when printing receipts */}
      {currentView !== "receipt" && (
        <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-xs sm:text-sm text-center font-medium px-4 print:hidden shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-1.5 text-official-blue justify-center sm:justify-start">
              <GraduationCap className="w-5 h-5 text-official-emerald" />
              <span className="font-extrabold text-white text-sm">{t.brandTitle}</span>
            </div>
            <p className="font-sans text-slate-500">
              {t.underMaintenance}
            </p>
          </div>
        </footer>
      )}

      {/* Global Specialties Guide Modal overlay */}
      <SpecialtiesModal 
        isOpen={isSpecialtiesGuideOpen} 
        onClose={() => setIsSpecialtiesGuideOpen(false)} 
        lang={lang} 
      />

      {/* Interactive Visual Step-By-Step User Guide Modal */}
      <UserGuideModal 
        isOpen={isUserGuideOpen}
        onClose={() => setIsUserGuideOpen(false)}
        lang={lang}
      />

    </div>
  );
}
