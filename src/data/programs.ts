/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MasterProgram, LicenceSpecialty } from "../types";

export interface LocalizedUniversity {
  id: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
}

export const UNIVERSITIES: LocalizedUniversity[] = [
  {
    id: "UNIV-LAGHOUAT",
    nameAr: "جامعة عمار ثليجي - الأغواط",
    nameFr: "Université Amar Telidji - Laghouat",
    nameEn: "Amar Telidji University - Laghouat"
  },
  {
    id: "USTHB",
    nameAr: "جامعة العلوم والتكنولوجيا هواري بومدين - الجزائر",
    nameFr: "Université des Sciences et de la Technologie Houari Boumediene - Alger",
    nameEn: "University of Science and Technology Houari Boumediene - Algiers"
  },
  {
    id: "UNIV-ALGER1",
    nameAr: "جامعة الجزائر 1 - بن يوسف بن خدة",
    nameFr: "Université d'Alger 1",
    nameEn: "University of Algiers 1"
  },
  {
    id: "UNIV-ALGER2",
    nameAr: "جامعة الجزائر 2 - أبو القاسم سعد الله",
    nameFr: "Université d'Alger 2",
    nameEn: "University of Algiers 2"
  },
  {
    id: "UNIV-ALGER3",
    nameAr: "جامعة الجزائر 3 - إبراهيم سلطان شيبوط",
    nameFr: "Université d'Alger 3",
    nameEn: "University of Algiers 3"
  },
  {
    id: "UNIV-ORAN1",
    nameAr: "جامعة وهران 1 - أحمد بن بلة",
    nameFr: "Université d'Oran 1",
    nameEn: "University of Oran 1"
  },
  {
    id: "UNIV-ORAN2",
    nameAr: "جامعة وهران 2 - محمد بن أحمد",
    nameFr: "Université d'Oran 2",
    nameEn: "University of Oran 2"
  },
  {
    id: "USTO",
    nameAr: "جامعة العلوم والتكنولوجيا وهران - محمد بوضياف",
    nameFr: "Université des Sciences et de la Technologie d'Oran",
    nameEn: "University of Science and Technology of Oran"
  },
  {
    id: "UNIV-CONSTANTINE1",
    nameAr: "جامعة قسنطينة 1 - الإخوة منتوري",
    nameFr: "Université de Constantine 1",
    nameEn: "University of Constantine 1"
  },
  {
    id: "UNIV-CONSTANTINE2",
    nameAr: "جامعة قسنطينة 2 - عبد الحميد مهري",
    nameFr: "Université de Constantine 2",
    nameEn: "University of Constantine 2"
  },
  {
    id: "UNIV-CONSTANTINE3",
    nameAr: "جامعة قسنطينة 3 - صالح بوبنيدر",
    nameFr: "Université de Constantine 3",
    nameEn: "University of Constantine 3"
  },
  {
    id: "UNIV-SETIF1",
    nameAr: "جامعة سطيف 1 - فرحات عباس",
    nameFr: "Université de Sétif 1",
    nameEn: "University of Setif 1"
  },
  {
    id: "UNIV-SETIF2",
    nameAr: "جامعة سطيف 2 - لمين دباغين",
    nameFr: "Université de Sétif 2",
    nameEn: "University of Setif 2"
  },
  {
    id: "UNIV-TLEMCEN",
    nameAr: "جامعة تلمسان - أبو بكر بلقايد",
    nameFr: "Université de Tlemcen",
    nameEn: "University of Tlemcen"
  },
  {
    id: "UNIV-ANNABA",
    nameAr: "جامعة عنابة - باجي مختار",
    nameFr: "Université d'Annaba",
    nameEn: "University of Annaba"
  },
  {
    id: "UNIV-BATNA1",
    nameAr: "جامعة باتنة 1 - الحاج لخضر",
    nameFr: "Université de Batna 1",
    nameEn: "University of Batna 1"
  },
  {
    id: "UNIV-BATNA2",
    nameAr: "جامعة باتنة 2 - مصطفى بن بولعيد",
    nameFr: "Université de Batna 2",
    nameEn: "University of Batna 2"
  },
  {
    id: "UNIV-BISKRA",
    nameAr: "جامعة بسكرة - محمد خيضر",
    nameFr: "Université de Biskra",
    nameEn: "University of Biskra"
  },
  {
    id: "UNIV-BLIDA1",
    nameAr: "جامعة البليدة 1 - سعد دحلب",
    nameFr: "Université de Blida 1",
    nameEn: "University of Blida 1"
  },
  {
    id: "UNIV-BLIDA2",
    nameAr: "جامعة البليدة 2 - علي لونيسي",
    nameFr: "Université de Blida 2",
    nameEn: "University of Blida 2"
  },
  {
    id: "UNIV-BOUIRA",
    nameAr: "جامعة البويرة - أكلي محند أولحاج",
    nameFr: "Université de Bouira",
    nameEn: "University of Bouira"
  },
  {
    id: "UNIV-BOUMERDES",
    nameAr: "جامعة بومرداس - امحمد بوقرة",
    nameFr: "Université de Boumerdès",
    nameEn: "University of Boumerdes"
  },
  {
    id: "UNIV-BEJAIA",
    nameAr: "جامعة بجاية - عبد الرحمن ميرة",
    nameFr: "Université de Béjaïa",
    nameEn: "University of Bejaia"
  },
  {
    id: "UNIV-CHLEF",
    nameAr: "جامعة الشلف - حسيبة بن بوعلي",
    nameFr: "Université de Chlef",
    nameEn: "University of Chlef"
  },
  {
    id: "UNIV-DJELFA",
    nameAr: "جامعة الجلفة - زيان عاشور",
    nameFr: "Université de Djelfa",
    nameEn: "University of Djelfa"
  },
  {
    id: "UNIV-ELOUED",
    nameAr: "جامعة الوادي - حمه لخضر",
    nameFr: "Université d'El Oued",
    nameEn: "University of El Oued"
  },
  {
    id: "UNIV-GUELMA",
    nameAr: "جامعة قالمة - 8 ماي 1945",
    nameFr: "Université de Guelma",
    nameEn: "University of Guelma"
  },
  {
    id: "UNIV-JIJEL",
    nameAr: "جامعة جيجل - محمد الصديق بن يحيى",
    nameFr: "Université de Jijel",
    nameEn: "University of Jijel"
  },
  {
    id: "UNIV-SBA",
    nameAr: "جامعة سيدي بلعابس - الجيلالي اليابس",
    nameFr: "Université de Sidi Bel Abbès",
    nameEn: "University of Sidi Bel Abbes"
  },
  {
    id: "UNIV-MOSTAGANEM",
    nameAr: "جامعة مستغانم - عبد الحميد ابن باديس",
    nameFr: "Université de Mostaganem",
    nameEn: "University of Mostaganem"
  },
  {
    id: "UNIV-MSILA",
    nameAr: "جامعة المسيلة - محمد بوضياف",
    nameFr: "Université de M'Sila",
    nameEn: "University of M'Sila"
  },
  {
    id: "UNIV-MASCARA",
    nameAr: "جامعة معسكر - مصطفى اسطمبولي",
    nameFr: "Université de Mascara",
    nameEn: "University of Mascara"
  },
  {
    id: "UNIV-OUARGLA",
    nameAr: "جامعة ورقلة - قاصدي مرباح",
    nameFr: "Université d'Ouargla",
    nameEn: "University of Ouargla"
  },
  {
    id: "UNIV-SAIDA",
    nameAr: "جامعة سعيدة - الدكتور مولاي الطاهر",
    nameFr: "Université de Saïda",
    nameEn: "University of Saida"
  },
  {
    id: "UNIV-SKIKDA",
    nameAr: "جامعة سكيكدة - 20 أوت 1955",
    nameFr: "Université de Skikda",
    nameEn: "University of Skikda"
  },
  {
    id: "UNIV-TEBESSA",
    nameAr: "جامعة تبسة - العربي التبسي",
    nameFr: "Université de Tébessa",
    nameEn: "University of Tebessa"
  },
  {
    id: "UNIV-TIARET",
    nameAr: "جامعة تيارت - ابن خلدون",
    nameFr: "Université de Tiaret",
    nameEn: "University of Tiaret"
  },
  {
    id: "UNIV-TIZIOUZOU",
    nameAr: "جامعة تيزي وزو - مولود معمري",
    nameFr: "Université de Tizi Ouzou",
    nameEn: "University of Tizi Ouzou"
  },
  {
    id: "UNIV-KHEMIS",
    nameAr: "جامعة خميس مليانة - الجيلالي بونعامة",
    nameFr: "Université de Khemis Miliana",
    nameEn: "University of Khemis Miliana"
  },
  {
    id: "UNIV-GHARDAIA",
    nameAr: "جامعة غرداية",
    nameFr: "Université de Ghardaïa",
    nameEn: "University of Ghardaia"
  },
  {
    id: "UNIV-ADRAR",
    nameAr: "جامعة أدرار - أحمد دراية",
    nameFr: "Université d'Adrar",
    nameEn: "University of Adrar"
  },
  {
    id: "UNIV-BECHAR",
    nameAr: "جامعة بشار - طاهري محمد",
    nameFr: "Université de Béchar",
    nameEn: "University of Bechar"
  },
  {
    id: "UNIV-ELTARF",
    nameAr: "جامعة الطارف - الشاذلي بن جديد",
    nameFr: "Université d'El Tarf",
    nameEn: "University of El Tarf"
  },
  {
    id: "UNIV-AIN-TEMOUCHENT",
    nameAr: "جامعة عين تموشنت - بلحاج بوشعيب",
    nameFr: "Université d'Aïn Témouchent",
    nameEn: "University of Ain Temouchent"
  },
  {
    id: "UNIV-RELIZANE",
    nameAr: "جامعة غليزان - أحمد زبانة",
    nameFr: "Université de Relizane",
    nameEn: "University of Relizane"
  },
  {
    id: "UNIV-MILA",
    nameAr: "المركز الجامعي ميلة - عبد الحفيظ بوالصوف",
    nameFr: "Centre Universitaire de Mila",
    nameEn: "University Center of Mila"
  },
  {
    id: "UNIV-SOUKAHRAS",
    nameAr: "جامعة سوق أهراس - محمد الشريف مساعدية",
    nameFr: "Université de Souk Ahras",
    nameEn: "University of Souk Ahras"
  },
  {
    id: "UNIV-KHENCHELA",
    nameAr: "جامعة خنشلة - عباس لغرور",
    nameFr: "Université de Khenchela",
    nameEn: "University of Khenchela"
  },
  {
    id: "UNIV-TIPAZA",
    nameAr: "المركز الجامعي تيبازة - عبد الله مرسلي",
    nameFr: "Centre Universitaire de Tipaza",
    nameEn: "University Center of Tipaza"
  },
  {
    id: "UNIV-TAMANRASSET",
    nameAr: "المركز الجامعي تمنراست - الحاج باخامى",
    nameFr: "Centre Universitaire de Tamanrasset",
    nameEn: "University Center of Tamanrasset"
  },
  {
    id: "UNIV-ILLIZI",
    nameAr: "المركز الجامعي إليزي - المقاوم الشيخ آمود أق المختار",
    nameFr: "Centre Universitaire d'Illizi",
    nameEn: "University Center of Illizi"
  },
  {
    id: "UNIV-TINDOUF",
    nameAr: "المركز الجامعي تندوف - علي كافي",
    nameFr: "Centre Universitaire de Tindouf",
    nameEn: "University Center of Tindouf"
  }
];

