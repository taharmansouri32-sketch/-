/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Award, FileText, Search, ShieldAlert, GraduationCap, Clock, Globe } from "lucide-react";
import { translations, LangType } from "../data/translations";
import { getRegistrationPeriod, isRegistrationOpen } from "../data/programs";

interface OfficialHeaderProps {
  currentView: "apply" | "track" | "admin";
  setCurrentView: (view: "apply" | "track" | "admin") => void;
  candidateCount: number;
  lang: LangType;
  setLang: (lang: LangType) => void;
  isSiteAdmin: boolean;
  setIsSiteAdmin: (val: boolean) => void;
  onOpenSpecialtiesGuide: () => void;
  onOpenUserGuide: () => void;
}

export default function OfficialHeader({
  currentView,
  setCurrentView,
  candidateCount,
  lang,
  setLang,
  isSiteAdmin,
  setIsSiteAdmin,
  onOpenSpecialtiesGuide,
  onOpenUserGuide,
}: OfficialHeaderProps) {
  const t = translations[lang];

  // System registration periods state
  const [regPeriodMaster80, setRegPeriodMaster80] = useState(() => getRegistrationPeriod("master_80"));
  const [isOpenMaster80, setIsOpenMaster80] = useState(() => isRegistrationOpen("master_80"));
  const [regPeriodMaster20, setRegPeriodMaster20] = useState(() => getRegistrationPeriod("master_20"));
  const [isOpenMaster20, setIsOpenMaster20] = useState(() => isRegistrationOpen("master_20"));
  const [regPeriodL3, setRegPeriodL3] = useState(() => getRegistrationPeriod("l3_specialty"));
  const [isOpenL3, setIsOpenL3] = useState(() => isRegistrationOpen("l3_specialty"));

  useEffect(() => {
    const handleUpdate = () => {
      setRegPeriodMaster80(getRegistrationPeriod("master_80"));
      setIsOpenMaster80(isRegistrationOpen("master_80"));
      setRegPeriodMaster20(getRegistrationPeriod("master_20"));
      setIsOpenMaster20(isRegistrationOpen("master_20"));
      setRegPeriodL3(getRegistrationPeriod("l3_specialty"));
      setIsOpenL3(isRegistrationOpen("l3_specialty"));
    };
    if (typeof window !== "undefined") {
      window.addEventListener("reg-period-updated", handleUpdate);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("reg-period-updated", handleUpdate);
      }
    };
  }, []);

  // Admin Verification modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = adminEmail.trim().toLowerCase();
    
    if (cleanEmail !== "taharmansouri32@gmail.com") {
      setErrorMsg(
        lang === "ar"
          ? "البريد الإلكتروني المدخل غير مصرح له كمدير للموقع."
          : lang === "fr"
          ? "L'adresse e-mail saisie n'est pas autorisée en tant qu'administrateur."
          : "The entered email address is not authorized as an administrator."
      );
      return;
    }

    if (accessCode === "2026") {
      setIsSiteAdmin(true);
      setShowAuthModal(false);
      setAccessCode("");
      setAdminEmail("");
      setErrorMsg("");
    } else {
      setErrorMsg(
        lang === "ar"
          ? "رمز المرور خاطئ! يرجى إدخال رمز المرور الإداري المعتمد (2026)."
          : lang === "fr"
          ? "Code erroné ! Veuillez saisir le code d'accès officiel (2026)."
          : "Invalid access code! Please enter the official access code (2026)."
      );
    }
  };

  return (
    <header className="w-full bg-official-blue text-white shadow-md relative border-b-4 border-official-emerald" id="official-portal-header">
      {/* Decorative Golden Top Ribbon wrapper */}
      <div className="h-1 w-full bg-official-emerald/40"></div>

      {/* Official Government Text Sub-header + Lang switcher */}
      <div className="bg-[#12255c] text-[10px] sm:text-xs text-slate-300 py-2.5 px-4 border-b border-white/5 font-medium tracking-wide flex flex-col xs:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-4">
          <span>{t.democraticRepublic}</span>
          <span className="text-official-emerald hidden xs:inline">•</span>
          <span className="hidden xs:inline">{t.ministry}</span>
          <span className="text-official-emerald hidden xs:inline">•</span>
          <span className="font-mono text-slate-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-official-emerald" />
            <span>2026-06-08</span>
          </span>
        </div>

        {/* Language selector buttons */}
        <div className="flex items-center gap-1 bg-black/15 p-1 rounded-lg border border-white/5 text-xs">
          <Globe className="w-3.5 h-3.5 text-official-emerald mx-1.5" />
          <button
            type="button"
            onClick={() => setLang("ar")}
            className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-all ${
              lang === "ar"
                ? "bg-official-emerald text-white shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            العربية
          </button>
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-all ${
              lang === "en"
                ? "bg-official-emerald text-white shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLang("fr")}
            className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-all ${
              lang === "fr"
                ? "bg-official-emerald text-white shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            Français
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Seal Section */}
          <div className="flex items-center gap-4 text-start">
            <div className="p-3 bg-[#172d6c] rounded-xl border border-white/10 shadow-inner flex items-center justify-center shrink-0">
              <GraduationCap className="w-9 h-9 text-official-emerald" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {t.portalTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {t.portalSubtitle}
              </p>
            </div>
          </div>

          {/* Quick Stats & Registration Timeframe flags */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
            <div className="flex items-center gap-2 bg-[#12255c] border border-white/10 px-4 py-2.5 rounded-lg shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-official-emerald animate-pulse"></div>
              <p className="text-xs text-slate-300">
                {t.activePortals} • <span className="font-bold text-official-emerald font-mono">{candidateCount}</span> {t.registeredApplications}
              </p>
            </div>

            {/* Master 80% timeline badge */}
            <div className={`flex items-center gap-2.5 px-4 py-2 md:py-2.5 rounded-xl border-2 shadow-md text-xs text-start transition-all duration-300 transform hover:scale-[1.02] ${
              isOpenMaster80 
                ? "bg-emerald-950/70 border-emerald-500 text-emerald-200 font-bold ring-4 ring-emerald-500/10" 
                : "bg-rose-950/50 border-rose-500/40 text-rose-200 font-bold"
            }`}>
              <Clock className="w-4 h-4 shrink-0 text-white animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[10px] text-white/95 block leading-tight font-black uppercase tracking-wider">
                  {lang === "ar" ? "🎓 ماستر %80 (الأغواط):" : "🎓 Master 80%:"}
                </span>
                <span className="font-mono text-white tracking-wider flex items-center gap-1.5 mt-0.5 leading-none font-extrabold text-xs">
                  <span className="bg-black/20 px-1.5 py-0.5 rounded">{regPeriodMaster80.startDate}</span>
                  <span className="text-white/50 font-sans">&rarr;</span>
                  <span className="bg-black/20 px-1.5 py-0.5 rounded">{regPeriodMaster80.endDate}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${isOpenMaster80 ? "bg-emerald-500 text-white shadow-xs animate-bounce" : "bg-rose-500 text-white"}`}>
                    {isOpenMaster80 ? (lang === "ar" ? "مفتوح" : "Open") : (lang === "ar" ? "مغلق" : "Closed")}
                  </span>
                </span>
              </div>
            </div>

            {/* Master 20% timeline badge */}
            <div className={`flex items-center gap-2.5 px-4 py-2 md:py-2.5 rounded-xl border-2 shadow-md text-xs text-start transition-all duration-300 transform hover:scale-[1.02] ${
              isOpenMaster20 
                ? "bg-emerald-950/70 border-emerald-500 text-emerald-200 font-bold ring-4 ring-emerald-500/10" 
                : "bg-rose-950/50 border-rose-500/40 text-rose-200 font-bold"
            }`}>
              <Clock className="w-4 h-4 shrink-0 text-white animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[10px] text-white/95 block leading-tight font-black uppercase tracking-wider">
                  {lang === "ar" ? "🎓 ماستر %20 (آخرون):" : "🎓 Master 20%:"}
                </span>
                <span className="font-mono text-white tracking-wider flex items-center gap-1.5 mt-0.5 leading-none font-extrabold text-xs">
                  <span className="bg-black/20 px-1.5 py-0.5 rounded">{regPeriodMaster20.startDate}</span>
                  <span className="text-white/50 font-sans">&rarr;</span>
                  <span className="bg-black/20 px-1.5 py-0.5 rounded">{regPeriodMaster20.endDate}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${isOpenMaster20 ? "bg-emerald-500 text-white shadow-xs animate-bounce" : "bg-rose-500 text-white"}`}>
                    {isOpenMaster20 ? (lang === "ar" ? "مفتوح" : "Open") : (lang === "ar" ? "مغلق" : "Closed")}
                  </span>
                </span>
              </div>
            </div>

            {/* L3 timeline badge */}
            <div className={`flex items-center gap-2.5 px-4 py-2 md:py-2.5 rounded-xl border-2 shadow-md text-xs text-start transition-all duration-300 transform hover:scale-[1.02] ${
              isOpenL3 
                ? "bg-emerald-950/70 border-emerald-500 text-emerald-200 font-bold ring-4 ring-emerald-500/10" 
                : "bg-rose-950/50 border-rose-500/40 text-rose-200 font-bold"
            }`}>
              <Clock className="w-4 h-4 shrink-0 text-white animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[10px] text-white/95 block leading-tight font-black uppercase tracking-wider">
                  {lang === "ar" ? "🏫 توجيه ليسانس L3:" : "🏫 L3 Specialty:"}
                </span>
                <span className="font-mono text-white tracking-wider flex items-center gap-1.5 mt-0.5 leading-none font-extrabold text-xs">
                  <span className="bg-black/20 px-1.5 py-0.5 rounded">{regPeriodL3.startDate}</span>
                  <span className="text-white/50 font-sans">&rarr;</span>
                  <span className="bg-black/20 px-1.5 py-0.5 rounded">{regPeriodL3.endDate}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${isOpenL3 ? "bg-emerald-500 text-white shadow-xs animate-bounce" : "bg-rose-500 text-white"}`}>
                    {isOpenL3 ? (lang === "ar" ? "مفتوح" : "Open") : (lang === "ar" ? "مغلق" : "Closed")}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 md:gap-4 border-t border-white/10 pt-5">
          <button
            id="nav-apply-btn"
            onClick={() => setCurrentView("apply")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer ${
              currentView === "apply"
                ? "bg-official-emerald text-white shadow-md transform scale-[1.01]"
                : "bg-[#1d3da1] text-white hover:bg-[#254ab8]"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t.navNewApply}</span>
          </button>

          <button
            id="nav-track-btn"
            onClick={() => setCurrentView("track")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer ${
              currentView === "track"
                ? "bg-official-emerald text-white shadow-md transform scale-[1.01]"
                : "bg-[#1d3da1] text-white hover:bg-[#254ab8]"
            }`}
          >
            <Search className="w-4 h-4" />
            <span>{t.navTrack}</span>
          </button>

          <button
            id="nav-specialties-btn"
            type="button"
            onClick={onOpenSpecialtiesGuide}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer bg-amber-600 hover:bg-amber-700 text-white shadow-xs hover:shadow-md border border-amber-500/15"
          >
            <GraduationCap className="w-4 h-4 text-amber-200" />
            <span>{lang === "ar" ? "🎓 التخصصات المقبولة بالماستر" : lang === "fr" ? "Licences admissibles" : "Allowed Specialties Matrix"}</span>
          </button>

          <button
            id="nav-guide-btn"
            type="button"
            onClick={onOpenUserGuide}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer bg-teal-600 hover:bg-teal-700 text-white shadow-xs hover:shadow-md border border-teal-500/15"
          >
            <FileText className="w-4 h-4 text-teal-200" />
            <span>{lang === "ar" ? "📖 دليـــل استعمــال الموقــع" : lang === "fr" ? "📖 Guide de Plateforme" : "📖 Platform User Guide"}</span>
          </button>

          <div className="flex-grow"></div>

          {isSiteAdmin ? (
            <div className="flex items-center gap-2">
              <button
                id="nav-admin-btn"
                onClick={() => setCurrentView("admin")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer border ${
                  currentView === "admin"
                    ? "bg-white text-official-blue border-white shadow-md font-extrabold"
                    : "bg-[#12255c] text-slate-300 hover:text-white border-white/10 hover:bg-[#1a3275]"
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-official-emerald" />
                <span>{t.navAdmin}</span>
              </button>
              
              <button
                type="button"
                onClick={() => setIsSiteAdmin(false)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold text-red-200 hover:text-white bg-red-950/40 hover:bg-red-900/60 border border-red-500/20 cursor-pointer transition-colors"
                title={lang === "ar" ? "تسجيل خروج مسؤول الموقع" : "Log out site administrator"}
              >
                <span>{lang === "ar" ? "خروج المسؤول 🔓" : lang === "fr" ? "Logout Admin 🔓" : "Admin Logout 🔓"}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-[#12255c] hover:bg-[#1a3275] border border-white/10 text-slate-300 hover:text-white cursor-pointer transition-colors shadow-sm"
            >
              <span>🔒 {lang === "ar" ? "دخول مسؤول الموقع" : lang === "fr" ? "Connexion Admin" : "Admin Login"}</span>
            </button>
          )}
        </div>

        {/* Verification Modal for Admin Login */}
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in text-slate-900" dir={t.dir}>
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full overflow-hidden text-slate-800">
              <div className="bg-official-blue px-6 py-4 border-b-4 border-official-emerald text-white flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2 text-sm sm:text-base">
                  <span>🔒 {lang === "ar" ? "بوابة التحقق لمسؤول الموقع" : lang === "fr" ? "Authentification Administrateur" : "Admin Portal Authentication"}</span>
                </h3>
                <button 
                  type="button"
                  onClick={() => {
                    setShowAuthModal(false);
                    setAccessCode("");
                    setAdminEmail("");
                    setErrorMsg("");
                  }}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer text-lg font-bold"
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed text-start">
                  {lang === "ar" 
                    ? "الرجاء إدخال الحساب البريدي الوحيد المصرّح له وكذا رمز العبور السري المعتمد للولوج وفك تشفير لوحة التحكم البيداغوجية."
                    : lang === "fr"
                    ? "Veuillez saisir votre adresse e-mail administrateur unique et le code d'accès officiel pour déverrouiller le panneau."
                    : "Please provide your unique authorized administrator email and access code to unlock the pedagogical dashboard."}
                </p>

                <div className="text-start space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {lang === "ar" ? "البريد الإلكتروني المعتمد" : lang === "fr" ? "Email de l'Administrateur" : "Authorized Email"}
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder="admin@univ-lagh.dz"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full text-center text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-official-emerald focus:outline-none font-mono"
                  />
                </div>
                
                <div className="text-start space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {lang === "ar" ? "رمز المرور للمسؤول" : lang === "fr" ? "Code d'accès" : "Access Code"}
                  </label>
                  <input
                    type="password"
                    required
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="••••"
                    className="w-full text-center text-lg font-mono tracking-widest px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-official-emerald focus:outline-none"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded border border-red-100 text-center">
                    {errorMsg}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAuthModal(false);
                      setAccessCode("");
                      setAdminEmail("");
                      setErrorMsg("");
                    }}
                    className={`flex-1 px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer ${lang === "ar" ? "text-right" : "text-left"}`}
                  >
                    {lang === "ar" ? "إلغاء الأمر" : lang === "fr" ? "Annuler" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-official-emerald hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    {lang === "ar" ? "تأكيد الدخول" : lang === "fr" ? "Valider" : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
