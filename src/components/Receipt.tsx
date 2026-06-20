/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Building2, 
  User, 
  MapPin, 
  CheckCircle2, 
  Printer, 
  ArrowLeft, 
  Calendar, 
  FileText, 
  Check,
  ShieldCheck,
  Download
} from "lucide-react";
import { CandidateApplication } from "../types";
import { MASTER_PROGRAMS, LICENCE_SPECIALTIES, L3_SPECIALTIES, getAcademicYear } from "../data/programs";
import { translations, LangType } from "../data/translations";

const isAppMaster80Percent = (app: CandidateApplication) => {
  return app.applicationType === "master" &&
    (app.university === "UNIV-LAGHOUAT" ||
     app.university === "جامعة عمار ثليجي - الأغواط" ||
     app.university === "Université Amar Telidji - Laghouat" ||
     app.university === "Amar Telidji University - Laghouat") &&
    app.graduationYear === 2026;
};

// @ts-ignore
import html2pdf from "html2pdf.js";
// @ts-ignore
import reshaper from "arabic-persian-reshaper";

// OKLCH to RGB conversion algorithms for full html2canvas/html2pdf compatibility
function oklchToRgbVal(l: number, c: number, h: number): [number, number, number] {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  const l_3 = l_ * l_ * l_;
  const m_3 = m_ * m_ * m_;
  const s_3 = s_ * s_ * s_;

  const r = +4.0767416621 * l_3 - 3.3077115913 * m_3 + 0.2309699292 * s_3;
  const g = -1.2684380046 * l_3 + 2.6097574011 * m_3 - 0.3413193965 * s_3;
  const b_ = -0.0041960863 * l_3 - 0.7034186147 * m_3 + 1.7076210010 * s_3;

  const clampAndGamma = (v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    return clamped <= 0.0031308
      ? 12.92 * clamped
      : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  };

  const rSrgb = Math.round(clampAndGamma(r) * 255);
  const gSrgb = Math.round(clampAndGamma(g) * 255);
  const bSrgb = Math.round(clampAndGamma(b_) * 255);

  return [rSrgb, gSrgb, bSrgb];
}

function oklabToRgbVal(l: number, a: number, b: number): [number, number, number] {
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  const l_3 = l_ * l_ * l_;
  const m_3 = m_ * m_ * m_;
  const s_3 = s_ * s_ * s_;

  const r = +4.0767416621 * l_3 - 3.3077115913 * m_3 + 0.2309699292 * s_3;
  const g = -1.2684380046 * l_3 + 2.6097574011 * m_3 - 0.3413193965 * s_3;
  const b_ = -0.0041960863 * l_3 - 0.7034186147 * m_3 + 1.7076210010 * s_3;

  const clampAndGamma = (v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    return clamped <= 0.0031308
      ? 12.92 * clamped
      : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  };

  const rSrgb = Math.round(clampAndGamma(r) * 255);
  const gSrgb = Math.round(clampAndGamma(g) * 255);
  const bSrgb = Math.round(clampAndGamma(b_) * 255);

  return [rSrgb, gSrgb, bSrgb];
}