export const LICENCE_SPECIALTIES: LicenceSpecialty[] = [
  {
    id: "L-ENER",
    nameAr: "ليسانس الطاقوية",
    nameFr: "Licence de Génie Énergétique",
    nameEn: "Bachelor of Energetics Engineering"
  },
  {
    id: "L-MECH",
    nameAr: "ليسانس إنشاء ميكانيكي",
    nameFr: "Licence de Construction Mécanique",
    nameEn: "Bachelor of Mechanical Construction"
  },
  {
    id: "L-AERO",
    nameAr: "ليسانس الطيران (أيروناتيك)",
    nameFr: "Licence d'Aéronautique",
    nameEn: "Bachelor of Aeronautics"
  },
  {
    id: "L-GP",
    nameAr: "ليسانس هندسة الطرائق",
    nameFr: "Licence de Génie des Procédés",
    nameEn: "Bachelor of Process Engineering"
  },
  {
    id: "L-MAT",
    nameAr: "ليسانس هندسة المواد",
    nameFr: "Licence de Génie des Matériaux",
    nameEn: "Bachelor of Materials Engineering"
  },
  {
    id: "L-PHY-MAT",
    nameAr: "ليسانس فيزياء المواد (SM)",
    nameFr: "Licence de Physique des Matériaux (SM)",
    nameEn: "Bachelor of Materials Physics"
  },
  {
    id: "L-MET",
    nameAr: "ليسانس علم الفلزات (ميتالورجي)",
    nameFr: "Licence de Métallurgie",
    nameEn: "Bachelor of Metallurgy"
  },
  {
    id: "L-CHM-MAT",
    nameAr: "ليسانس كيمياء المواد (SM)",
    nameFr: "Licence de Chimie des Matériaux (SM)",
    nameEn: "Bachelor of Materials Chemistry"
  },
  {
    id: "L-PHY-ENER",
    nameAr: "ليسانس الفيزياء الطاقوية (SM)",
    nameFr: "Licence de Physique Énergétique (SM)",
    nameEn: "Bachelor of Energetic Physics"
  },
  {
    id: "L-ELM",
    nameAr: "ليسانس كهروميكانيك",
    nameFr: "Licence d'Électromécanique",
    nameEn: "Bachelor of Electromechanics"
  },
  {
    id: "L-MAIN",
    nameAr: "ليسانس الصيانة الصناعية",
    nameFr: "Licence de Maintenance Industrielle",
    nameEn: "Bachelor of Industrial Maintenance"
  },
  {
    id: "L-ELT",
    nameAr: "ليسانس كهروبطاطية (إلكتروتقني)",
    nameFr: "Licence d'Électrotechnique",
    nameEn: "Bachelor of Electrotechnics"
  },
  {
    id: "L-ELE",
    nameAr: "ليسانس إلكترونيك",
    nameFr: "Licence d'Électronique",
    nameEn: "Bachelor of Electronics"
  },
  {
    id: "L-OTHER",
    nameAr: "تخصص آخر غير مدرج",
    nameFr: "Autre spécialité non répertoriée",
    nameEn: "Other discipline not listed"
  }
];

