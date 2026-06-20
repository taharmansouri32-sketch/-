/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { X, CheckCircle, FileText, Printer, Search, ArrowRight, HelpCircle, GraduationCap } from "lucide-react";
import { LangType } from "../data/translations";

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LangType;
}

export default function UserGuideModal({ isOpen, onClose, lang }: UserGuideModalProps) {
  if (!isOpen) return null;

  const isAr = lang === "ar";
  const isFr = lang === "fr";

  // Guide contents translations
  const content = {
    title: isAr 
      ? "📖 دليل استخدام موقع الترشح والتوجيه" 
      : isFr 
      ? "📖 Guide d'utilisation de la plateforme" 
      : "📖 Platform Usage & Registration Guide",
    subtitle: isAr
      ? "تعلم في خطوات مصورة وبسيطة كيفية إيداع ملفك خطوة بخطوة ومطابقتة لاحقاً"
      : isFr
      ? "Apprenez en quelques étapes simples et illustrées comment soumettre votre dossier"
      : "Learn in simple, illustrated steps how to submit and track your orientation file",
    close: isAr ? "إغلاق الدليل" : isFr ? "Fermer le guide" : "Close Guide",
    
    steps: [
      {
        num: "1",
        title: isAr ? "تعبئة استمارة الترشح واختيار الرغبات" : isFr ? "1. Remplir le formulaire & vœux" : "1. Fill Form & Select Preferences",
        desc: isAr 
          ? "اختر المسار الأكاديمي المناسب لك (ماستر 80٪ خريجي الأغواط، ماستر 20٪ للجامعات الأخرى والسنوات السابقة، أو توجيه L3). املأ معلوماتك الشخصية بدقة متناهية، وأدخل كشف قاطعات المعدلات السنوية، ثم رتب رغباتك المعروضة حسب الأولوية وتوافق تخصص شهادتك."
          : isFr
          ? "Choisissez votre voie d'admission (Master 80% Laghouat, Master 20% externe, ou orientation L3). Saisissez vos informations personnelles, vos moyennes annuelles de cursus, puis classez vos vœux selon vos préférences et la compatibilité de votre diplôme."
          : "Choose your academic path (Master 80% Laghouat, Master 20% external, or L3 orientation). Provide your personal information, scale scores, and drag to order your program preferences according to priority.",
        image: "/src/assets/images/guide_apply_step_1781889084470.jpg",
        icon: FileText,
        color: "bg-blue-600",
        badge: isAr ? "تعبئة الملف" : isFr ? "Saisie" : "Submission"
      },
      {
        num: "2",
        title: isAr ? "توليد وتحميل وصل التسجيل الرسمي المكتمل" : isFr ? "2. Générer & imprimer le reçu" : "2. Generate & Download your Receipt",
        desc: isAr
          ? "بعد تأكيد البيانات، سيصدر لك النظام فوراً رقم تسجيل موحد مشفر وبطاقة استلام ملونة مخصصة (تحتوي على رمز استجابة سريعة QR فريد لتأمين معاملتك). انقر على زر الطباعة لحفظ الوصل بصيغة PDF أو طباعته كإثبات رسمي لتسجيل ملفك لدى إدارة الكلية بصفة قطعية."
          : isFr
          ? "Après validation, le système génère instantanément un reçu d'inscription officiel avec un numéro de référence crypté et un QR code unique de sécurité. Imprimez ou téléchargez ce reçu au format PDF pour conserver votre preuve officielle de dépôt."
          : "After confirming your details, the system instantly generates a secure registration receipt with an encrypted registration number and unique QR Code. Click Print to save it as a PDF or print it out as official proof.",
        image: "/src/assets/images/guide_receipt_step_1781889098717.jpg",
        icon: Printer,
        color: "bg-emerald-600",
        badge: isAr ? "حفظ الوصل" : isFr ? "Reçu" : "Receipt"
      },
      {
        num: "3",
        title: isAr ? "الاستعلام ومطابقة الملف لمعرفة النتيجة" : isFr ? "3. Suivi & consultation des résultats" : "3. Inquiry & Acceptance Tracking",
        desc: isAr
          ? "توجه إلى لوحة 'استعلام ومطابقة' لاحقاً لمتابعة ملفك. ما عليك سوى إدخال رقم بطاقة الطالب الخاصة بك لإجراء فحص حي فوري. سيعرض لك النظام الحالة الحالية بالتفصيل: ملف قيد الدراسة، أو مقبول وموجه بصفة مؤقتة في أحد المسارات مع تبيان المعدل والترتيب الاستحقاقي."
          : isFr
          ? "Rendez-vous sur l'onglet 'Suivi' pour suivre l'état de votre dossier. Saisissez simplement le code de carte d'étudiant pour savoir si votre candidature est en cours, ou acceptée temporairement dans l'une de vos spécialités de vœux."
          : "Visit the 'Track' tab later on. Simply enter your Student Card ID to retrieve your real-time pedagogical status: Pending review, or provisionally Accepted in an undergraduate stream showing your comparative ranking score.",
        image: "/src/assets/images/guide_track_step_1781889112786.jpg",
        icon: Search,
        color: "bg-amber-600",
        badge: isAr ? "متابعة النتيجة" : isFr ? "Suivi" : "Inquiry"
      }
    ],
    summaryTitle: isAr ? "💡 ملاحظات بيداغوجية هامة للطلاب:" : "💡 Important Pedagogical Notes:",
    bullets: isAr 
      ? [
          "تأكد من إرفاق وثائق واضحة في صيغة صور أو ملفات PDF (ملف كشوف النقاط، الشهادة المؤقتة، إلخ).",
          "توافق التخصصات يخضع لمعايير القرار الوزاري رقم 144 ومحاضر اللجنة البيداغوجية لقسم علوم المادة بجامعة الأغواط.",
          "يمكن لمسؤول الموقع تحميل محاضر التوجيه الإجمالية وتصديرها بصيغة Excel لبرمجتها على مستوى الكلية مباشرة."
        ]
      : [
          "Ensure high-quality attachment uploads (PDF or images for transcripts and provisional certificates).",
          "Specialty routing complies with official ministerial directive No. 144 guidelines.",
          "Administrators can download compiled orientation registers in raw Excel format instantly."
        ]
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto animate-fade-in"
      id="user-guide-modal-overlay"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Banner Header with Brand Identity */}
        <div className="bg-gradient-to-r from-[#11235a] to-[#1e3477] px-6 py-5 border-b-4 border-official-emerald text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 text-start">
            <div className="p-2 bg-white/10 rounded-xl">
              <HelpCircle className="w-6 h-6 text-official-emerald animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg tracking-tight leading-tight">
                {content.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300 font-bold mt-0.5">
                {content.subtitle}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 px-2.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer font-black text-xl"
            title={content.close}
          >
            &times;
          </button>
        </div>

        {/* Scrollable Illustrated Steps Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-grow">
          
          {/* Timeline of Steps */}
          <div className="space-y-12">
            {content.steps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div 
                  key={step.num}
                  className={`flex flex-col lg:flex-row gap-6 items-center ${
                    idx % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}
                  id={`guide-step-card-${step.num}`}
                >
                  {/* Left Column: Visual Step image illustration with Referrer policy */}
                  <div className="w-full lg:w-2/5 shrink-0">
                    <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200/90 shadow-md group">
                      <img 
                        src={step.image} 
                        alt={step.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-auto max-h-[220px] object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                      <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black tracking-wider text-white shadow-sm ${step.color}`}>
                        {step.badge}
                      </span>
                      {/* Step Number Badge */}
                      <span className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-slate-900/80 text-white font-black text-sm flex items-center justify-center">
                        {step.num}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Step Instructions */}
                  <div className="w-full lg:w-3/5 text-start space-y-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`p-2 rounded-xl text-white ${step.color}`}>
                        <StepIcon className="w-4.5 h-4.5" />
                      </span>
                      <h4 className="text-sm sm:text-base font-black text-[#11235a] tracking-tight">
                        {step.title}
                      </h4>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                      {step.desc}
                    </p>

                    {idx < content.steps.length - 1 && (
                      <div className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-slate-400 mt-2">
                        <span>{isAr ? "الانتقال للخطوة التالية" : "Proceed to next step"}</span>
                        <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Guidelines Bullet points footer */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3 text-start">
            <h5 className="text-[11px] sm:text-xs font-black text-[#11235a] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-4.5 h-4.5 text-official-emerald" />
              <span>{content.summaryTitle}</span>
            </h5>
            <ul className="space-y-2">
              {content.bullets.map((bullet, index) => (
                <li key={index} className="text-xs text-slate-600 font-semibold flex items-start gap-2 leading-relaxed">
                  <span className="text-official-emerald text-xs mt-0.5 animate-pulse">■</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Action */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 text-center shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-official-blue hover:bg-[#1b2f70] text-white text-xs sm:text-sm font-extrabold rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer inline-flex items-center justify-center min-w-[120px]"
          >
            {isAr ? "فهمت، البدء الآن 👍" : "Got it, start now!"}
          </button>
        </div>

      </div>
    </div>
  );
}
