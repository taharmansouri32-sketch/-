/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  X, 
  Search, 
  Award, 
  BookOpen, 
  ShieldCheck, 
  Info, 
  FileText, 
  Layers, 
  GraduationCap, 
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { MASTER_PROGRAMS, LICENCE_SPECIALTIES, getCompatibilityDetails } from "../data/programs";
import { LangType } from "../data/translations";

interface SpecialtiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LangType;
}

export default function SpecialtiesModal({ isOpen, onClose, lang }: SpecialtiesModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"by_master" | "by_licence">("by_master");

  if (!isOpen) return null;

  // Local translations for this modal
  const tModal: Record<LangType, Record<string, string>> = {
    ar: {
      title: "دليل التوافق البيداغوجي وتخصصات ماستر المفتوحة",
      subtitle: "استعلم عن الشروط الرسمية لتطابق شهادات الليسانس وصيغ حساب معدلات القبول بالترتيب الاستحقاقي.",
      tabByMaster: "🔍 البحث حسب تخصص الماستر",
      tabByLicence: "🎓 البحث حسب تخصصك في الليسانس",
      searchPlaceholderMaster: "ابحث عن برنامج ماستر (مثال: طاقوية، ميكانيك...)",
      searchPlaceholderLicence: "ابحث عن شعبة ليسانس (مثال: إنشاء ميكانيكي، طيران...)",
      allowedSpecialties: "شهدات الليسانس المسموح بها والمقبولة بيداغوجياً لولوج هذا التخصص:",
      coefficient: "معامل التطابق",
      rank: "رتبة الأولوية",
      allowedMasters: "تخصصات الماستر المتاحة لترشحك:",
      minGpa: "المعدل الأدنى الموصى به",
      compatTotal: "توافق تام وطبيعي (1.00)",
      compatGood: "توافق جيد ومباشر (0.80)",
      compatMedium: "توافق متوسط وتكاملي (0.70)",
      noResults: "لم يتم العثور على تخصصات مطابقة للبحث.",
      notesTitle: "⚠️ تنبيهات تنظيمية هامة للمترشحين:",
      note1: "يتم احتساب معدل الترتيب الاستحقاقي بضرب معدل الليسانس الإجمالي GPA في معامل تطابق التخصص بوزارة التعليم العالي والبحث العلمي.",
      note2: "الأولوية الأولى (الرتبة 1) تُمنح للتخصصات ذات المعامل 1.00 وتتمتع بحصص إضافية أثناء الفرز الهيكلي التلقائي.",
      note3: "يمكن لحاملي الشهادات من خارج جامعة عمار ثليجي بالأغواط الاستفادة من حصة 20% المخصصة بعد تسوية وضعية مخرجات الدفعة الحالية.",
      closeBtn: "إغلاق دليل التوافق",
      allSchools: "كل التخصصات خاضعة للمراقبة العلمية للجنة البيداغوجية لقسم الهندسة الميكانيكية."
    },
    en: {
      title: "Pedagogical Compatibility Guide & Master Admissions Directory",
      subtitle: "Consult the official criteria for undergraduate degree compatibility and merit-based matching weights.",
      tabByMaster: "🔍 Lookup by Master Program",
      tabByLicence: "🎓 Lookup by your Licence",
      searchPlaceholderMaster: "Search master programs (e.g., Energetics, Materials...)",
      searchPlaceholderLicence: "Search undergraduate licence (e.g., Mechanical, Aero...)",
      allowedSpecialties: "Allowed undergraduate licence fields for admission to this program:",
      coefficient: "Alignment Coeff",
      rank: "Priority Rank",
      allowedMasters: "Compatible Masters open for your registration:",
      minGpa: "Recommended Min GPA",
      compatTotal: "Total Natural Alignment (1.00)",
      compatGood: "Good Alignment (0.80)",
      compatMedium: "Medium Alignment (0.70)",
      noResults: "No matching specialties found.",
      notesTitle: "⚠️ Important regulatory warnings:",
      note1: "The merit ranking score is calculated by multiplying your cumulative GPA by the compatibility coefficient of the target Master.",
      note2: "First priority (Rank 1) is automatically assigned to specialties with a 1.00 coefficient during the algorithmic placement phase.",
      note3: "Graduates outside of Amar Telidji University - Laghouat are allocated under the designated 20% external candidate quota.",
      closeBtn: "Close Guide",
      allSchools: "All programs are governed under the direct oversight of the Mechanical Engineering Department's Scientific Council."
    },
    fr: {
      title: "Guide de Compatibilité Pédagogique & Offres de Master",
      subtitle: "Consultez les critères officiels d'adéquation des diplômes de Licence et coefficients de filtrage.",
      tabByMaster: "🔍 Recherche par Programme de Master",
      tabByLicence: "🎓 Recherche par diplôme de Licence",
      searchPlaceholderMaster: "Rechercher un Master (ex: Énergétique, Matériaux...)",
      searchPlaceholderLicence: "Rechercher une Licence (ex: Construction, Aéro...)",
      allowedSpecialties: "Licences d'origine admissibles et autorisées pour ce Master :",
      coefficient: "Coefficient",
      rank: "Rang d'importance",
      allowedMasters: "Filières de Master compatibles et ouvertes pour cette Licence :",
      minGpa: "GPA de base conseillé",
      compatTotal: "Compatibilité Naturelle Totale (1.00)",
      compatGood: "Bonne Adéquation Directe (0.80)",
      compatMedium: "Compatibilité Moyenne Accordée (0.70)",
      noResults: "Aucune spécialité correspondante.",
      notesTitle: "⚠️ Notes réglementaires cruciales :",
      note1: "Moyenne de classement = Moyenne générale de Licence (GPA) multipliée par le coefficient de compatibilité de la filière.",
      note2: "Le Rang 1 (Coefficient 1.00) offre une priorité automatique absolue lors du traitement de l'allocation algorithmique.",
      note3: "Les lauréats extérieurs (hors Université de Laghouat) sont classés dans le quota réglementaire réservé de 20%.",
      closeBtn: "Fermer le guide de compatibilité",
      allSchools: "Tous les masters sont validés bilinguement sous le contrôle académique du comité scientifique de génie mécanique."
    }
  };

  const currT = tModal[lang] || tModal["ar"];

  // Filter logic for master programs card list
  const filteredMasters = MASTER_PROGRAMS.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      p.nameAr.toLowerCase().includes(q) ||
      p.nameEn.toLowerCase().includes(q) ||
      p.nameFr.toLowerCase().includes(q) ||
      p.categoryAr.toLowerCase().includes(q) ||
      p.categoryEn.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  });

  // Filter logic for license specialties
  const filteredLicences = LICENCE_SPECIALTIES.filter(lic => {
    const q = searchQuery.toLowerCase();
    return (
      lic.id.toLowerCase().includes(q) ||
      lic.nameAr.toLowerCase().includes(q) ||
      lic.nameEn.toLowerCase().includes(q) ||
      lic.nameFr.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-2 sm:p-4 text-slate-900 overflow-y-auto" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 max-w-4xl w-full flex flex-col my-auto max-h-[92vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#112255] to-[#1a3da1] text-white px-5 py-4 border-b-4 border-official-emerald flex items-center justify-between">
          <div className="text-start">
            <h3 className="text-base sm:text-lg font-bold flex items-center gap-2.5">
              <GraduationCap className="w-5 h-5 text-official-emerald" />
              <span>{currT.title}</span>
            </h3>
            <p className="text-[11px] text-slate-300 mt-1 lines-clamp-1">
              {currT.subtitle}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-200 hover:text-white hover:bg-white/10 transition-all cursor-pointer inline-flex items-center justify-center shrink-0"
            title={lang === "ar" ? "إغلاق" : "Close"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex bg-slate-200/60 p-1.5 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab("by_master");
                setSearchQuery("");
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "by_master"
                  ? "bg-white text-[#112255] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{currT.tabByMaster}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("by_licence");
                setSearchQuery("");
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "by_licence"
                  ? "bg-white text-[#112255] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{currT.tabByLicence}</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-grow sm:max-w-xs">
            <Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === "by_master" ? currT.searchPlaceholderMaster : currT.searchPlaceholderLicence}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-official-emerald focus:outline-none placeholder:text-slate-450 bg-white"
              style={{ paddingLeft: lang === "ar" ? "10px" : "32px", paddingRight: lang === "ar" ? "32px" : "10px" }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute top-2.5 text-slate-400 hover:text-slate-600 font-bold"
                style={{ left: lang === "ar" ? "10px" : "auto", right: lang === "ar" ? "auto" : "10px" }}
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Modal Scrollable Content Container */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-5 space-y-5 bg-slate-50/50">
          
          {/* TAB 1: Search by Master */}
          {activeTab === "by_master" && (
            <div className="space-y-4">
              {filteredMasters.length === 0 ? (
                <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-slate-400 font-medium">
                  {currT.noResults}
                </div>
              ) : (
                filteredMasters.map((m) => {
                  return (
                    <div key={m.id} className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all overflow-hidden text-start">
                      <div className="border-b border-slate-100 bg-slate-50/40 px-4 py-3 sm:flex justify-between items-center gap-3">
                        <div>
                          <span className="inline-block bg-[#112255] text-white px-2 py-0.5 rounded font-mono text-[10px] sm:text-xs font-bold mb-1.5 sm:mb-0">
                            {m.id}
                          </span>
                          <h4 className="text-sm sm:text-base font-extrabold text-[#112255] inline-block sm:mx-2 align-middle">
                            {lang === "ar" ? m.nameAr : lang === "fr" ? m.nameFr : m.nameEn}
                          </h4>
                          <span className="text-slate-400 text-[10px] font-medium block mt-1 sm:mt-0 sm:inline">
                            [{lang === "ar" ? m.categoryAr : lang === "fr" ? m.categoryFr : m.categoryEn}]
                          </span>
                        </div>
                        <div className="mt-2 sm:mt-0 flex gap-1.5 text-xs">
                          <span className="bg-indigo-50 text-indigo-950 px-2 py-0.5 rounded border border-indigo-100 font-semibold flex items-center gap-1 shrink-0">
                            <Layers className="w-3 h-3 text-indigo-600" />
                            <span>{currT.minGpa}: {m.minRecommendedGpa.toFixed(2)}/20</span>
                          </span>
                          <span className="bg-emerald-50 text-emerald-950 px-2 py-0.5 rounded border border-emerald-100 font-semibold flex items-center gap-1 shrink-0">
                            <CheckCircle className="w-3 h-3 text-official-emerald" />
                            <span>{lang === "ar" ? `المقاعد: ${m.capacity}` : `Seats: ${m.capacity}`}</span>
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <p className="text-xs text-slate-550 font-bold flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-official-emerald" />
                          <span>{currT.allowedSpecialties}</span>
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {m.allowedLicenceSpecialties.map((licId) => {
                            const spec = LICENCE_SPECIALTIES.find(s => s.id === licId);
                            if (!spec) return null;
                            const compDetails = getCompatibilityDetails(m.id, licId);

                            return (
                              <div key={licId} className="flex items-center justify-between p-2.5 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors gap-2 text-xs">
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-800 truncate" title={lang === "ar" ? spec.nameAr : lang === "fr" ? spec.nameFr : spec.nameEn}>
                                    {lang === "ar" ? spec.nameAr : lang === "fr" ? spec.nameFr : spec.nameEn}
                                  </p>
                                  <span className="font-mono text-[9px] text-slate-400 font-extrabold">{licId}</span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
                                  <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                                    compDetails.coeff >= 1.00 
                                      ? "bg-emerald-100 text-emerald-800" 
                                      : compDetails.coeff >= 0.80 
                                      ? "bg-blue-100 text-blue-800" 
                                      : "bg-amber-100 text-amber-805"
                                  }`}>
                                    {currT.coefficient}: {compDetails.coeff.toFixed(2)}
                                  </span>
                                  <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold text-[10px]" title={lang === "ar" ? compDetails.labelAr : compDetails.labelEn}>
                                    {lang === "ar" ? `رتبة ${compDetails.rank}` : `Rank ${compDetails.rank}`}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: Search by Licence */}
          {activeTab === "by_licence" && (
            <div className="space-y-4">
              {filteredLicences.length === 0 ? (
                <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-slate-400 font-medium">
                  {currT.noResults}
                </div>
              ) : (
                filteredLicences.map((lic) => {
                  // Find compatible master programs
                  const compatibleMasters = MASTER_PROGRAMS.filter(m => 
                    m.allowedLicenceSpecialties.includes(lic.id)
                  );

                  return (
                    <div key={lic.id} className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all overflow-hidden text-start">
                      <div className="border-b border-slate-100 bg-slate-50/40 px-4 py-3">
                        <span className="inline-block bg-official-emerald text-white px-2 py-0.5 rounded font-mono text-[10px] sm:text-xs font-bold mb-1.5">
                          {lic.id}
                        </span>
                        <h4 className="text-sm sm:text-base font-extrabold text-[#112255]">
                          {lang === "ar" ? lic.nameAr : lang === "fr" ? lic.nameFr : lic.nameEn}
                        </h4>
                      </div>

                      <div className="p-4 space-y-3">
                        <p className="text-xs text-slate-550 font-bold flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-official-emerald" />
                          <span>{currT.allowedMasters}</span>
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {compatibleMasters.length === 0 ? (
                            <div className="col-span-2 text-xs text-slate-450 p-2 italic text-center">
                              {lang === "ar" ? "لا تمتلك هذه الشهادة صلاحيات تسجيل مباشرة في أي تخصص ماستر." : "No master programs open for direct candidacy with this Licence specialty."}
                            </div>
                          ) : (
                            compatibleMasters.map((m) => {
                              const compDetails = getCompatibilityDetails(m.id, lic.id);

                              return (
                                <div key={m.id} className="flex items-center justify-between p-2.5 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors gap-2 text-xs">
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-800 truncate" title={lang === "ar" ? m.nameAr : lang === "fr" ? m.nameFr : m.nameEn}>
                                      {lang === "ar" ? m.nameAr : lang === "fr" ? m.nameFr : m.nameEn}
                                    </p>
                                    <span className="font-mono text-[9px] text-slate-400 font-extrabold">{m.id}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
                                    <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                                      compDetails.coeff >= 1.00 
                                        ? "bg-emerald-100 text-emerald-800" 
                                        : compDetails.coeff >= 0.80 
                                        ? "bg-blue-100 text-blue-800" 
                                        : "bg-amber-100 text-amber-805"
                                    }`}>
                                      x{compDetails.coeff.toFixed(2)}
                                    </span>
                                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                                      {lang === "ar" ? `رتبة ${compDetails.rank}` : `Rank ${compDetails.rank}`}
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Regulatory Alerts/Guide Panel */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 text-start space-y-2">
            <h5 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-700" />
              <span>{currT.notesTitle}</span>
            </h5>
            <ul className="list-disc list-inside text-[11px] text-indigo-900/90 leading-relaxed space-y-1">
              <li>{currT.note1}</li>
              <li>{currT.note2}</li>
              <li>{currT.note3}</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-[10px] text-slate-400 font-medium text-center sm:text-start leading-normal max-w-lg">
            <span>ℹ️ {currT.allSchools}</span>
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-[#112255] hover:bg-[#1a3da1] text-white rounded-lg text-xs font-bold shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer text-center"
          >
            {currT.closeBtn}
          </button>
        </div>

      </div>
    </div>
  );
}