export const COMPATIBILITY_RULES: Record<string, { licenceId: string; coeff: number; rank: number }[]> = {
  "M-ST-ENER": [ // Master Énergétique
    { licenceId: "L-ENER", coeff: 1.00, rank: 1 },
    { licenceId: "L-AERO", coeff: 0.80, rank: 2 },
    { licenceId: "L-MECH", coeff: 0.80, rank: 2 },
    { licenceId: "L-GP", coeff: 0.70, rank: 3 }
  ],
  "M-ST-MAT": [ // Master Génie des Matériaux
    { licenceId: "L-MAT", coeff: 1.00, rank: 1 },
    { licenceId: "L-PHY-MAT", coeff: 0.80, rank: 2 },
    { licenceId: "L-MET", coeff: 0.80, rank: 2 },
    { licenceId: "L-CHM-MAT", coeff: 0.70, rank: 3 },
    { licenceId: "L-MECH", coeff: 0.70, rank: 3 },
    { licenceId: "L-ENER", coeff: 0.70, rank: 3 }
  ],
  "M-ST-RE": [ // Master Énergies Renouvelables
    { licenceId: "L-MECH", coeff: 1.00, rank: 1 },
    { licenceId: "L-ENER", coeff: 1.00, rank: 1 },
    { licenceId: "L-PHY-ENER", coeff: 0.80, rank: 2 },
    { licenceId: "L-MAT", coeff: 0.80, rank: 2 },
    { licenceId: "L-ELM", coeff: 0.80, rank: 2 },
    { licenceId: "L-MAIN", coeff: 0.80, rank: 2 }
  ],
  "M-ST-MAIN": [ // Master Maintenance Industrielle
    { licenceId: "L-MAIN", coeff: 1.00, rank: 1 },
    { licenceId: "L-ELM", coeff: 0.80, rank: 2 },
    { licenceId: "L-ELT", coeff: 0.70, rank: 3 },
    { licenceId: "L-ELE", coeff: 0.70, rank: 3 },
    { licenceId: "L-MECH", coeff: 0.70, rank: 3 },
    { licenceId: "L-ENER", coeff: 0.70, rank: 3 }
  ]
};