function convertOklchAndOklabStringToRgb(str: string): string {
  if (!str) return str;
  let result = str;

  if (result.includes("oklch")) {
    const oklchRegex = /oklch\s*\(\s*([\d.%]+)[,\s]+([\d.%]+)[,\s]+([\d.%]+deg|[\d.%]+|[\d.]+)(?:\s*[,\s/]+\s*([\d.%]+))?\s*\)/gi;
    result = result.replace(oklchRegex, (match, p1, p2, p3, p4) => {
      try {
        const l = p1.endsWith("%") ? parseFloat(p1) / 100 : parseFloat(p1);
        const c = p2.endsWith("%") ? parseFloat(p2) / 100 : parseFloat(p2);
        let h = parseFloat(p3);
        if (p3 && p3.endsWith("deg")) {
          h = parseFloat(p3);
        } else if (p3 && p3.endsWith("%")) {
          h = (parseFloat(p3) / 100) * 360;
        }
        
        let alpha = 1;
        if (p4) {
          if (p4.endsWith("%")) {
            alpha = parseFloat(p4) / 100;
          } else {
            alpha = parseFloat(p4);
          }
        }

        if (isNaN(l) || isNaN(c) || isNaN(h)) return match;

        const [r, g, b] = oklchToRgbVal(l, c, h);

        if (p4 !== undefined) {
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } else {
          return `rgb(${r}, ${g}, ${b})`;
        }
      } catch (e) {
        return match;
      }
    });
  }

  if (result.includes("oklab")) {
    const oklabRegex = /oklab\s*\(\s*([\d.%]+)[,\s]+([\d.e%-]+)[,\s]+([\d.e%-]+)(?:\s*[,\s/]+\s*([\d.%]+))?\s*\)/gi;
    result = result.replace(oklabRegex, (match, p1, p2, p3, p4) => {
      try {
        const l = p1.endsWith("%") ? parseFloat(p1) / 100 : parseFloat(p1);
        const a = p2.endsWith("%") ? (parseFloat(p2) / 100) * 0.4 : parseFloat(p2);
        const b = p3.endsWith("%") ? (parseFloat(p3) / 100) * 0.4 : parseFloat(p3);
        
        let alpha = 1;
        if (p4) {
          if (p4.endsWith("%")) {
            alpha = parseFloat(p4) / 100;
          } else {
            alpha = parseFloat(p4);
          }
        }

        if (isNaN(l) || isNaN(a) || isNaN(b)) return match;

        const [r, g, bVal] = oklabToRgbVal(l, a, b);

        if (p4 !== undefined) {
          return `rgba(${r}, ${g}, ${bVal}, ${alpha})`;
        } else {
          return `rgb(${r}, ${g}, ${bVal})`;
        }
      } catch (e) {
        return match;
      }
    });
  }

  return result;
}

function patchWindowGetComputedStyle(win: Window | null): () => void {
  if (!win) return () => {};
  
  const originalGetComputedStyle = win.getComputedStyle;
  if (!originalGetComputedStyle) return () => {};
  
  // Guard to prevent multiple patches
  if ((originalGetComputedStyle as any).__isPatched) {
    return () => {};
  }
  
  const newGetComputedStyle = function(el: Element, pseudoElt?: string | null) {
    const style = originalGetComputedStyle.call(win, el, pseudoElt);
    if (!style) return style;
    
    return new Proxy(style, {
      get(target, prop) {
        if (prop === "getPropertyValue") {
          return function(propertyName: string) {
            const val = target.getPropertyValue(propertyName);
            if (typeof val === "string" && (val.includes("oklch") || val.includes("oklab"))) {
              return convertOklchAndOklabStringToRgb(val);
            }
            return val;
          };
        }
        
        const val = (target as any)[prop];
        if (typeof val === "function") {
          return val.bind(target);
        }
        
        if (typeof prop === "string" && typeof val === "string" && (val.includes("oklch") || val.includes("oklab"))) {
          return convertOklchAndOklabStringToRgb(val);
        }
        
        return val;
      }
    });
  };
  
  (newGetComputedStyle as any).__isPatched = true;
  
  try {
    win.getComputedStyle = newGetComputedStyle as any;
  } catch (err) {
    console.warn("Failed to patch window.getComputedStyle:", err);
  }
  
  return () => {
    try {
      win.getComputedStyle = originalGetComputedStyle;
    } catch (e) {}
  };
}

function getArabicShaper() {
  if (!reshaper) return null;
  const mod = (reshaper as any).default || reshaper;
  if (mod.ArabicShaper) {
    return mod.ArabicShaper;
  }
  if (typeof mod.convertArabic === "function") {
    return mod;
  }
  return null;
}