export function getCompatibilityDetails(programId: string, licenceSpecialtyId: string): { coeff: number; rank: number; labelAr: string; labelFr: string; labelEn: string } {
  const rules = COMPATIBILITY_RULES[programId];
  if (!rules) {
    return { coeff: 0.50, rank: 4, labelAr: "مقبول جزئياً", labelFr: "Compatibilité faible", labelEn: "Low compatibility" };
  }
  const match = rules.find(r => r.licenceId === licenceSpecialtyId);
  if (match) {
    let labelAr = "توافق متوسط";
    let labelFr = "Compatibilité moyenne";
    let labelEn = "Medium compatibility";
    if (match.rank === 1) {
      labelAr = "توافق تام (الرتبة 1)";
      labelFr = "Compatibilité totale (Rang 1)";
      labelEn = "Total compatibility (Rank 1)";
    } else if (match.rank === 2) {
      labelAr = "توافق جيد (الرتبة 2)";
      labelFr = "Bonne compatibilité (Rang 2)";
      labelEn = "Good compatibility (Rank 2)";
    } else if (match.rank === 3) {
      labelAr = "توافق متوسط (الرتبة 3)";
      labelFr = "Compatibilité moyenne (Rang 3)";
      labelEn = "Medium compatibility (Rank 3)";
    }
    return { coeff: match.coeff, rank: match.rank, labelAr, labelFr, labelEn };
  }
  if (licenceSpecialtyId === "L-OTHER") {
    return { coeff: 0.50, rank: 4, labelAr: "تخصص غير مصنف", labelFr: "Non répertorié", labelEn: "Not classified" };
  }
  return { coeff: 0.00, rank: 5, labelAr: "غير مطابق للشعبة", labelFr: "Incompatible", labelEn: "Incompatible" };
}

export const MASTER_PROGRAMS: MasterProgram[] = [
  {
    id: "M-ST-MAT",
    nameAr: "ماستر هندسة المواد",
    nameEn: "Master Materials Engineering",
    nameFr: "Master Génie des Matériaux",
    categoryAr: "هندسة المواد والفيزياء التطبيقية",
    categoryEn: "Materials Engineering & Applied Physics",
    categoryFr: "Génie des Matériaux & Physique Appliquée",
    facultyAr: "كلية التكنولوجيا - قسم الهندسة الميكانيكية",
    facultyEn: "Faculty of Technology - Department of Mechanical Engineering",
    facultyFr: "Faculté de Technologie - Département de Génie Mécanique",
    capacity: 4,
    minRecommendedGpa: 12.5,
    allowedLicenceSpecialties: ["L-MAT", "L-PHY-MAT", "L-MET", "L-CHM-MAT", "L-MECH", "L-ENER", "L-OTHER"]
  },
  {
    id: "M-ST-MAIN",
    nameAr: "ماستر الصيانة الصناعية",
    nameEn: "Master Industrial Maintenance",
    nameFr: "Master Maintenance Industrielle",
    categoryAr: "الهندسة الميكانيكية والصيانة",
    categoryEn: "Mechanical Engineering & Maintenance",
    categoryFr: "Génie Mécanique & Maintenance",
    facultyAr: "كلية التكنولوجيا - قسم الهندسة الميكانيكية",
    facultyEn: "Faculty of Technology - Department of Mechanical Engineering",
    facultyFr: "Faculté de Technologie - Département de Génie Mécanique",
    capacity: 4,
    minRecommendedGpa: 11.0,
    allowedLicenceSpecialties: ["L-MAIN", "L-ELM", "L-ELT", "L-ELE", "L-MECH", "L-ENER", "L-OTHER"]
  },
  {
    id: "M-ST-RE",
    nameAr: "ماستر الطاقات المتجددة في الميكانيك",
    nameEn: "Master Renewable Energies in Mechanics",
    nameFr: "Master Énergies Renouvelables en Mécanique",
    categoryAr: "تكنولوجيا الطاقات المتجددة والبيئة",
    categoryEn: "Renewable Energy Technology & Environment",
    categoryFr: "Technologie des Énergies Renouvelables & Environnement",
    facultyAr: "كلية التكنولوجيا - قسم الهندسة الميكانيكية",
    facultyEn: "Faculty of Technology - Department of Mechanical Engineering",
    facultyFr: "Faculté de Technologie - Département de Génie Mécanique",
    capacity: 4,
    minRecommendedGpa: 12.0,
    allowedLicenceSpecialties: ["L-MECH", "L-ENER", "L-PHY-ENER", "L-MAT", "L-ELM", "L-MAIN", "L-OTHER"]
  },
  {
    id: "M-ST-ENER",
    nameAr: "ماستر الطاقوية",
    nameEn: "Master Energetics",
    nameFr: "Master Énergétique",
    categoryAr: "هندسة الحراريات والطاقة",
    categoryEn: "Thermal & Energetics Engineering",
    categoryFr: "Thermique & Génie Énergétique",
    facultyAr: "كلية التكنولوجيا - قسم الهندسة الميكانيكية",
    facultyEn: "Faculty of Technology - Department of Mechanical Engineering",
    facultyFr: "Faculté de Technologie - Département de Génie Mécanique",
    capacity: 4,
    minRecommendedGpa: 11.5,
    allowedLicenceSpecialties: ["L-ENER", "L-AERO", "L-MECH", "L-GP", "L-OTHER"]
  }
];