function shapeArabicTextNode(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.nodeValue;
    if (text && /[\u0600-\u06FF]/.test(text)) {
      const shaper = getArabicShaper();
      if (shaper && typeof shaper.convertArabic === "function") {
        try {
          const shaped = shaper.convertArabic(text);
          node.nodeValue = shaped;
        } catch (err) {
          console.error("Failed to shape Arabic text node:", err);
        }
      }
    }
  } else {
    if (node instanceof HTMLElement) {
      const tagName = node.tagName.toLowerCase();
      if (tagName === "style" || tagName === "script" || tagName === "noscript") {
        return;
      }
    }
    const children = Array.from(node.childNodes);
    for (const child of children) {
      shapeArabicTextNode(child);
    }
  }
}

interface ReceiptProps {
  application: CandidateApplication;
  onBackToTracking: () => void;
  lang: LangType;
}

export default function Receipt({ 
  application, 
  onBackToTracking,
  lang
}: ReceiptProps) {
  const t = translations[lang];
  const [downloadingPdf, setDownloadingPdf] = React.useState(false);

  // Printable trigger
  const handlePrint = () => {
    window.print();
  };

  // Direct PDF Receipt Download (Generates clean high-fidelity PDF format)
  const handleDownloadReceipt = () => {
    const element = document.getElementById("official-receipt-sheet");
    if (!element) return;
    
    setDownloadingPdf(true);

    const executePdfGeneration = () => {
      // Temporarily patch main window getComputedStyle
      const restoreMain = patchWindowGetComputedStyle(window);
      
      const isAr = lang === "ar";
      const filename = isAr 
        ? `وصل_تسجيل_الماستر_${application.id}.pdf`
        : `recap_candidature_master_${application.id}.pdf`;
        
      const options = {
        margin: 10,
        filename: filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2.5, 
          useCORS: true,
          logging: false,
          onclone: (clonedDoc: Document) => {
            // Patch cloned document's defaultView (where html2canvas reads layout styles)
            if (clonedDoc.defaultView) {
              patchWindowGetComputedStyle(clonedDoc.defaultView);
            }
            
            // Inject exact same font imports and font-family rules into the cloned document to guarantee Noto Sans Arabic resolves
            try {
              const style = clonedDoc.createElement("style");
              style.innerHTML = `
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
                * {
                  font-family: 'Noto Sans Arabic', 'Inter', sans-serif !important;
                }
              `;
              clonedDoc.head.appendChild(style);
            } catch (styleErr) {
              console.warn("Failed to inject style on cloned document:", styleErr);
            }

            // Shape all Arabic text nodes in the cloned document so they stay joined
            try {
              shapeArabicTextNode(clonedDoc.body);
            } catch (shapeErr) {
              console.error("Failed to shape Arabic text nodes in clone:", shapeErr);
            }
            
            const clonedElements = clonedDoc.querySelectorAll("*");
            clonedElements.forEach((el) => {
              if (!(el instanceof HTMLElement)) return;
              
              const propertiesToFix = [
                "color",
                "backgroundColor",
                "borderColor",
                "borderTopColor",
                "borderRightColor",
                "borderBottomColor",
                "borderLeftColor",
                "outlineColor",
                "backgroundImage",
                "fill",
                "stroke"
              ];

              const win = el.ownerDocument?.defaultView || window;
              const computed = win.getComputedStyle(el);
              propertiesToFix.forEach((prop) => {
                const val = computed[prop as any];
                if (val && (val.includes("oklch") || val.includes("oklab"))) {
                  const fixedColor = convertOklchAndOklabStringToRgb(val);
                  el.style[prop as any] = fixedColor;
                }
              });

              const shadow = computed.boxShadow;
              if (shadow && (shadow.includes("oklch") || shadow.includes("oklab"))) {
                const fixedShadow = convertOklchAndOklabStringToRgb(shadow);
                el.style.boxShadow = fixedShadow;
              }
            });
          }
        },
        jsPDF: { 
          unit: 'mm' as const, 
          format: 'a4' as const, 
          orientation: 'portrait' as const 
        }
      };
      
      html2pdf()
        .from(element)
        .set(options)
        .save()
        .then(() => {
          restoreMain();
          setDownloadingPdf(false);
        })
        .catch((err: any) => {
          restoreMain();
          console.error("Error generating PDF receipt:", err);
          setDownloadingPdf(false);
        });
    };

    // Wait for the fonts to render perfectly before capturing
    if (document.fonts && typeof document.fonts.ready !== 'undefined') {
      document.fonts.ready.then(() => {
        executePdfGeneration();
      }).catch((e) => {
        console.warn("Fonts load warning, proceeding anyway:", e);
        executePdfGeneration();
      });
    } else {
      executePdfGeneration();
    }
  };

  const getProgName = (pId: string | undefined) => {
    if (!pId) return "";
    const p = MASTER_PROGRAMS.find(prog => prog.id === pId);
    if (p) {
      if (lang === "ar") return p.nameAr;
      if (lang === "en") return p.nameEn;
      return p.nameFr || p.nameEn;
    }
    const spec = L3_SPECIALTIES.find(s => s.id === pId);
    if (spec) {
      if (lang === "ar") return spec.nameAr;
      if (lang === "en") return spec.nameEn;
      return spec.nameFr || spec.nameEn;
    }
    return pId;
  };

  const getProgFaculty = (pId: string | undefined) => {
    if (!pId) return "";
    const p = MASTER_PROGRAMS.find(prog => prog.id === pId);
    if (!p) return "";
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

  // Safe GPA formatting helper
  const safeFormatGpa = (val: any, digits: number = 2) => {
    if (val === null || val === undefined || isNaN(Number(val))) return "0.00";
    return Number(val).toFixed(digits);
  };

  // Helper date formatter
  const formatDateString = (isoString: string) => {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString(lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="bg-slate-100 py-10 px-4 min-fluid print:bg-white print:p-0" id="receipt-printable-portal">
      <div className="max-w-3xl mx-auto space-y-6 print:space-y-0">
        
        {/* Navigation Action header: non-printable zone */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs print:hidden text-start">
          <button
            type="button"
            onClick={onBackToTracking}
            className="text-slate-600 hover:text-slate-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
            id="btn-receipt-back"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>{lang === "ar" ? "العودة إلى لوحة الاستعلام" : "Back to Lookup Dashboard"}</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
              id="btn-receipt-print"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === "ar" ? "معاينة الطباعة" : "Print Preview"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadReceipt}
              disabled={downloadingPdf}
              className="px-4 py-2 bg-[#12255c] hover:bg-[#1a3275] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-sm disabled:opacity-75 disabled:cursor-wait"
              id="btn-receipt-download"
            >
              {downloadingPdf ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0"></span>
                  <span>{lang === "ar" ? "جاري التحميل..." : "Downloading..."}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 shrink-0" />
                  <span>{lang === "ar" ? "تحميل الوصل الرقمي" : "Download Digital Receipt"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Printable Paper Document Card */}
        <div 
          className="bg-white border-2 border-slate-350 rounded-2xl p-6 sm:p-10 shadow-lg relative print:shadow-none print:border-0 print:p-0" 
          id="official-receipt-sheet"
          style={{ direction: lang === "ar" ? "rtl" : "ltr" }}
        >
          
          {/* Header Algerian national Emblem */}
          <div className="text-center space-y-2 mb-8 select-none">
            <p className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-wide">
              {lang === "ar" 
                ? "الجمهورية الجزائرية الديمقراطية الشعبية" 
                : "République Algérienne Démocratique et Populaire"}
            </p>
            <p className="text-[10px] sm:text-xs font-bold text-slate-700 leading-normal">
              {application.applicationType === "l3_specialty" ? (
                lang === "ar"
                  ? "وزارة التعليم العالي والبحث العلمي • جامعة عمار ثليجي بالأغواط"
                  : "Ministère de l'Enseignement Supérieur • Université Amar Telidji de Laghouat"
              ) : (
                lang === "ar"
                  ? "وزارة التعليم العالي والبحث العلمي • اللجنة الوطنية للماستر الإلكتروني"
                  : "Ministère de l'Enseignement Supérieur et de la Recherche Scientifique"
              )}
            </p>
            <div className="w-24 h-0.5 bg-slate-300 mx-auto my-3"></div>
            <p className="text-xl sm:text-2xl font-black text-[#131f40] leading-none uppercase tracking-wide">
              {application.applicationType === "l3_specialty" ? (
                lang === "ar" 
                  ? "وصل تأكيد خيارات رغبات التوجيه - طور أول" 
                  : lang === "fr" 
                  ? "RÉCÉPISSÉ DE CONFIRMATION DES VOEUX D'ORIENTATION" 
                  : "ACADEMIC ORIENTATION CHOICE VERIFICATION RECEIPT"
              ) : (
                lang === "ar" 
                  ? "وصل تسجيل تأكيد ترشيح الماستر" 
                  : lang === "fr" 
                  ? "RECEPISE DE CONFIRMATION DE CANDIDATURE" 
                  : "MASTER REGISTRATION CONFIRMATION RECEIPT"
              )}
            </p>
            <div className="mt-1.5 mb-1 text-center">
              <span className="inline-block bg-[#12255c]/5 text-[#12255c] border border-[#12255c]/10 px-3.5 py-1 rounded-lg text-xs font-extrabold font-mono">
                {lang === "ar" ? "السنة الدراسية المسجل فيها:" : "Enrolled Academic Year:"} {getAcademicYear()}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider">
              {application.applicationType === "l3_specialty" ? "ORIENTATION ID" : "REGISTRATION ID"}: {application.id}
            </p>
          </div>

          {/* Details layout Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-b border-slate-200 py-6 my-6 text-start text-xs sm:text-sm">
            
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold text-[#143d29] uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded inline-block">
                {application.applicationType === "l3_specialty" 
                  ? (lang === "ar" ? "1. معلومات الطالب المترشح:" : "1. Candidate Details:")
                  : (lang === "ar" ? "1. معلومات الطالب المقبول:" : "1. Admitted Candidate Details:")}
              </h4>
              <div className="space-y-1 sm:pl-3">
                <p className="text-slate-400 text-[11px] font-bold">{lang === "ar" ? "الاسم واللقب (عربي):" : "Full Name (Arabic):"}</p>
                <p className="font-extrabold text-slate-800 text-sm">
                  {application.firstNameAr} {application.lastNameAr}
                </p>
              </div>
              <div className="space-y-1 sm:pl-3">
                <p className="text-slate-400 text-[11px] font-bold">{lang === "ar" ? "الاسم واللقب (لاتيني):" : "Full Name (Latin):"}</p>
                <p className="font-bold text-slate-700 font-sans">
                  {application.firstNameEn} {application.lastNameEn}
                </p>
              </div>
              <div className="space-y-1 sm:pl-3">
                <p className="text-slate-400 text-[11px] font-bold">{lang === "ar" ? "رقم الطالب الوطني BAC:" : "National BAC Student ID:"}</p>
                <p className="font-mono font-bold text-slate-800 tracking-wider text-sm select-all">
                  {application.nationalStudentId}
                </p>
              </div>
              <div className="space-y-1 sm:pl-3">
                <p className="text-slate-400 text-[11px] font-bold">{lang === "ar" ? "بريد المترشح وهاتفه:" : "Email & Mobile Phone:"}</p>
                <p className="font-medium text-slate-700">
                  {application.email} | {application.phone}
                </p>
              </div>
            </div>

            <div className="space-y-3.5 border-t md:border-t-0 md:border-r border-slate-250 md:pr-6 pt-6 md:pt-0">
              <h4 className="text-xs font-bold text-[#132759] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded inline-block">
                {application.applicationType === "l3_specialty" ? (lang === "ar" ? "2. تفاصيل المسار الدراسي والنتائج:" : "2. Academic Track & GPA Details:") : (lang === "ar" ? "2. المرجعية بلقب ليسانس:" : "2. Bachelor's / Licence Roster Info:")}
              </h4>
              {application.applicationType === "l3_specialty" ? (
                <>
                  <div className="space-y-1">
                     <p className="text-slate-400 text-[11px] font-bold">{lang === "ar" ? "المؤسسة والمستوى الدراسي:" : "Origin & Study Level:"}</p>
                     <p className="font-bold text-slate-850">
                       {lang === "ar" ? "جامعة عمار ثليجي بالأغوااط • ثانية ليسانس" : "Amar Telidji Laghouat University • L2"}
                     </p>
                   </div>
                   <div className="space-y-1">
                     <p className="text-slate-400 text-[11px] font-bold">{lang === "ar" ? "الشعبة والجذع المشترك الثاني:" : "Major Branch / Specialization:"}</p>
                     <p className="font-bold text-slate-800">
                       {lang === "ar" ? "علوم وتكنولوجيا (ST)" : "Science & Technology (ST)"}
                     </p>
                   </div>
                   <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                     <div className="space-y-0.5 text-center">
                       <p className="text-slate-400 text-[9px] font-bold">{lang === "ar" ? "معدل السنة أولى L1:" : "Year 1 Average:"}</p>
                       <p className="font-mono text-xs font-extrabold text-slate-700">{safeFormatGpa(application.l1Gpa ?? application.licenceGpa, 2)} / 20</p>
                     </div>
                     <div className="space-y-0.5 text-center">
                       <p className="text-slate-400 text-[9px] font-bold">{lang === "ar" ? "معدل السنة ثانية L2:" : "Year 2 Average:"}</p>
                       <p className="font-mono text-xs font-extrabold text-slate-700">{safeFormatGpa(application.l2Gpa ?? application.licenceGpa, 2)} / 20</p>
                     </div>
                   </div>
                   <div className="space-y-1">
                     <p className="text-slate-400 text-[11px] font-bold">{lang === "ar" ? "معدل توجيه الطور الأول الترتيبي:" : "Overall Orientation GPA:"}</p>
                     <p className="font-mono text-sm font-extrabold text-emerald-850">
                       {safeFormatGpa(application.licenceGpa, 2)} / 20
                     </p>
                   </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <p className="text-slate-400 text-[11px] font-bold">{lang === "ar" ? "الجامعة والمؤسسة الجامعية:" : "Graduation University Hub:"}</p>
                    <p className="font-bold text-slate-805">
                      {application.university}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 text-[11px] font-bold">{lang === "ar" ? "تخصص ليسانس المعتمد:" : "Licence Specialty major:"}</p>
                    <p className="font-bold text-slate-800">
                      {getSpecName(application.licenceSpecialty)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 text-[11px] font-bold">{lang === "ar" ? "المعدل العام السنوي للتخرج (GPA):" : "Graduation GPA Score:"}</p>
                    <p className="font-mono text-base font-extrabold text-[#113d28]">
                      {safeFormatGpa(application.licenceGpa, 2)} / 20
                    </p>
                  </div>
                </>
              )}
              <div className="space-y-1">
                <p className="text-slate-400 text-[11px] font-bold">{lang === "ar" ? "تاريخ ووقت توقيع الاستمارة والختم:" : "Seal Timestamp:"}</p>
                <p className="text-xs text-slate-500 font-sans">
                  {formatDateString(application.createdAt)}
                </p>
              </div>
            </div>

          </div>
          {application.applicationType === "l3_specialty" ? (
            /* L3 Specialty Choice submission list instead of pedagogical verdict decision */
            <div className="p-5 sm:p-6 bg-indigo-50/50 border border-indigo-200 rounded-2xl text-start space-y-3">
              <div className="flex items-center gap-2.5 text-indigo-900">
                <FileText className="w-6 h-6 text-indigo-600 shrink-0" />
                <h3 className="font-extrabold text-indigo-950 text-sm sm:text-base">
                  {lang === "ar" ? "تفاصيل خيارات الشعب ورغبات التوجيه المودعة:" : "Registered Specialty Choice Preferences List:"}
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {lang === "ar" 
                  ? "تم تسجيل خيارات الرغبات الأربع التالية بنجاح في نظام التوجيه والتوزيع الآلي لطلبة السنة الثالثة ليسانس:" 
                  : "The following 4 specialty options have been successfully recorded in the automated placement queue for L3 students:"}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {application.choices.map((choiceId, index) => {
                  const num = index + 1;
                  const isAr = lang === "ar";
                  return (
                    <div 
                      key={index} 
                      className="bg-white rounded-xl border border-slate-200 shadow-xs relative p-3 min-h-[50px] flex items-center"
                      style={{ direction: isAr ? "rtl" : "ltr" }}
                    >
                      {/* Number circle badge */}
                      <span 
                        className={`w-6 h-6 rounded-full bg-indigo-100 text-indigo-900 font-extrabold text-xs flex items-center justify-center absolute ${
                          isAr ? "right-3" : "left-3"
                        } top-1/2 -translate-y-1/2`}
                      >
                        {num}
                      </span>

                      {/* Clean Program Name (Wrapped safely without flex truncation bugs) */}
                      <div 
                        className={`text-slate-800 font-extrabold text-xs leading-normal flex-grow ${
                          isAr ? "mr-8 ml-22 text-right" : "ml-8 mr-22 text-left"
                        }`}
                        style={{ 
                          direction: isAr ? "rtl" : "ltr",
                          textAlign: isAr ? "right" : "left"
                        }}
                      >
                        {getProgName(choiceId)}
                      </div>

                      {/* Choice relative rank badge */}
                      <span 
                        className={`text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 absolute ${
                          isAr ? "left-3" : "right-3"
                        } top-1/2 -translate-y-1/2`}
                      >
                        {isAr ? `الرغبة ${num}` : `Choice ${num}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Master Specialty Choice submission list instead of single accepted pedagogical verdict */
            <div className="p-5 sm:p-6 bg-[#ebfbf3] border border-emerald-200 rounded-2xl text-start space-y-3">
              <div className="flex items-center gap-2.5 text-emerald-900">
                <FileText className="w-6 h-6 text-emerald-600 shrink-0" />
                <h3 className="font-extrabold text-emerald-950 text-sm sm:text-base">
                  {lang === "ar" ? "تفاصيل خيارات رغبات الماستر المودعة بملف المنصة:" : "Registered Master Program Specialty Choice Preferences:"}
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {lang === "ar" 
                  ? "تم تسجيل وتأكيد خيارات الرغبات الأربع التالية بنجاح في ملف ترشيح الماستر للموسم الجامعي الحالي:" 
                  : "The following 4 Master program choices have been successfully recorded in your electronic admission profile:"}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {application.choices.map((choiceId, index) => {
                  const num = index + 1;
                  const isAr = lang === "ar";
                  return (
                    <div 
                      key={index} 
                      className="bg-white rounded-xl border border-slate-200 shadow-xs relative p-3 min-h-[50px] flex items-center"
                      style={{ direction: isAr ? "rtl" : "ltr" }}
                    >
                      {/* Number circle badge */}
                      <span 
                        className={`w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-xs flex items-center justify-center absolute ${
                          isAr ? "right-3" : "left-3"
                        } top-1/2 -translate-y-1/2`}
                      >
                        {num}
                      </span>

                      {/* Clean Program Name (Wrapped safely without flex truncation bugs) */}
                      <div 
                        className={`text-slate-800 font-extrabold text-xs leading-normal flex-grow ${
                          isAr ? "mr-8 ml-22 text-right" : "ml-8 mr-22 text-left"
                        }`}
                        style={{ 
                          direction: isAr ? "rtl" : "ltr",
                          textAlign: isAr ? "right" : "left"
                        }}
                      >
                        {getProgName(choiceId)}
                      </div>

                      {/* Choice relative rank badge */}
                      <span 
                        className={`text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 absolute ${
                          isAr ? "left-3" : "right-3"
                        } top-1/2 -translate-y-1/2`}
                      >
                        {isAr ? `الرغبة ${num}` : `Choice ${num}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Documents Checklist OR academic notices block */}
          {application.applicationType === "master" && !isAppMaster80Percent(application) ? (
            /* List of uploaded documents checklist summary (Master Only) */
            <div className="mt-6 text-start">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{lang === "ar" ? "قائمة المستندات الرقمية المرفوعة والمودعة بملف المنصة:" : "Compliant Electronic documents uploaded:"}</h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 opacity-80 font-sans shadow-xs">
                  <div className="w-4 h-4 rounded bg-emerald-100 text-emerald-850 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 pr-1.5 text-start">
                    <p className="font-semibold text-slate-400 text-[9px] uppercase tracking-wider">{lang === "ar" ? "كشف نقاط الليسانس" : "Licence transcripts"}</p>
                    <p className="truncate font-bold text-slate-800 text-xs" title={application.uploadedFileNames?.transcript || "transcript_complete.pdf"}>
                      {application.uploadedFileNames?.transcript || "transcript_complete.pdf"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 opacity-80 border-t sm:border-t-0 sm:border-x border-slate-200 pt-2 sm:pt-0 sm:px-3 font-sans shadow-xs">
                  <div className="w-4 h-4 rounded bg-emerald-100 text-emerald-850 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 pr-1.5 text-start">
                    <p className="font-semibold text-slate-400 text-[9px] uppercase tracking-wider">{lang === "ar" ? "شهادة تخرج ليسانس" : "Bachelor success degree"}</p>
                    <p className="truncate font-bold text-slate-800 text-xs" title={application.uploadedFileNames?.diploma || "diploma_licence.pdf"}>
                      {application.uploadedFileNames?.diploma || "diploma_licence.pdf"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 opacity-80 border-t sm:border-t-0 pt-2 sm:pt-0 font-sans shadow-xs">
                  <div className="w-4 h-4 rounded bg-emerald-100 text-emerald-850 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 pr-1.5 text-start">
                    <p className="font-semibold text-slate-400 text-[9px] uppercase tracking-wider">{lang === "ar" ? "بطاقة التعريف الوطنية" : "National Identity Card"}</p>
                    <p className="truncate font-bold text-slate-800 text-xs" title={application.uploadedFileNames?.idCard || "nationalID_biometric.jpg"}>
                      {application.uploadedFileNames?.idCard || "nationalID_biometric.jpg"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Automatic data retrieval notice (L3 & Master 80% Exemption) */
            <div className="mt-6 text-start">
              <div className="p-4 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs sm:text-sm text-start leading-relaxed shadow-xs">
                ℹ️ {lang === "ar" 
                  ? (application.applicationType === "l3_specialty"
                      ? "تنويه إداري: تطابق خيارات رغبات التوجيه يتم آلياً بناء على كشوف النقاط المستخرجة رقمياً من نظام مدرسة طور الليسانس لسرعة الدقة." 
                      : "تنويه إداري: تم إعفاؤك من رفع الكشوف والمرفقات لأنك ضمن فئة 80% (خريجو جامعة عمار ثليجي بالأغواط السنة الحالية)، حيث يتم سحب ملفك البيداغوجي آلياً من قاعدة البيانات الرسمية للجامعة.")
                  : (application.applicationType === "l3_specialty"
                      ? "Academic process memo: Candidate placement parameters and yearly averages are compiled dynamically from official university databases without manual physical documentation uploads."
                      : "Academic process memo: You are exempt from manual document uploads as part of the 80% quota (current year Laghouat grads). Your pedagogical dossier is retrieved automatically from the official university database.")}
              </div>
            </div>
          )}

          {/* Footer - Digitally generated receipt acknowledgment for both Master and L3 */}
          <div className="mt-12 pt-6 border-t border-dashed border-slate-300 text-center">
            <p className="text-xs text-slate-400 italic font-medium leading-relaxed">
              {lang === "ar" 
                ? "✓ هذا الوصل مستخرج إلكترونياً وتلقائياً ومؤمن بالكامل، ولا يتطلب أي إمضاء يدوي أو ختم ورقي تقليدي." 
                : "✓ This receipt has been generated automatically and is fully authenticated digitally. No manual signature or physical seal is required."}
            </p>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase mt-1">
              {application.applicationType === "l3_specialty" ? "SYSTEM CORRELATION ID" : "REGISTRATION ID"}: {application.id} • STAMP TIME: {formatDateString(application.createdAt)}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