export interface L3Specialty {
  id: string;
  nameAr: string;
  nameEn: string;
  nameFr: string;
  capacity: number;
}

export const L3_SPECIALTIES: L3Specialty[] = [
  { id: "L3-ENER", nameAr: "طاقوية", nameEn: "Energetics", nameFr: "Génie Énergétique", capacity: 20 },
  { id: "L3-MECH", nameAr: "إنشاء ميكانيكي", nameEn: "Mechanical Construction", nameFr: "Construction Mécanique", capacity: 15 },
  { id: "L3-MAIN", nameAr: "الصيانة الصناعية", nameEn: "Industrial Maintenance", nameFr: "Maintenance Industrielle", capacity: 20 },
  { id: "L3-MAT", nameAr: "هندسة المواد", nameEn: "Materials Engineering", nameFr: "Génie des Matériaux", capacity: 15 }
];

export const INITIAL_CANDIDATES = [];

// Re-hydrate capacities and academic year dynamically in standard runtime context
export function getAcademicYear(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("academic_year") || "2025/2026";
  }
  return "2025/2026";
}

export function setAcademicYear(year: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("academic_year", year);
  }
}

// Read and apply pedagogical capacities from localStorage if saved
if (typeof window !== "undefined") {
  const savedCapacities = localStorage.getItem("pedagogical_capacities");
  if (savedCapacities) {
    try {
      const caps = JSON.parse(savedCapacities);
      MASTER_PROGRAMS.forEach(p => {
        if (p.id && caps[p.id] !== undefined) {
          p.capacity = Number(caps[p.id]);
        }
      });
      L3_SPECIALTIES.forEach(s => {
        if (s.id && caps[s.id] !== undefined) {
          s.capacity = Number(caps[s.id]);
        }
      });
    } catch (e) {
      console.error("Failed to re-hydrate capacities:", e);
    }
  }
}

export type RegPeriodType = "master_80" | "master_20" | "l3_specialty" | "master";

export function getRegistrationPeriod(type: RegPeriodType): { startDate: string; endDate: string; isEnabled: boolean } {
  if (typeof window !== "undefined") {
    // Seed/initialize with correct default dates and ensure enabled
    if (!localStorage.getItem("reg_periods_init_v3")) {
      localStorage.setItem("reg_start_date_master_80", "2026-06-05");
      localStorage.setItem("reg_end_date_master_80", "2026-06-20");
      localStorage.setItem("reg_period_enabled_master_80", "true");

      localStorage.setItem("reg_start_date_master_20", "2026-06-12");
      localStorage.setItem("reg_end_date_master_20", "2026-06-25");
      localStorage.setItem("reg_period_enabled_master_20", "true");

      localStorage.setItem("reg_start_date_l3", "2026-06-08");
      localStorage.setItem("reg_end_date_l3", "2026-06-28");
      localStorage.setItem("reg_period_enabled_l3", "true");

      // Clear legacy overriding keys to avoid conflict
      localStorage.removeItem("reg_start_date");
      localStorage.removeItem("reg_end_date");
      localStorage.removeItem("reg_period_enabled");
      localStorage.removeItem("reg_start_date_master");
      localStorage.removeItem("reg_end_date_master");
      localStorage.removeItem("reg_period_enabled_master");

      localStorage.setItem("reg_periods_init_v3", "true");
    }

    let suffix = "l3";
    if (type === "master_80") suffix = "master_80";
    else if (type === "master_20") suffix = "master_20";
    else if (type === "master") suffix = "master";
    
    // Support fallback to legacy global keys if the level-specific key isn't set yet
    const legacyStart = localStorage.getItem("reg_start_date");
    const legacyEnd = localStorage.getItem("reg_end_date");
    const legacyEnabled = localStorage.getItem("reg_period_enabled");

    let defaultStart = "2026-06-08";
    let defaultEnd = "2026-06-28";
    if (type === "master_80" || type === "master") {
      defaultStart = "2026-06-05";
      defaultEnd = "2026-06-20";
    } else if (type === "master_20") {
      defaultStart = "2026-06-12";
      defaultEnd = "2026-06-25";
    }

    const start = localStorage.getItem(`reg_start_date_${suffix}`) || 
                  (type === "master_80" ? localStorage.getItem("reg_start_date_master") : null) || 
                  legacyStart || 
                  defaultStart;
                  
    const end = localStorage.getItem(`reg_end_date_${suffix}`) || 
                (type === "master_80" ? localStorage.getItem("reg_end_date_master") : null) || 
                legacyEnd || 
                defaultEnd;
                
    let enabledVal = localStorage.getItem(`reg_period_enabled_${suffix}`);
    if (enabledVal === null && type === "master_80") {
      enabledVal = localStorage.getItem("reg_period_enabled_master");
    }
    const enabled = enabledVal !== null 
      ? enabledVal !== "false"
      : legacyEnabled !== null ? legacyEnabled !== "false" : true;

    return { startDate: start, endDate: end, isEnabled: enabled };
  }
  
  let defaultStart = "2026-06-08";
  let defaultEnd = "2026-06-28";
  if (type === "master_80" || type === "master") {
    defaultStart = "2026-06-05";
    defaultEnd = "2026-06-20";
  } else if (type === "master_20") {
    defaultStart = "2026-06-12";
    defaultEnd = "2026-06-25";
  }
  return { startDate: defaultStart, endDate: defaultEnd, isEnabled: true };
}

export function setRegistrationPeriod(type: RegPeriodType, start: string, end: string, enabled: boolean): void {
  if (typeof window !== "undefined") {
    let suffix = "l3";
    if (type === "master_80") suffix = "master_80";
    else if (type === "master_20") suffix = "master_20";
    else if (type === "master") suffix = "master";
    
    localStorage.setItem(`reg_start_date_${suffix}`, start);
    localStorage.setItem(`reg_end_date_${suffix}`, end);
    localStorage.setItem(`reg_period_enabled_${suffix}`, enabled ? "true" : "false");
  }
}

export function isRegistrationOpen(type: RegPeriodType): boolean {
  const { startDate, endDate, isEnabled } = getRegistrationPeriod(type);
  if (!isEnabled) return false;
  
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (startDate.length <= 10) {
    start.setHours(0, 0, 0, 0);
  }
  if (endDate.length <= 10) {
    end.setHours(23, 59, 59, 999);
  }
  
  return now >= start && now <= end;
}


