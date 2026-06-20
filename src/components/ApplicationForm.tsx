/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  GraduationCap, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  FileCheck, 
  AlertTriangle, 
  Upload, 
  Trash2,
  HelpCircle,
  BookOpen,
  Info,
  X,
  Clock,
  Search
} from "lucide-react";
import { UNIVERSITIES, LICENCE_SPECIALTIES, MASTER_PROGRAMS, getCompatibilityDetails, L3_SPECIALTIES, getRegistrationPeriod, isRegistrationOpen } from "../data/programs";
import { CandidateApplication, ApplicationStatus, DocumentUploads } from "../types";
import { translations, LangType } from "../data/translations";

interface ApplicationFormProps {
  onApplicationSubmit: (app: CandidateApplication) => void;
  onNavigateToTracking: (idToSearch?: string) => void;
  lang: LangType;
  isSiteAdmin?: boolean;
}

export default function ApplicationForm({ 
  onApplicationSubmit, 
  onNavigateToTracking,
  lang,
  isSiteAdmin = false
}: ApplicationFormProps) {
  const t = translations[lang];

  // Stepper state (1 to 4)
  const [step, setStep] = useState<number>(1);

  // Keep track of registration period updates for both streams
  const [regPeriodMaster80, setRegPeriodMaster80] = useState(() => getRegistrationPeriod("master_80"));
  const [regPeriodMaster20, setRegPeriodMaster20] = useState(() => getRegistrationPeriod("master_20"));
  const [regPeriodL3, setRegPeriodL3] = useState(() => getRegistrationPeriod("l3_specialty"));
  const [isOpenMaster80, setIsOpenMaster80] = useState(() => isRegistrationOpen("master_80"));
  const [isOpenMaster20, setIsOpenMaster20] = useState(() => isRegistrationOpen("master_20"));
  const [isOpenL3, setIsOpenL3] = useState(() => isRegistrationOpen("l3_specialty"));

  // Check if overall site registration is open (at least one path is running)
  const isAnyOpen = isOpenMaster80 || isOpenMaster20 || isOpenL3;

  // Listen for registration period updates dynamically
  React.useEffect(() => {
    const handleUpdate = () => {
      setRegPeriodMaster80(getRegistrationPeriod("master_80"));
      setRegPeriodMaster20(getRegistrationPeriod("master_20"));
      setRegPeriodL3(getRegistrationPeriod("l3_specialty"));
      setIsOpenMaster80(isRegistrationOpen("master_80"));
      setIsOpenMaster20(isRegistrationOpen("master_20"));
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

  // Field validation error states
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form states - Track selector (Master vs. L3 Specialty)
  const [applicationType, setApplicationType] = useState<"master" | "l3_specialty">("master");
  
  // States - Personal & Academic
  const [firstNameAr, setFirstNameAr] = useState("");
  const [lastNameAr, setLastNameAr] = useState("");
  const [firstNameEn, setFirstNameEn] = useState("");
  const [lastNameEn, setLastNameEn] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalStudentId, setNationalStudentId] = useState("");
  const [licenceSpecialty, setLicenceSpecialty] = useState(LICENCE_SPECIALTIES[0]?.id || "L-ENER");
  const [customLicenceSpecialty, setCustomLicenceSpecialty] = useState("");
  const [licenceGpa, setLicenceGpa] = useState<string>("");
  const [l1Gpa, setL1Gpa] = useState<string>("");
  const [l2Gpa, setL2Gpa] = useState<string>("");
  const [university, setUniversity] = useState(UNIVERSITIES[0].id);
  const [customUniversity, setCustomUniversity] = useState("");
  const [graduationYear, setGraduationYear] = useState<number | "other">(2026);
  const [customGraduationYear, setCustomGraduationYear] = useState("");

  // Determine which specific Master sub-category the candidate belongs to
  const isMaster80Percent = applicationType === "master" && university === "UNIV-LAGHOUAT" && graduationYear === 2026;
  
  const currentPeriod = applicationType === "l3_specialty"
    ? regPeriodL3
    : (isMaster80Percent ? regPeriodMaster80 : regPeriodMaster20);

  const isCurrentOpen = applicationType === "l3_specialty"
    ? isOpenL3
    : (isMaster80Percent ? isOpenMaster80 : isOpenMaster20);

  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);

  // Auto-calculate orientation GPA for L3 track from L1 and L2 average scores
  React.useEffect(() => {
    if (applicationType === "l3_specialty") {
      const g1 = parseFloat(l1Gpa);
      const g2 = parseFloat(l2Gpa);
      if (!isNaN(g1) && !isNaN(g2)) {
        setLicenceGpa(((g1 + g2) / 2).toFixed(2));
      } else if (!isNaN(g1)) {
        setLicenceGpa(g1.toFixed(2));
      } else if (!isNaN(g2)) {
        setLicenceGpa(g2.toFixed(2));
      } else {
        setLicenceGpa("");
      }
    }
  }, [l1Gpa, l2Gpa, applicationType]);

  const allowedPrograms = MASTER_PROGRAMS.filter(p => p.allowedLicenceSpecialties.includes(licenceSpecialty));
  const numAllowed = applicationType === "l3_specialty" ? 4 : allowedPrograms.length;
  const totalSteps = applicationType === "l3_specialty" || (applicationType === "master" && isMaster80Percent) ? 3 : 4;

  // Form states - Choices (Needs 4 distinct preferences)
  const [choice1, setChoice1] = useState<string>("");
  const [choice2, setChoice2] = useState<string>("");
  const [choice3, setChoice3] = useState<string>("");
  const [choice4, setChoice4] = useState<string>("");

  // Whenever applicationType changes, reset choices and specialty and reset step to 1
  React.useEffect(() => {
    setStep(1);
    setChoice1("");
    setChoice2("");
    setChoice3("");
    setChoice4("");
    if (applicationType === "l3_specialty") {
      setLicenceSpecialty("L2-ST");
      setUniversity("UNIV-LAGHOUAT");
      setGraduationYear(2026);
    } else {
      setLicenceSpecialty(LICENCE_SPECIALTIES[0]?.id || "L-ENER");
    }
  }, [applicationType]);

  // Whenever licenceSpecialty changes (if master track), reset choices to empty
  React.useEffect(() => {
    if (applicationType === "master") {
      setChoice1("");
      setChoice2("");
      setChoice3("");
      setChoice4("");
    }
  }, [licenceSpecialty]);

  // Form states - Documents Upload Simulations
  const [documents, setDocuments] = useState<DocumentUploads>({
    transcript: false,
    diploma: false,
    idCard: false,
    motivation: false,
  });

  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  // Form states - Declaration
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  // List of fields that are missing/incorrect in the current stage to display a beautiful custom alert
  const [validationAlertFields, setValidationAlertFields] = useState<string[] | null>(null);

  const getFieldLabel = (key: string): string => {
    if (lang === "ar") {
      switch (key) {
        case "firstNameAr": return "الاسم بالعربية";
        case "lastNameAr": return "اللقب بالعربية";
        case "firstNameEn": return "الاسم باللاتينية";
        case "lastNameEn": return "اللقب باللاتينية";
        case "email": return "البريد الإلكتروني";
        case "phone": return "رقم الهاتف";
        case "nationalStudentId": return "رقم التسجيل الوطني (BAC)";
        case "customLicenceSpecialty": return "تخصُّص الليسانس بالتفصيل";
        case "licenceGpa": return "معدل الليسانس الإجمالي";
        case "l1Gpa": return "كشف نقاط مستقل - السنة الأولى L1";
        case "l2Gpa": return "كشف نقاط مستقل - السنة الثانية L2";
        case "customUniversity": return "جامعة التخرج الأخرى";
        case "choice1": return "الرغبة الأولى";
        case "choice2": return "الرغبة الثانية";
        case "choice3": return "الرغبة الثالثة";
        case "choice4": return "الرغبة الرابعة";
        case "choicesCount": return "تحديد كافة الاختيارات المطلوبة";
        case "choicesUnique": return "عدم تكرار التخصصات في الرغبات";
        case "docTranscript": return "رفع ملف كشف النقاط الإجمالي";
        case "docDiploma": return "رفع وثيقة شهادة تخرج الليسانس";
        case "docId": return "رفع وثيقة بطاقة الهوية";
        case "declaration": return "الموافقة على التصريح الشرفي قبل تقديم الطلب";
        default: return key;
      }
    } else if (lang === "fr") {
      switch (key) {
        case "firstNameAr": return "Prénom en arabe";
        case "lastNameAr": return "Nom en arabe";
        case "firstNameEn": return "Prénom en latin";
        case "lastNameEn": return "Nom en latin";
        case "email": return "Adresse e-mail";
        case "phone": return "Numéro de téléphone";
        case "nationalStudentId": return "ID étudiant national (BAC)";
        case "customLicenceSpecialty": return "Spécialité de Licence personnalisée";
        case "licenceGpa": return "Moyenne générale de Licence";
        case "l1Gpa": return "Moyenne L1";
        case "l2Gpa": return "Moyenne L2";
        case "customUniversity": return "Autre université d'origine";
        case "choice1": return "1er vœu de spécialité";
        case "choice2": return "2ème vœu de spécialité";
        case "choice3": return "3ème vœu de spécialité";
        case "choice4": return "4ème vœu de spécialité";
        case "choicesCount": return "Nombre de vœux requis";
        case "choicesUnique": return "Pas de vœux en doublon";
        case "docTranscript": return "Fichier Relevé de Notes";
        case "docDiploma": return "Fichier Diplôme de Licence";
        case "docId": return "Fichier Carte d'Identité";
        case "declaration": return "Déclaration sur l'honneur obligatoire";
        default: return key;
      }
    } else {
      switch (key) {
        case "firstNameAr": return "First Name (Arabic)";
        case "lastNameAr": return "Last Name (Arabic)";
        case "firstNameEn": return "First Name (Latin)";
        case "lastNameEn": return "Last Name (Latin)";
        case "email": return "Email Address";
        case "phone": return "Phone Number";
        case "nationalStudentId": return "National Student ID (BAC)";
        case "customLicenceSpecialty": return "Custom Licence Specialty";
        case "licenceGpa": return "Licence Graduation GPA";
        case "l1Gpa": return "Year 1 GPA";
        case "l2Gpa": return "Year 2 GPA";
        case "customUniversity": return "Other University";
        case "choice1": return "First Choice";
        case "choice2": return "Second Choice";
        case "choice3": return "Third Choice";
        case "choice4": return "Fourth Choice";
        case "choicesCount": return "Total choices count requirement";
        case "choicesUnique": return "Choice uniqueness check";
        case "docTranscript": return "Transcript Document Upload";
        case "docDiploma": return "Diploma/Licence Certificate Upload";
        case "docId": return "Identity Card Upload";
        case "declaration": return "Honor Declaration Agreement";
        default: return key;
      }
    }
  };

  // Helpers to get all programs that are NOT selected in previous choices to prevent duplicate slots, filtered by compatibility
  const getAvailableOptions = (currentActiveValue: string, ...otherSelected: string[]) => {
    if (applicationType === "l3_specialty") {
      return L3_SPECIALTIES.filter(p => !otherSelected.includes(p.id) || p.id === currentActiveValue);
    }
    return MASTER_PROGRAMS.filter(p => {
      const isAllowed = p.allowedLicenceSpecialties.includes(licenceSpecialty);
      if (!isAllowed) return false;
      return !otherSelected.includes(p.id) || p.id === currentActiveValue;
    });
  };

  // Helper strings
  const getProgName = (p: typeof MASTER_PROGRAMS[0] | typeof L3_SPECIALTIES[0]) => {
    if (lang === "ar") return p.nameAr;
    if (lang === "en") return p.nameEn;
    return p.nameFr || p.nameEn;
  };

  const getSpecName = (s: typeof LICENCE_SPECIALTIES[0]) => {
    if (lang === "ar") return s.nameAr;
    if (lang === "en") return s.nameEn;
    return s.nameFr || s.nameEn;
  };

  const getUniLabel = (uni: typeof UNIVERSITIES[0]) => {
    if (lang === "ar") return uni.nameAr;
    if (lang === "en") return uni.nameEn;
    return uni.nameFr || uni.nameEn;
  };

  // Real files uploaded state
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { name: string; size: string }>>({});
  const [dragActive, setDragActive] = useState<Record<string, boolean>>({});

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileChange = (docKey: keyof DocumentUploads, file: File | null) => {
    if (!file) return;
    setUploadingDoc(docKey);
    setTimeout(() => {
      setUploadedFiles(prev => ({
        ...prev,
        [docKey]: { name: file.name, size: formatBytes(file.size) }
      }));
      setDocuments(prev => ({ ...prev, [docKey]: true }));
      setUploadingDoc(null);
    }, 400);
  };

  const handleRemoveDoc = (docKey: keyof DocumentUploads) => {
    setDocuments(prev => ({ ...prev, [docKey]: false }));
    setUploadedFiles(prev => {
      const u = { ...prev };
      delete u[docKey];
      return u;
    });
  };

  const handleDrag = (e: React.DragEvent, docKey: string, active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [docKey]: active }));
  };

  const handleDrop = (e: React.DragEvent, docKey: keyof DocumentUploads) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [docKey]: false }));
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(docKey, e.dataTransfer.files[0]);
    }
  };

  // Core Validation
  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!firstNameAr.trim()) {
        newErrors.firstNameAr = lang === "ar" ? "الرجاء إدخال الاسم بالعربية" : lang === "fr" ? "Veuillez saisir votre prénom en arabe" : "Please enter first name in Arabic";
      }
      if (!lastNameAr.trim()) {
        newErrors.lastNameAr = lang === "ar" ? "الرجاء إدخال اللقب بالعربية" : lang === "fr" ? "Veuillez saisir votre nom en arabe" : "Please enter last name in Arabic";
      }
      if (!firstNameEn.trim()) {
        newErrors.firstNameEn = lang === "ar" ? "الرجاء إدخال الاسم باللاتينية" : lang === "fr" ? "Veuillez saisir votre prénom en latin" : "Please enter first name in Latin";
      }
      if (!lastNameEn.trim()) {
        newErrors.lastNameEn = lang === "ar" ? "الرجاء إدخال اللقب باللاتينية" : lang === "fr" ? "Veuillez saisir votre nom en latin" : "Please enter last name in Latin";
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim() || !emailRegex.test(email)) {
        newErrors.email = lang === "ar" ? "الرجاء إدخال بريد إلكتروني صحيح وصالح" : lang === "fr" ? "Veuillez saisir une adresse électronique valide" : "Please enter a valid email address";
      }

      const phoneRegex = /^(05|06|07)[0-9]{8}$/;
      if (!phone.trim() || !phoneRegex.test(phone)) {
        newErrors.phone = lang === "ar" ? "الرجاء إدخال رقم هاتف جزائري صالح مكون من 10 أرقام (بدءاً بـ 05 أو 06 أو 07)" : lang === "fr" ? "Veuillez saisir un numéro de téléphone algérien valide (10 chiffres, commençant par 05, 06 ou 07)" : "Please enter a valid Algerian phone number (10 digits, starting with 05, 06 or 07)";
      }

      if (!nationalStudentId.trim() || nationalStudentId.length < 10 || isNaN(Number(nationalStudentId))) {
        newErrors.nationalStudentId = lang === "ar" ? "الرجاء إدخال رقم التسجيل الوطني للطالب (BAC) بشكل صحيح (أرقام فقط، لا يقل عن 10 خانات)" : lang === "fr" ? "Numéro d'inscription national d'étudiant invalide (BAC, chiffres uniquement, min. 10)" : "Invalid national student registration number (BAC, digits only, min 10 digits)";
      }

      if (applicationType === "master" && licenceSpecialty === "L-OTHER" && !customLicenceSpecialty.trim()) {
        newErrors.customLicenceSpecialty = lang === "ar" ? "الرجاء كتابة اسم تخصص الليسانس الخاص بك" : lang === "fr" ? "Veuillez écrire le nom de votre spécialité de licence" : "Please write down your license specialty";
      }

      if (applicationType === "l3_specialty") {
        const g1 = parseFloat(l1Gpa);
        if (isNaN(g1) || g1 < 0.00 || g1 > 20.00) {
          newErrors.l1Gpa = lang === "ar" ? "الرجاء إدخال معدل السنة الأولى بصفة صحيحة بين 00.00 و 20.00" : "Please enter a valid Year 1 GPA between 00.00 and 20.00";
        }
        const g2 = parseFloat(l2Gpa);
        if (isNaN(g2) || g2 < 0.00 || g2 > 20.00) {
          newErrors.l2Gpa = lang === "ar" ? "الرجاء إدخال معدل السنة الثانية بصفة صحيحة بين 00.00 و 20.00" : "Please enter a valid Year 2 GPA between 00.00 and 20.00";
        }
      } else {
        const gpaNum = parseFloat(licenceGpa);
        if (isNaN(gpaNum) || gpaNum < 0.00 || gpaNum > 20.00) {
          newErrors.licenceGpa = lang === "ar" 
            ? "الرجاء إدخال معدل تخرج الليسانس السنوي الصحيح (قيمة عشرية محصورة بين 00.00 و 20.00)"
            : "Please enter a valid academic GPA (between 00.00 and 20.00)";
        }
      }

      if (applicationType === "master" && university === "أخرى" && !customUniversity.trim()) {
        newErrors.customUniversity = lang === "ar" ? "الرجاء إدخال اسم الجامعة أو المركز الجامعي الذي تخرجت منه" : lang === "fr" ? "Veuillez spécifier l'université d'origine" : "Please enter your university of graduation";
      }
    }

    if (currentStep === 2) {
      const activeAllowed = applicationType === "l3_specialty" ? 4 : numAllowed;
      if (activeAllowed >= 1 && !choice1) newErrors.choice1 = lang === "ar" ? "الرجاء تحديد الرغبة الأولى" : "Please select your 1st choice";
      if (activeAllowed >= 2 && !choice2) newErrors.choice2 = lang === "ar" ? "الرجاء تحديد الرغبة الثانية" : "Please select your 2nd choice";
      if (activeAllowed >= 3 && !choice3) newErrors.choice3 = lang === "ar" ? "الرجاء تحديد الرغبة الثالثة" : "Please select your 3rd choice";
      if (activeAllowed >= 4 && !choice4) newErrors.choice4 = lang === "ar" ? "الرجاء تحديد الرغبة الرابعة" : "Please select your 4th choice";

      const expectedCount = Math.min(4, activeAllowed);
      const selections = [choice1, choice2, choice3, choice4].filter(Boolean);
      const uniqueSelections = new Set(selections);
      if (selections.length !== expectedCount) {
        newErrors.choicesCount = lang === "ar" 
          ? `يجب تحديد جميع الرغبات المطلوبة (العدد المطلوب: ${expectedCount})`
          : `You must specify all available preferences (Required: ${expectedCount})`;
      } else if (uniqueSelections.size !== expectedCount) {
        newErrors.choicesUnique = lang === "ar" 
          ? "يجب اختيار تخصصات غير مكررة ودون تكرار في الرغبات." 
          : "All choices must be distinct and non-duplicated.";
      }
    }

    if (currentStep === 3 && applicationType === "master" && !isMaster80Percent) {
      if (!documents.transcript) {
        newErrors.docTranscript = lang === "ar" 
          ? "يجب رفع كشف نقاط الليسانس الإجمالي كشرط أساسي" 
          : "The transcript is mandatory";
      }
      if (!documents.diploma) {
        newErrors.docDiploma = lang === "ar" ? "يجب رفع نسخة من شهادة التخرج وشهادة ليسانس" : lang === "fr" ? "L'attestation de succès ou diplôme de licence est obligatoire" : "The license degree or graduation certificate is mandatory";
      }
      if (!documents.idCard) {
        newErrors.docId = lang === "ar" ? "يجب رفع بطاقة التعريف الوطنية لتأكيد الهوية" : lang === "fr" ? "Le document d'identité national est obligatoire" : "The national identification document is mandatory";
      }
    }

    setErrors(newErrors);
    
    const hasErrors = Object.keys(newErrors).length > 0;
    if (hasErrors) {
      setValidationAlertFields(Object.keys(newErrors));
    } else {
      setValidationAlertFields(null);
    }

    return !hasErrors;
  };

  // Submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!declarationAccepted) {
      setErrors(prev => ({ 
        ...prev, 
        declaration: lang === "ar" ? "يجب تأكيد وقبول التصريح الشرفي قبل تقديم الملف البيداغوجي" : lang === "fr" ? "Vous devez accepter la déclaration d'honneur avant de soumettre." : "You must accept the honor declaration before submission." 
      }));
      setValidationAlertFields(["declaration"]);
      return;
    }

    // Generate Algerian style Candidate ID (e.g. M2026-XXXX or L2026-XXXX)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedId = applicationType === "l3_specialty" ? `L2026-${randomSuffix}` : `M2026-${randomSuffix}`;

    const resolvedUniversityName = applicationType === "l3_specialty"
      ? (UNIVERSITIES.find(u => u.id === "UNIV-LAGHOUAT")?.nameAr || "جامعة عمار ثليجي - الأغواط")
      : (university === "أخرى" 
        ? customUniversity.trim() 
        : (UNIVERSITIES.find(u => u.id === university)?.nameAr || university));

    const resolvedGraduationYear = applicationType === "l3_specialty" 
      ? 2026 
      : (graduationYear === "other"
        ? (parseInt(customGraduationYear) || 2026)
        : graduationYear);

    const newApplication: CandidateApplication = {
      id: generatedId,
      applicationType,
      firstNameAr: firstNameAr.trim(),
      lastNameAr: lastNameAr.trim(),
      firstNameEn: firstNameEn.trim(),
      lastNameEn: lastNameEn.trim(),
      email: email.trim(),
      phone: phone.trim(),
      nationalStudentId: nationalStudentId.trim(),
      licenceSpecialty: applicationType === "l3_specialty" ? "L2-ST" : licenceSpecialty,
      customLicenceSpecialty: (applicationType === "master" && licenceSpecialty === "L-OTHER") ? customLicenceSpecialty.trim() : undefined,
      licenceGpa: parseFloat(licenceGpa),
      l1Gpa: applicationType === "l3_specialty" ? parseFloat(l1Gpa) : undefined,
      l2Gpa: applicationType === "l3_specialty" ? parseFloat(l2Gpa) : undefined,
      university: resolvedUniversityName,
      graduationYear: resolvedGraduationYear,
      choices: [choice1, choice2, choice3, choice4],
      status: ApplicationStatus.PENDING,
      createdAt: new Date().toISOString(),
      documents: (applicationType === "l3_specialty" || isMaster80Percent)
        ? { transcript: true, diploma: true, idCard: true, motivation: false }
        : documents,
      uploadedFileNames: (applicationType === "l3_specialty" || isMaster80Percent) ? {} : Object.fromEntries(
        Object.entries(uploadedFiles).map(([k, v]) => [k, (v as { name: string }).name])
      )
    };

    onApplicationSubmit(newApplication);
  };

  // Evaluate candidate's program selection compatibility
  const getProductCompatibility = (programId: string) => {
    const program = MASTER_PROGRAMS.find(p => p.id === programId);
    if (!program) return null;

    const details = getCompatibilityDetails(programId, licenceSpecialty);
    const isMatch = details.coeff > 0;
    const meetsSuggestedGpa = parseFloat(licenceGpa) >= program.minRecommendedGpa;

    let textStr = "";
    if (lang === "ar") {
      textStr = `معامل التوافق بيداغوجياً: ${details.coeff.toFixed(2)} (${details.labelAr}) - الرتبة ${details.rank}`;
      if (details.coeff === 0) {
        textStr = "تخصص متباعد؛ سيتم دراسته استثنائياً من اللجنة العلمية البيداغوجية.";
      }
    } else if (lang === "fr") {
      textStr = `Coefficient : ${details.coeff.toFixed(2)} (${details.labelFr}) - Rang ${details.rank}`;
      if (details.coeff === 0) {
        textStr = "Majeure d'origine non-standard; sujet à l'avis souverain du comité scientifique.";
      }
    } else {
      textStr = `Compatibility Coeff: ${details.coeff.toFixed(2)} (${details.labelEn}) - Rank ${details.rank}`;
      if (details.coeff === 0) {
        textStr = "Non-standard origin major; subject of supreme committee evaluation.";
      }
    }

    return {
      isMatch,
      meetsSuggestedGpa,
      coeff: details.coeff,
      rank: details.rank,
      text: textStr
    };
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 150, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
    window.scrollTo({ top: 150, behavior: "smooth" });
  };

  if (!isAnyOpen && !isSiteAdmin) {
    return (
      <div className="bg-slate-50 py-10 px-4 min-fluid" id="apply-closed-container">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border-2 border-slate-200/90 shadow-xl overflow-hidden text-center p-8 sm:p-12 space-y-8">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 border-2 border-rose-200 animate-pulse">
            <Clock className="w-10 h-10" />
          </div>
          
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-[#11235a] tracking-tight">
              {lang === "ar" ? "🔑 أبواب الترشيحات والتسجيلات مغلقة" : lang === "fr" ? "🔑 Les inscriptions sont closes" : "🔑 Candidate Registrations Closed"}
            </h2>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed text-center">
              {lang === "ar" 
                ? "انتهت الفترات الزمنية الرسمية للترشح بالتوجيه للسنة الثالثة ليسانس والماستر لهذا الموسم الدراسي، أو لم يتم تفعيلها بعد من قبل إدارة القسم."
                : lang === "fr"
                ? "Les inscriptions et l'orientation pour les étudiants Master et L3 sont closes pour cette saison."
                : "Candidate registration for Master's admissions and L3 orientation has either ended or is currently disabled."}
            </p>
          </div>

          {/* Display Dates for all cycles - Spectacular large representations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            
            {/* Master 80% Box */}
            <div className={`p-6 rounded-2xl border-2 transition-all duration-300 text-center flex flex-col justify-between space-y-4 ${
              isOpenMaster80 
                ? "bg-emerald-50/70 border-emerald-500 ring-4 ring-emerald-500/10 scale-[1.02] shadow-md" 
                : "bg-[#fafafa] border-slate-200 text-slate-500"
            }`}>
              <div className="space-y-2">
                <span className={`text-[12px] sm:text-xs font-black uppercase tracking-wider block px-3 py-1.5 rounded-lg text-center leading-tight ${
                  isOpenMaster80 ? "bg-emerald-100 text-[#0f7652] font-black" : "bg-slate-100 text-slate-700"
                }`}>
                  🎓 {lang === "ar" ? "ماستر %80 (الأغواط):" : "Master 80% (Laghouat):"}
                </span>
                <p className="text-[10px] text-slate-400 font-bold">
                  {lang === "ar" ? "خريجو جامعة الأغواط الجدد" : "Amar Thelidji Graduates"}
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="text-[9px] uppercase font-black text-slate-400 tracking-wider">
                  {lang === "ar" ? "الفترة الزمنية المحددة:" : "Schedule Timeframe:"}
                </div>
                <div className="flex justify-center items-center gap-1.5 text-xs sm:text-sm font-mono font-black text-slate-900 bg-white border border-slate-200 p-2 rounded-xl shadow-3xs">
                  <span className={isOpenMaster80 ? "text-emerald-700 font-extrabold" : "text-slate-800"}>{regPeriodMaster80.startDate}</span>
                  <span className="text-slate-300 font-normal font-sans">&rarr;</span>
                  <span className={isOpenMaster80 ? "text-emerald-700 font-extrabold" : "text-slate-800"}>{regPeriodMaster80.endDate}</span>
                </div>
              </div>
              
              <div className="pt-2 flex justify-center">
                {isOpenMaster80 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-[#e6fbf4] text-[#117a5a] border border-[#a2ecd5] shadow-xs animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    {lang === "ar" ? "مفتوح الآن" : "OPEN NOW"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-slate-200/50 text-slate-500 border border-slate-300/80">
                    {lang === "ar" ? "مغلق" : "CLOSED"}
                  </span>
                )}
              </div>
            </div>

            {/* Master 20% Box */}
            <div className={`p-6 rounded-2xl border-2 transition-all duration-300 text-center flex flex-col justify-between space-y-4 ${
              isOpenMaster20 
                ? "bg-emerald-50/70 border-emerald-500 ring-4 ring-emerald-500/10 scale-[1.02] shadow-md" 
                : "bg-[#fafafa] border-slate-200 text-slate-500"
            }`}>
              <div className="space-y-2">
                <span className={`text-[12px] sm:text-xs font-black uppercase tracking-wider block px-3 py-1.5 rounded-lg text-center leading-tight ${
                  isOpenMaster20 ? "bg-emerald-100 text-[#0f7652] font-black" : "bg-slate-100 text-slate-700"
                }`}>
                  🎓 {lang === "ar" ? "ماستر %20 (آخرون):" : "Master 20% (Others):"}
                </span>
                <p className="text-[10px] text-slate-400 font-bold">
                  {lang === "ar" ? "السنوات السابقة والجامعات الخارجية" : "External & classic graduates"}
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="text-[9px] uppercase font-black text-slate-400 tracking-wider">
                  {lang === "ar" ? "الفترة الزمنية المحددة:" : "Schedule Timeframe:"}
                </div>
                <div className="flex justify-center items-center gap-1.5 text-xs sm:text-sm font-mono font-black text-slate-900 bg-white border border-slate-200 p-2 rounded-xl shadow-3xs">
                  <span className={isOpenMaster20 ? "text-emerald-700 font-extrabold" : "text-slate-800"}>{regPeriodMaster20.startDate}</span>
                  <span className="text-slate-300 font-normal font-sans">&rarr;</span>
                  <span className={isOpenMaster20 ? "text-emerald-700 font-extrabold" : "text-slate-800"}>{regPeriodMaster20.endDate}</span>
                </div>
              </div>
              
              <div className="pt-2 flex justify-center">
                {isOpenMaster20 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-[#e6fbf4] text-[#117a5a] border border-[#a2ecd5] shadow-xs animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    {lang === "ar" ? "مفتوح الآن" : "OPEN NOW"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-slate-200/50 text-slate-500 border border-slate-300/80">
                    {lang === "ar" ? "مغلق" : "CLOSED"}
                  </span>
                )}
              </div>
            </div>

            {/* L3 Box */}
            <div className={`p-6 rounded-2xl border-2 transition-all duration-300 text-center flex flex-col justify-between space-y-4 ${
              isOpenL3 
                ? "bg-emerald-50/70 border-emerald-500 ring-4 ring-emerald-500/10 scale-[1.02] shadow-md" 
                : "bg-[#fafafa] border-slate-200 text-slate-500"
            }`}>
              <div className="space-y-2">
                <span className={`text-[12px] sm:text-xs font-black uppercase tracking-wider block px-3 py-1.5 rounded-lg text-center leading-tight ${
                  isOpenL3 ? "bg-emerald-100 text-[#0f7652] font-black" : "bg-slate-100 text-slate-700"
                }`}>
                  🏫 {lang === "ar" ? "سنة ثالثة ليسانس L3:" : "L3 Specialty Placement:"}
                </span>
                <p className="text-[10px] text-slate-400 font-bold">
                  {lang === "ar" ? "توجيه واختيار رغبات طلبة ليسانس" : "Year 2 to Year 3 Placement"}
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="text-[9px] uppercase font-black text-slate-400 tracking-wider">
                  {lang === "ar" ? "الفترة الزمنية المحددة:" : "Schedule Timeframe:"}
                </div>
                <div className="flex justify-center items-center gap-1.5 text-xs sm:text-sm font-mono font-black text-slate-900 bg-white border border-slate-200 p-2 rounded-xl shadow-3xs">
                  <span className={isOpenL3 ? "text-emerald-700 font-extrabold" : "text-slate-800"}>{regPeriodL3.startDate}</span>
                  <span className="text-slate-300 font-normal font-sans">&rarr;</span>
                  <span className={isOpenL3 ? "text-emerald-700 font-extrabold" : "text-slate-800"}>{regPeriodL3.endDate}</span>
                </div>
              </div>
              
              <div className="pt-2 flex justify-center">
                {isOpenL3 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-[#e6fbf4] text-[#117a5a] border border-[#a2ecd5] shadow-xs animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    {lang === "ar" ? "مفتوح الآن" : "OPEN NOW"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-slate-200/50 text-slate-500 border border-slate-300/80">
                    {lang === "ar" ? "مغلق" : "CLOSED"}
                  </span>
                )}
              </div>
            </div>

          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={() => onNavigateToTracking()}
              className="px-6 py-3 bg-[#12255c] hover:bg-[#1a388f] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md hover:shadow-lg inline-flex items-center gap-2 justify-center transform hover:scale-[1.01]"
              id="closed-btn-track"
            >
              <Search className="w-4.5 h-4.5" />
              <span>{lang === "ar" ? "متابعة حالة طلبك الجاري 🔍" : "Track existing application"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-10 px-4 min-fluid" id="apply-form-container">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200/85 shadow-lg overflow-hidden">
        
        {/* Step Indicator Header Banner */}
        <div className="bg-official-blue px-6 py-6 text-white border-b-4 border-official-emerald font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">{t.stepIndicatorHeader}</h2>
              <p className="text-xs text-slate-200/80 mt-1 font-medium">{t.stepIndicatorSub}</p>
              
              {/* Display open period banner */}
              <div className="mt-2.5 inline-flex items-center gap-1.5 bg-emerald-900/40 border border-emerald-500/35 px-3 py-1 rounded-lg text-[10px] sm:text-xs text-start">
                <Clock className="w-3.5 h-3.5 text-official-emerald shrink-0" />
                <span className="font-bold text-emerald-100">
                  {lang === "ar" ? "فترة التسجيلات الجارية:" : "Open registration window:"}
                </span>
                <span className="font-mono text-white font-bold tracking-tight bg-black/15 px-1.5 py-0.5 rounded leading-none">
                  {currentPeriod.startDate}
                </span>
                <span className="text-emerald-400 font-extrabold">←</span>
                <span className="font-mono text-white font-bold tracking-tight bg-black/15 px-1.5 py-0.5 rounded leading-none">
                  {currentPeriod.endDate}
                </span>
              </div>
            </div>
            <div className="text-xs font-mono font-bold bg-[#12255c] px-3 py-1.5 rounded-full border border-white/15 text-official-emerald self-start sm:self-auto">
              {lang === "ar" ? "المرحلة" : lang === "fr" ? "Étape" : "Step"} <span className="text-white text-sm">{step}</span> {lang === "ar" ? "من" : lang === "fr" ? "sur" : "of"} {totalSteps}
            </div>
          </div>

          {/* Graphical Stepper */}
          <div className={`mt-6 grid gap-2 relative animate-fade-in ${applicationType === "l3_specialty" ? "grid-cols-3" : "grid-cols-4"}`}>
            <div className={`absolute top-[18px] h-[2px] bg-[#1d3da1] z-0 ${lang === "ar" ? "left-[12%] right-[12%]" : "left-[12%] right-[12%]"}`}></div>
            
            {/* Step 1 badge */}
            <div 
              onClick={() => isSiteAdmin && setStep(1)}
              className={`flex flex-col items-center relative z-10 transition-all duration-200 ${isSiteAdmin ? "cursor-pointer group hover:opacity-90 select-none" : ""}`}
              title={isSiteAdmin ? (lang === "ar" ? "إلى المرحلة الأولى" : "Jump to Step 1") : ""}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 text-sm font-bold transition-all duration-300 ${
                step >= 1 ? "bg-official-emerald border-official-emerald text-white" : "bg-[#132c6e] border-white/10 text-slate-300"
              } ${isSiteAdmin ? "group-hover:ring-4 group-hover:ring-emerald-400 group-hover:scale-105" : ""}`}>
                {step > 1 ? <Check className="w-4 h-4 text-white stroke-[3]" /> : "1"}
              </div>
              <span className={`text-[10px] sm:text-xs mt-2 text-center font-bold transition-colors ${step >= 1 ? "text-white" : "text-white/40"} ${isSiteAdmin ? "group-hover:text-emerald-300" : ""}`}>
                {lang === "ar" ? "المعلومات الشخصية" : lang === "fr" ? "Identité & Note" : "Personal Data"}
              </span>
            </div>

            {/* Step 2 badge */}
            <div 
              onClick={() => isSiteAdmin && setStep(2)}
              className={`flex flex-col items-center relative z-10 transition-all duration-200 ${isSiteAdmin ? "cursor-pointer group hover:opacity-90 select-none" : ""}`}
              title={isSiteAdmin ? (lang === "ar" ? "إلى المرحلة الثانية" : "Jump to Step 2") : ""}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 text-sm font-bold transition-all duration-300 ${
                step >= 2 ? "bg-official-emerald border-official-emerald text-white" : "bg-[#132c6e] border-white/10 text-slate-300"
              } ${isSiteAdmin ? "group-hover:ring-4 group-hover:ring-emerald-400 group-hover:scale-105" : ""}`}>
                {step > 2 ? <Check className="w-4 h-4 text-white stroke-[3]" /> : "2"}
              </div>
              <span className={`text-[10px] sm:text-xs mt-2 text-center font-bold transition-colors ${step >= 2 ? "text-white" : "text-white/40"} ${isSiteAdmin ? "group-hover:text-emerald-300" : ""}`}>
                {lang === "ar" ? (applicationType === "l3_specialty" ? "ترتيب رغبات التوجيه" : "ترتيب الرغبات الماستر") : lang === "fr" ? "Vœux & Choix" : "Choices"}
              </span>
            </div>

            {/* Step 3 badge: Upload Assets (Master only) */}
            {applicationType === "master" && !isMaster80Percent && (
              <div 
                onClick={() => isSiteAdmin && setStep(3)}
                className={`flex flex-col items-center relative z-10 transition-all duration-200 ${isSiteAdmin ? "cursor-pointer group hover:opacity-90 select-none" : ""}`}
                title={isSiteAdmin ? (lang === "ar" ? "إلى المرحلة الثالثة" : "Jump to Step 3") : ""}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 text-sm font-bold transition-all duration-300 ${
                  step >= 3 ? "bg-official-emerald border-official-emerald text-white" : "bg-[#132c6e] border-white/10 text-slate-300"
                } ${isSiteAdmin ? "group-hover:ring-4 group-hover:ring-emerald-400 group-hover:scale-105" : ""}`}>
                  {step > 3 ? <Check className="w-4 h-4 text-white stroke-[3]" /> : "3"}
                </div>
                <span className={`text-[10px] sm:text-xs mt-2 text-center font-bold transition-colors ${step >= 3 ? "text-white" : "text-white/40"} ${isSiteAdmin ? "group-hover:text-emerald-300" : ""}`}>
                  {lang === "ar" ? "رفع المرفقات" : lang === "fr" ? "Pièces Jointes" : "Upload Assets"}
                </span>
              </div>
            )}

            {/* Step 4 (or Step 3) badge: Review & Submit */}
            <div 
              onClick={() => isSiteAdmin && setStep(totalSteps)}
              className={`flex flex-col items-center relative z-10 transition-all duration-200 ${isSiteAdmin ? "cursor-pointer group hover:opacity-90 select-none" : ""}`}
              title={isSiteAdmin ? (lang === "ar" ? `إلى المرحلة الأخيرة` : `Jump to final step`) : ""}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 text-sm font-bold transition-all duration-300 ${
                step >= totalSteps ? "bg-official-emerald border-official-emerald text-white" : "bg-[#132c6e] border-white/10 text-slate-300"
              } ${isSiteAdmin ? "group-hover:ring-4 group-hover:ring-emerald-400 group-hover:scale-105" : ""}`}>
                {step > totalSteps ? <Check className="w-4 h-4 text-white stroke-[3]" /> : totalSteps.toString()}
              </div>
              <span className={`text-[10px] sm:text-xs mt-2 text-center font-bold transition-colors ${step >= totalSteps ? "text-white" : "text-white/40"} ${isSiteAdmin ? "group-hover:text-emerald-300" : ""}`}>
                {lang === "ar" ? "تأكيد وتسليم الملف" : lang === "fr" ? "Validation Finale" : "Review & Submit"}
              </span>
            </div>
          </div>

          {isSiteAdmin && (
            <div className="mt-5 mx-2 text-center py-2 px-4 rounded-xl bg-emerald-950/45 border border-emerald-500/25 text-[11px] font-bold text-emerald-200 shadow-inner flex items-center justify-center gap-1.5 animate-pulse">
              <span>⚙️ {lang === "ar" ? "وضع مسؤول الموقع نشط: يمكنك الآن الضغط على أي مرحلة أعلاه للتنقل المباشر وتجاوز التحقق." : lang === "fr" ? "Mode Administrateur actif : Cliquez sur n'importe quelle étape pour naviguer librement." : "Site Administrator Active: Click on any step indicator above to navigate directly."}</span>
            </div>
          )}
        </div>

        {/* Warning general box if any input errors occur */}
        {Object.keys(errors).length > 0 && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border-r-4 border-red-500 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-800">
                {lang === "ar" ? "تنبيه: تعذر الانتقال بسبب أخطاء في الاستمارة" : lang === "fr" ? "Alerte : Saisie incorrecte ou incomplète détectée" : "Alert: Invalid or incomplete form values detected"}
              </p>
              <ul className="text-xs text-red-700 mt-1.5 list-disc list-inside space-y-1 text-right">
                {Object.values(errors).map((err, idx) => (
                  <li key={idx} className="font-medium">{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 sm:p-8" id="candidacy-main-form">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
            >
          
              {/* ================= STEP 1: PERSONAL & ACADEMIC INFO ================= */}
              {step === 1 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-official-emerald" />
                <h3 className="text-lg font-bold text-slate-800">
                  {lang === "ar" ? "بيانات الطالب الشخصية والأكاديمية الأساسية" : lang === "fr" ? "Informations Personnelles & Parcours Universitaire" : "Primary Academic & Personal Credentials"}
                </h3>
              </div>

              {/* Grand Timelines Bento Card Display - Large and extremely clear */}
              <div className="bg-[#f8fafc] border-2 border-slate-200 p-5 sm:p-6 rounded-2xl space-y-4 shadow-sm" id="step1-timelines-bento">
                <div className="flex items-center justify-between gap-2 text-start flex-wrap">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-official-blue shrink-0 animate-bounce" style={{ animationDuration: "2.5s" }} />
                    <span className="text-xs sm:text-sm font-black text-[#11235a] uppercase tracking-wide">
                      {lang === "ar" ? "📅 فترات التسجيل الرسمية وبوابات الترشيح الجارية:" : "📅 Official Registration Timelines & Gates:"}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-official-blue/10 text-official-blue">
                    {lang === "ar" ? "تحديث تلقائي حي" : "Live State Engine"}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Card 1: Master 80 */}
                  <div className={`p-5 rounded-2xl border-2 transition-all duration-300 relative shadow-sm overflow-hidden flex flex-col justify-between ${
                    isOpenMaster80 
                      ? "bg-emerald-50/65 border-emerald-500 ring-4 ring-emerald-500/10 scale-[1.01]" 
                      : "bg-slate-50 border-slate-200/90 hover:border-slate-300"
                  }`}>
                    {isOpenMaster80 && (
                      <div className="absolute top-0 right-0 bg-emerald-600 text-[9px] text-white font-black px-2.5 py-0.5 rounded-bl-xl uppercase tracking-widest animate-pulse">
                        {lang === "ar" ? "مفتوح جاري" : "OPEN"}
                      </div>
                    )}
                    <div className="space-y-3 text-start">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🎓</span>
                        <span className={`text-[12px] sm:text-[13px] font-black tracking-tight leading-snug ${isOpenMaster80 ? "text-[#0e5c40]" : "text-slate-800"}`}>
                          {lang === "ar" ? "ماستر %80 (الأغواط):" : "Master 80% (Laghouat):"}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 font-bold leading-relaxed">
                        {lang === "ar" ? "مخصص لطلبة جامعة الأغواط المتخرجين حديثاً في الموسم الجاري" : "Dedicated to current-year graduates from Amar Thelidji University"}
                      </p>
                      
                      <div className="pt-2 text-center">
                        <div className="text-[10px] text-slate-400 font-extrabold uppercase mb-1">
                          {lang === "ar" ? "الفترة المحددة لاستلام الطلبات:" : "Application window period:"}
                        </div>
                        <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-black text-slate-900 bg-white border border-slate-200 py-1.5 px-2 rounded-xl shadow-3xs">
                          <span className={`${isOpenMaster80 ? "text-emerald-700 font-extrabold" : "text-slate-700"}`}>{regPeriodMaster80.startDate}</span>
                          <span className="text-slate-300 font-normal font-sans">&rarr;</span>
                          <span className={`${isOpenMaster80 ? "text-emerald-700 font-extrabold" : "text-slate-700"}`}>{regPeriodMaster80.endDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-center">
                      {isOpenMaster80 ? (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-black bg-[#e6fbf4] text-[#117a5a] border border-[#a2ecd5] shadow-sm tracking-wider">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          {lang === "ar" ? "مفتوح الآن لاستقبال الملفات" : "ACTIVE & ACCEPTING APPS"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-slate-200/60 text-slate-500 border border-slate-300">
                          {lang === "ar" ? "مغلق بانتظار التجديد" : "CLOSED FOR SUBMISSIONS"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card 2: Master 20 */}
                  <div className={`p-5 rounded-2xl border-2 transition-all duration-300 relative shadow-sm overflow-hidden flex flex-col justify-between ${
                    isOpenMaster20 
                      ? "bg-emerald-50/65 border-emerald-500 ring-4 ring-emerald-500/10 scale-[1.01]" 
                      : "bg-slate-50 border-slate-200/90 hover:border-slate-300"
                  }`}>
                    {isOpenMaster20 && (
                      <div className="absolute top-0 right-0 bg-emerald-600 text-[9px] text-white font-black px-2.5 py-0.5 rounded-bl-xl uppercase tracking-widest animate-pulse">
                        {lang === "ar" ? "مفتوح جاري" : "OPEN"}
                      </div>
                    )}
                    <div className="space-y-3 text-start">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🎓</span>
                        <span className={`text-[12px] sm:text-[13px] font-black tracking-tight leading-snug ${isOpenMaster20 ? "text-[#0e5c40]" : "text-slate-800"}`}>
                          {lang === "ar" ? "ماستر %20 (آخرون وجامعات أخرى):" : "Master 20% (Others):"}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 font-bold leading-relaxed">
                        {lang === "ar" ? "خريجي السنوات السابقة والكلاسيك وحملة الشهادات من جامعات أخرى" : "Graduates of previous academic years, classic cycle, and other universities"}
                      </p>
                      
                      <div className="pt-2 text-center">
                        <div className="text-[10px] text-slate-400 font-extrabold uppercase mb-1">
                          {lang === "ar" ? "الفترة المحددة لاستلام الطلبات:" : "Application window period:"}
                        </div>
                        <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-black text-slate-900 bg-white border border-slate-200 py-1.5 px-2 rounded-xl shadow-3xs">
                          <span className={`${isOpenMaster20 ? "text-emerald-700 font-extrabold" : "text-slate-700"}`}>{regPeriodMaster20.startDate}</span>
                          <span className="text-slate-300 font-normal font-sans">&rarr;</span>
                          <span className={`${isOpenMaster20 ? "text-emerald-700 font-extrabold" : "text-slate-700"}`}>{regPeriodMaster20.endDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-center">
                      {isOpenMaster20 ? (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-black bg-[#e6fbf4] text-[#117a5a] border border-[#a2ecd5] shadow-sm tracking-wider">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          {lang === "ar" ? "مفتوح الآن لاستقبال الملفات" : "ACTIVE & ACCEPTING APPS"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-slate-200/60 text-slate-500 border border-slate-300">
                          {lang === "ar" ? "مغلق بانتظار التجديد" : "CLOSED FOR SUBMISSIONS"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card 3: L3 Specs */}
                  <div className={`p-5 rounded-2xl border-2 transition-all duration-300 relative shadow-sm overflow-hidden flex flex-col justify-between ${
                    isOpenL3 
                      ? "bg-emerald-50/65 border-emerald-500 ring-4 ring-emerald-500/10 scale-[1.01]" 
                      : "bg-slate-50 border-slate-200/90 hover:border-slate-300"
                  }`}>
                    {isOpenL3 && (
                      <div className="absolute top-0 right-0 bg-emerald-600 text-[9px] text-white font-black px-2.5 py-0.5 rounded-bl-xl uppercase tracking-widest animate-pulse">
                        {lang === "ar" ? "مفتوح جاري" : "OPEN"}
                      </div>
                    )}
                    <div className="space-y-3 text-start">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🏫</span>
                        <span className={`text-[12px] sm:text-[13px] font-black tracking-tight leading-snug ${isOpenL3 ? "text-[#0e5c40]" : "text-slate-800"}`}>
                          {lang === "ar" ? "سنة ثالثة ليسانس L3 (التوجيه):" : "L3 Specialty Placement:"}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 font-bold leading-relaxed">
                        {lang === "ar" ? "توجيه وترتيب الرغبات لطلبة ليسانس في القسم للانتقال للسنة الـ3" : "Specialty routing and seat allocation from Year 2 to Year 3"}
                      </p>
                      
                      <div className="pt-2 text-center">
                        <div className="text-[10px] text-slate-400 font-extrabold uppercase mb-1">
                          {lang === "ar" ? "الفترة المحددة لتسجيل الرغبات:" : "Preference entry period:"}
                        </div>
                        <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-black text-slate-900 bg-white border border-slate-200 py-1.5 px-2 rounded-xl shadow-3xs">
                          <span className={`${isOpenL3 ? "text-emerald-700 font-extrabold" : "text-slate-700"}`}>{regPeriodL3.startDate}</span>
                          <span className="text-slate-300 font-normal font-sans">&rarr;</span>
                          <span className={`${isOpenL3 ? "text-emerald-700 font-extrabold" : "text-slate-700"}`}>{regPeriodL3.endDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-center">
                      {isOpenL3 ? (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-black bg-[#e6fbf4] text-[#117a5a] border border-[#a2ecd5] shadow-sm tracking-wider">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          {lang === "ar" ? "مفتوح الآن لتسجيل الرغبات" : "ACTIVE & SUBMITTING CHOICES"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-slate-200/60 text-slate-500 border border-slate-300">
                          {lang === "ar" ? "مغلق بانتظار التجديد" : "CLOSED FOR SUBMISSIONS"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pathway Track Selector */}
              <div className="bg-slate-100/80 p-1.5 rounded-xl border border-slate-200 grid grid-cols-2 gap-2" id="pathway-selector">
                <button
                  type="button"
                  onClick={() => setApplicationType("master")}
                  className={`py-3 px-4 rounded-lg font-bold text-sm transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                    applicationType === "master"
                      ? "bg-official-blue text-white shadow-md scale-[1.02]"
                      : "bg-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-200/50"
                  }`}
                >
                  <span className="text-base">🎓 {lang === "ar" ? "الطور الثاني (ماستر)" : lang === "fr" ? "2nd Cycle (Master)" : "Master's (2nd Cycle)"}</span>
                  <span className={`text-[10px] font-normal ${applicationType === "master" ? "text-emerald-200" : "text-slate-400"}`}>
                    {lang === "ar" ? "لحاملي شهادة الليسانس" : "For Licence Graduates"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setApplicationType("l3_specialty")}
                  className={`py-3 px-4 rounded-lg font-bold text-sm transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                    applicationType === "l3_specialty"
                      ? "bg-official-blue text-white shadow-md scale-[1.02]"
                      : "bg-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-200/50"
                  }`}
                >
                  <span className="text-base">🏫 {lang === "ar" ? "الطور الأول (توجيه L3)" : lang === "fr" ? "1er Cycle (Orientation L3)" : "L3 Specialty Placement"}</span>
                  <span className={`text-[10px] font-normal ${applicationType === "l3_specialty" ? "text-emerald-200" : "text-slate-400"}`}>
                    {lang === "ar" ? "من السنة الثانية إلى السنة الثالثة" : "From 2nd Year into 3rd Year"}
                  </span>
                </button>
              </div>

              {/* Specialty selection conditions button */}
              {applicationType && (
                <div className="flex justify-center" id="specialty-criteria-btn-wrapper">
                  <button
                    type="button"
                    onClick={() => setShowRulesModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-50 to-blue-50 text-official-blue hover:from-indigo-100 hover:to-blue-100 border border-blue-200 rounded-xl font-extrabold text-xs shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer animate-pulse"
                    style={{ animationDuration: '3s' }}
                    id="btn-show-specialty-rules"
                  >
                    <BookOpen className="w-4 h-4 text-official-blue animate-bounce" style={{ animationDuration: '2s' }} />
                    <span>
                      {lang === "ar" 
                        ? `ℹ️ شروط ومعايير اختيار تخصصات ${applicationType === "master" ? "الماستر" : "الليسانس L3"}` 
                        : lang === "fr"
                        ? `ℹ️ Conditions du choix de spécialité (${applicationType === "master" ? "Master" : "Licence L3"})`
                        : `ℹ️ Specialty Choice Conditions (${applicationType === "master" ? "Master's" : "L3 Specialty"})`}
                    </span>
                  </button>
                </div>
              )}

              {!isCurrentOpen && !isSiteAdmin ? (
                <div className="bg-rose-50 border border-rose-200/85 p-6 rounded-2xl text-center space-y-4 shadow-sm" id="stream-closed-alert">
                  <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-500 border border-rose-200">
                    <Clock className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-2 max-w-sm mx-auto">
                    <h4 className="font-extrabold text-[#ca4a24] text-xs sm:text-sm">
                      {lang === "ar" 
                        ? (applicationType === "master"
                            ? (isMaster80Percent 
                                ? "🔒 فترة تسجيلات الماستر فئة 80% (خريجي الأغواط) مغلقة حالياً" 
                                : "🔒 فترة تسجيلات الماستر فئة 20% (الكلاسيك والسنوات السابقة) مغلقة حالياً")
                            : "🔒 فترة توجيه السنة الثالثة ليسانس (L3) مغلقة حالياً")
                        : (applicationType === "master"
                            ? (isMaster80Percent
                                ? "🔒 Registrations for Master 80% (Laghouat Grads) are currently closed"
                                : "🔒 Registrations for Master 20% (Prev Years / External) are currently closed")
                            : "🔒 L3 Specialty Placement registration is currently closed")}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed text-center">
                      {lang === "ar"
                        ? `لقد انتهت الفترة المحددة للتوجيه والترشح لهذه الفئة من الطلاب، أو لم يتم تفعيلها ببعد من قبل الإدارة.`
                        : `The timeframe allocated for registration and specialty routing for this specific candidate category is not active right now.`}
                    </p>
                  </div>
                  <div className="bg-white border border-rose-100 p-4 rounded-xl max-w-xs mx-auto text-xs font-mono font-bold text-slate-700 space-y-1">
                    <div className="text-slate-500 text-[10px] font-sans">
                      {lang === "ar" ? "📅 فترة تسجيلات هذه الفئة الرسمية:" : "📅 Category registration window:"}
                    </div>
                    <div className="text-[#ca4a24] text-xs sm:text-sm tracking-tight font-black flex items-center justify-center gap-1.5 font-mono">
                      <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200">{currentPeriod.startDate}</span>
                      <span>&rarr;</span>
                      <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200">{currentPeriod.endDate}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold font-sans">
                    {lang === "ar" ? "يرجى مراجعة مصلحة التدريس بالقسم للتحقق من التمديدات الاستثنائية للآجال." : "Please refer to your academic college board for any updates."}
                  </div>
                </div>
              ) : (
                <>
                  {/* Names in Arabic Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 required-label">
                    {lang === "ar" ? "الاسم الشخصي (بالعربية)" : lang === "fr" ? "Prénom (en arabe)" : "First Name (Arabic)"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstNameAr}
                    onChange={(e) => setFirstNameAr(e.target.value)}
                    className="w-full text-sm px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-150 text-right"
                    placeholder="مثال: محمد"
                    id="input-firstname-ar"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 required-label">
                    {lang === "ar" ? "اللقب العائلي (بالعربية)" : lang === "fr" ? "Nom de famille (en arabe)" : "Last Name (Arabic)"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={lastNameAr}
                    onChange={(e) => setLastNameAr(e.target.value)}
                    className="w-full text-sm px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-150 text-right"
                    placeholder="مثال: بن علي"
                    id="input-lastname-ar"
                  />
                </div>
              </div>

              {/* Names in English/French Latin Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 text-left">
                    First Name (Latin / French) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstNameEn}
                    onChange={(e) => setFirstNameEn(e.target.value)}
                    className="w-full text-sm px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-150 text-left font-sans"
                    placeholder="e.g. Mohamed"
                    id="input-firstname-en"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 text-left">
                    Last Name (Latin / French) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={lastNameEn}
                    onChange={(e) => setLastNameEn(e.target.value)}
                    className="w-full text-sm px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-150 text-left font-sans"
                    placeholder="e.g. BEN ALI"
                    id="input-lastname-en"
                  />
                </div>
              </div>

              {/* Contact Information (Email & Phone) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    {lang === "ar" ? "البريد الإلكتروني" : lang === "fr" ? "Adresse électronique (Email)" : "Email Address"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-150 text-left font-sans"
                    placeholder="ali@example.com"
                    id="input-email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    {lang === "ar" ? "رقم الهاتف المحمول" : lang === "fr" ? "Numéro de téléphone" : "Mobile Phone Number"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-sm px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-150 text-left font-sans"
                    placeholder="0661234567"
                    id="input-phone"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {lang === "ar" ? "يرجى كتابة الرقم بالصيغة الجزائرية الصالحة (مثال: 05/06/07)" : "Please type a valid 10-digit Algerian mobile number."}
                  </span>
                </div>
              </div>

              {/* National Student Number */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  {lang === "ar" ? "رقم تسجيل الطالب (المكتوب ببطاقة الطالب)" : "Student Registration Number (from Student Card)"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nationalStudentId}
                  onChange={(e) => setNationalStudentId(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-150 font-mono tracking-wider text-left"
                  placeholder="212135019882"
                  id="input-national-id"
                />
              </div>

              {/* Bachelor's/Licence Academic Background */}
              <div className="bg-slate-100/70 p-5 rounded-xl border border-slate-200/60 mt-4 space-y-4">
                <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200/60 mb-2">
                  <GraduationCap className="w-5 h-5 text-official-blue" />
                  <h4 className="text-sm font-bold text-slate-800">
                    {applicationType === "l3_specialty"
                      ? (lang === "ar" ? "تفاصيل المسار الدراسي والنتائج (السنة الثانية ليسانس)" : "Current Academic Track & L2 Rating GPA")
                      : (lang === "ar" ? "تفاصيل شهادة الليسانس المحصل عليها" : lang === "fr" ? "Détails de la licence obtenue" : "Bachelor's / Licence Graduation Details")
                    }
                  </h4>
                </div>

                {applicationType === "l3_specialty" ? (
                  // L2 to L3 Specialty Choice Track layout
                  <div className="space-y-4" id="academic-fields-l3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-500 mb-1">
                          {lang === "ar" ? "المؤسسة الجامعية الحالية" : "Current University"}
                        </label>
                        <div className="w-full text-sm px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-200/50 font-bold text-slate-700">
                          {lang === "ar" ? "جامعة عمار ثليجي - الأغواط" : "Amar Telidji University - Laghouat"}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-500 mb-1">
                          {lang === "ar" ? "المستوى الدراسي الحالي" : "Current Study Level"}
                        </label>
                        <div className="w-full text-sm px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-200/50 font-bold text-slate-700">
                          {lang === "ar" ? "السنة الثانية ليسانس (L2)" : "Second Year Licence (L2)"}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-500 mb-1">
                          {lang === "ar" ? "الشعبة / الجذع المشترك" : "Academic Branch / Major"}
                        </label>
                        <div className="w-full text-sm px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-200/50 font-bold text-slate-700">
                          {lang === "ar" ? "علوم وتكنولوجيا (ST / صيانة وميكانيك)" : "Science & Technology (ST / Maintenance & Mechanics)"}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-[#143e2a] mb-1.5" htmlFor="input-gpa-l1">
                          {lang === "ar" ? "معدل السنة الأولى ليسانس (L1) /20" : "Year 1 (L1) Average / 20"} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="20"
                          required
                          value={l1Gpa}
                          onChange={(e) => setL1Gpa(e.target.value)}
                          className={`w-full text-sm px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-left font-bold ${errors.l1Gpa ? "border-rose-500 bg-rose-50" : "border-emerald-300 bg-white"}`}
                          placeholder="11.50"
                          id="input-gpa-l1"
                        />
                        {errors.l1Gpa && (
                          <p className="text-rose-600 text-[11px] mt-1 font-semibold text-start">{errors.l1Gpa}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/20 p-4 rounded-xl border border-dashed border-emerald-500/20">
                      <div>
                        <label className="block text-sm font-bold text-[#143e2a] mb-1.5" htmlFor="input-gpa-l2">
                          {lang === "ar" ? "معدل السنة الثانية ليسانس (L2) /20" : "Year 2 (L2) Average / 20"} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="20"
                          required
                          value={l2Gpa}
                          onChange={(e) => setL2Gpa(e.target.value)}
                          className={`w-full text-sm px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-left font-bold ${errors.l2Gpa ? "border-rose-500 bg-rose-50" : "border-emerald-300 bg-white"}`}
                          placeholder="12.45"
                          id="input-gpa-l2"
                        />
                        {errors.l2Gpa && (
                          <p className="text-rose-600 text-[11px] mt-1 font-semibold text-start">{errors.l2Gpa}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                          {lang === "ar" ? "معدل توجيه الطور الأول الترتيبي (تلقائي)" : "Overall Orientation GPA (Auto)"}
                        </label>
                        <div className="w-full text-sm px-4 py-2.5 rounded-lg border border-emerald-300 bg-emerald-50/80 font-mono text-left font-bold text-emerald-900 flex justify-between items-center h-[42px]">
                          <span>{licenceGpa || "00.00"}</span>
                          <span className="text-[10px] px-2.5 py-1 rounded bg-emerald-600 text-white font-sans uppercase font-bold tracking-wider">
                            {lang === "ar" ? "محسوب تلقائياً" : "Calculated"}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block text-start">
                          {lang === "ar" 
                            ? "معدل الانتقال الترتيبي السنوي المعتمد للتوجيه والتوزيع (L1 + L2) / 2" 
                            : "The calculated Placement score across the two licensing years."}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Conventional Master Track layout
                  <div className="space-y-4" id="academic-fields-master">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-[#143e2a] mb-1.5" htmlFor="select-university">
                          {lang === "ar" ? "جامعة التخرج" : lang === "fr" ? "Université d'origine" : "Graduation University"} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={university}
                          onChange={(e) => setUniversity(e.target.value)}
                          className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                          id="select-university"
                        >
                          {UNIVERSITIES.map((uni) => (
                            <option key={uni.id} value={uni.id}>{getUniLabel(uni)}</option>
                          ))}
                          <option value="أخرى">{lang === "ar" ? "جامعة أخرى غير مذكورة..." : lang === "fr" ? "Autre université..." : "Other university..."}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-[#143e2a] mb-1.5" htmlFor="select-gradyear">
                          {lang === "ar" ? "سنة الحصول على الليسانس" : "Graduation Year"} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={graduationYear}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "other") {
                              setGraduationYear("other");
                            } else {
                              setGraduationYear(parseInt(val));
                            }
                          }}
                          className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer font-mono"
                          id="select-gradyear"
                        >
                          <option value={2026}>2026</option>
                          <option value={2025}>2025</option>
                          <option value={2024}>2024</option>
                          <option value={2023}>2023</option>
                          <option value="other">{lang === "ar" ? "أخرى / إدخال يدوي..." : lang === "fr" ? "Autre / Saisie manuelle..." : "Other / Manual Entry..."}</option>
                        </select>
                      </div>
                    </div>

                    {applicationType === "master" && (
                      <div className={`mt-4 p-4 rounded-xl border text-xs text-start transition-all duration-300 ${
                        isMaster80Percent 
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                          : "bg-amber-50 border-amber-200 text-amber-900"
                      }`}>
                        <div className="font-extrabold flex items-center gap-1.5 mb-1 text-[13px]">
                          <span>{isMaster80Percent ? "🎓 فئة 80% (خريجي الأغواط - السنة الحالية)" : "🎓 فئة 20% (السنوات السابقة / جامعات أخرى)"}</span>
                        </div>
                        <p className="leading-relaxed opacity-95">
                          {isMaster80Percent 
                            ? (lang === "ar" 
                                ? "بناءً على اختيارك لجامعة الأغواط وسنة التخرج 2026، تم تصنيفك ضمن فئة 80% المخصصة لمتخرجي السنة الحالية للجامعة الأم." 
                                : "Based on Amar Telidji University & graduation year 2026, you are classified in the 80% candidate quota (current year graduates).")
                            : (lang === "ar"
                                ? "بما أنك متخرج من جامعة أخرى أو من خريجي السنوات السابقة، فقد تم تصنيفك ضمن فئة 20%. يرجى العلم أن فترات التسجيل تختلف عن خريجي السنة الحالية."
                                : "Since you graduated from a different university or from previous years, you are classified in the 20% candidate quota.")}
                        </p>
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 font-mono text-[11px] font-bold">
                          <span className="opacity-75">{lang === "ar" ? "⏳ فترة تسجيلات هذه الفئة:" : "⏳ Registration dates for this category:"}</span>
                          <span className="bg-white/80 px-1.5 py-0.5 rounded border border-slate-200">{currentPeriod.startDate}</span>
                          <span>&rarr;</span>
                          <span className="bg-white/80 px-1.5 py-0.5 rounded border border-slate-200">{currentPeriod.endDate}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-sans ${isCurrentOpen ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
                            {isCurrentOpen ? (lang === "ar" ? "مفتوح" : "Open") : (lang === "ar" ? "مغلق" : "Closed")}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Additional manual field for Graduation Year */}
                    {graduationYear === "other" && (
                      <div>
                        <label className="block text-sm font-bold text-[#143e2a] mb-1.5" htmlFor="input-custom-gradyear">
                          {lang === "ar" ? "أدخل سنة الحصول على الليسانس يدوياً" : "Enter Graduation Year Manually"} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min={1950}
                          max={2027}
                          value={customGraduationYear}
                          onChange={(e) => setCustomGraduationYear(e.target.value)}
                          className="w-full text-sm px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                          placeholder={lang === "ar" ? "مثال: 2021" : "e.g. 2021"}
                          id="input-custom-gradyear"
                        />
                      </div>
                    )}

                    {/* Additional field if "Other University" was targeted */}
                    {university === "أخرى" && (
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="input-custom-uni">
                          {lang === "ar" ? "اسم المؤسسة الجامعية بالتفصيل" : "University Name Details"} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={customUniversity}
                          onChange={(e) => setCustomUniversity(e.target.value)}
                          className="w-full text-sm px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          placeholder="e.g. Centre Universitaire Barika (Batna)"
                          id="input-custom-uni"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-[#143e2a] mb-1.5" htmlFor="select-licence-spec">
                          {lang === "ar" ? "تخصص شهادة الليسانس" : lang === "fr" ? "Spécialité de Licence" : "Licence Specialty"} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={licenceSpecialty}
                          onChange={(e) => setLicenceSpecialty(e.target.value)}
                          className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                          id="select-licence-spec"
                        >
                          {LICENCE_SPECIALTIES.map((spec) => (
                            <option key={spec.id} value={spec.id}>{getSpecName(spec)}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => window.dispatchEvent(new CustomEvent("open-specialties-guide"))}
                          className="mt-1.5 text-[11px] font-bold text-amber-700 hover:text-amber-805 hover:underline flex items-center gap-1 cursor-pointer bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50 w-fit"
                        >
                          <span>🔍 {lang === "ar" ? "تفقد تخصصات ماستر المقابلة ومعدل التطابق" : "Check matching Master programs & alignment ratios"}</span>
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-[#143e2a] mb-1.5" htmlFor="input-gpa">
                          {lang === "ar" ? "المعدل العام للتخرج (GPA /20)" : lang === "fr" ? "Note Moyenne Licence (GPA /20)" : "Graduation Overall Average (GPA /20)"} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="20"
                          required
                          value={licenceGpa}
                          onChange={(e) => setLicenceGpa(e.target.value)}
                          className="w-full text-sm px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-left"
                          placeholder="14.32"
                          id="input-gpa"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {lang === "ar" ? "المعدل الإجمالي المحسوب (مجموع السنوات مقسوم على 3 سنوات)" : "The overall calculated average across the three license years."}
                        </span>
                      </div>
                    </div>

                    {/* Additional input if Licence specialty equals other */}
                    {licenceSpecialty === "L-OTHER" && (
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="input-custom-spec">
                          {lang === "ar" ? "اسم تخصص الليسانس الخاص بك بالتفصيل" : "Please Specify Licence Specialty"} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={customLicenceSpecialty}
                          onChange={(e) => setCustomLicenceSpecialty(e.target.value)}
                          className="w-full text-sm px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          placeholder="e.g. Licence Génie Civil"
                          id="input-custom-spec"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
                </>
              )}
            </div>
          )}


          {/* ================= STEP 2: ARRANGING PREFERENCES ================= */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-official-emerald" />
                  <h3 className="text-lg font-bold text-slate-800">
                    {applicationType === "l3_specialty"
                      ? (lang === "ar" ? "ترتيب رغبات توجيه السنة الثالثة ليسانس (4 رغبات مطلوبة)" : "Order L3 Study Specialties (4 choices required)")
                      : (lang === "ar" 
                        ? `ترتيب رغبات التخصص في الماستر (${Math.min(4, numAllowed)} رغبة مطلوبة)` 
                        : `Arrange Master Preferences (${Math.min(4, numAllowed)} Choices required)`)
                    }
                  </h3>
                </div>
                <div className="text-xs bg-amber-50 text-amber-805 border border-amber-200 rounded-lg px-2.5 py-1 font-medium">
                  {lang === "ar" 
                    ? `يجب تحديد ${applicationType === "l3_specialty" ? 4 : Math.min(4, numAllowed)} رغبة دون تكرار` 
                    : `Arrange ${applicationType === "l3_specialty" ? 4 : Math.min(4, numAllowed)} unique choices`}
                </div>
              </div>
 
              <div className="p-4 bg-blue-50 border-r-4 border-blue-500 rounded-lg text-xs leading-relaxed text-blue-900 mb-4 text-start animate-fade-in" id="guideline-step-2">
                <p className="font-bold mb-1">💡 {lang === "ar" ? "إرشادات هامة لترتيب الرغبات:" : "Important guidelines :"}</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {lang === "ar" ? (
                    applicationType === "l3_specialty" ? (
                      <>
                        <li>يتم توزيع الطلبة على التخصصات الأربعة وفق معيار رغبة الطالب والمعدل العام الترتيبي في حدود المقاعد البيداغوجية المتاحة.</li>
                        <li>يجب عليك ترتيب الرغبات الأربعة بالكامل لضمان توجيهك العادل والأقرب لنتائجك في حال اكتمال المقاعد.</li>
                      </>
                    ) : (
                      <>
                        <li>تظهر لك فقط تخصصات الماستر المسموح بها والمتوافقة مع ليسانس التخرج الخاص بك.</li>
                        <li>الترتيب الاستحقاقي يقوم تلقائياً بالنظر في الرغبات بالتسلسل من الأولى إلى الأخيرة.</li>
                      </>
                    )
                  ) : (
                    applicationType === "l3_specialty" ? (
                      <>
                        <li>Students are distributed among the four options based on academic ranking and preference.</li>
                        <li>You must fully specify all 4 options to ensure optimal matches.</li>
                      </>
                    ) : (
                      <>
                        <li>Only master programs compatible and allowed with your specific Licence specialty are available below.</li>
                        <li>Admission matches prioritize compatibility score and graduation GPA, systematically scanning choices downward.</li>
                      </>
                    )
                  )}
                </ul>
              </div>
 
              {applicationType === "master" && numAllowed < 4 && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs font-semibold text-start flex flex-col xs:flex-row xs:items-center justify-between gap-3">
                  <span>ℹ️ {lang === "ar" 
                    ? `ملاحظة: لقد قمنا بتصفية الخيارات لتناسب تخصصك الدراسي. تخصص ليسانس الحالي الخاص بك يسمح بـ ${numAllowed} رغبة فقط في الماستر.` 
                    : `Note: We have filtered choices for your academic profile. Your original licence specialty allows only ${numAllowed} master options in total.`}</span>
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent("open-specialties-guide"))}
                    className="text-[11px] font-bold text-indigo-950 bg-indigo-100 hover:bg-indigo-200 px-2.5 py-1 rounded cursor-pointer shrink-0 transition-colors"
                  >
                    {lang === "ar" ? "تفاصيل التوافق 📑" : "Admissibility Details 📑"}
                  </button>
                </div>
              )}
 
              {/* CHOICE 1 (Option 1) */}
              {(applicationType === "l3_specialty" ? 4 : numAllowed) >= 1 && (
                <div className="p-5 border border-slate-200/80 rounded-xl bg-slate-50/50 shadow-sm relative overflow-hidden">
                  <div className="absolute right-0 left-0 top-0 h-1.5 bg-official-emerald"></div>
                  <label className="block text-sm font-bold text-emerald-950 mb-1.5 flex items-center gap-1.5" htmlFor="select-choice-1">
                    <span className="w-5 h-5 rounded-full bg-official-emerald text-white flex items-center justify-center text-xs font-mono font-bold">1</span>
                    <span>{lang === "ar" ? "الرغبة الأولى (الخيار المفضل والمستهدف الأول)" : "First Choice (Highest priority)"} <span className="text-red-500">*</span></span>
                  </label>
                  <select
                    required
                    value={choice1}
                    onChange={(e) => setChoice1(e.target.value)}
                    className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                    id="select-choice-1"
                  >
                    <option value="">
                      {lang === "ar" 
                        ? (applicationType === "l3_specialty" ? "-- اضغط لاختيار تخصص ليسانس للرغبة 1 --" : "-- اضغط لاختيار تخصص الماستر للرغبة 1 --") 
                        : "-- Select Specialty for Choice 1 --"
                      }
                    </option>
                    {getAvailableOptions(choice1, choice2, choice3, choice4).map(p => (
                      <option key={p.id} value={p.id}>{getProgName(p)}</option>
                    ))}
                  </select>
 
                  {/* Compatibility feedback if selected */}
                  {choice1 && applicationType === "master" && (
                    <div className="mt-2 text-xs flex items-center gap-2">
                      {getProductCompatibility(choice1)?.isMatch ? (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-bold">✓ {lang === "ar" ? "متوافق مباشرة" : "Compatible"}</span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> {lang === "ar" ? "يتطلب دراسة ملائمة استثنائية" : "Sub-optimal matching"}
                        </span>
                      )}
                      <span className="text-slate-500">{getProductCompatibility(choice1)?.text}</span>
                    </div>
                  )}
                </div>
              )}
 
              {/* CHOICE 2 (Option 2) */}
              {(applicationType === "l3_specialty" ? 4 : numAllowed) >= 2 && (
                <div className="p-5 border border-slate-200/80 rounded-xl bg-slate-50/50 shadow-sm relative overflow-hidden">
                  <div className="absolute right-0 left-0 top-0 h-1.5 bg-official-blue/80"></div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5" htmlFor="select-choice-2">
                    <span className="w-5 h-5 rounded-full bg-official-blue/80 text-white flex items-center justify-center text-xs font-mono font-bold">2</span>
                    <span>{lang === "ar" ? "الرغبة الثانية" : "Second Choice"} <span className="text-red-500">*</span></span>
                  </label>
                  <select
                    required
                    value={choice2}
                    onChange={(e) => setChoice2(e.target.value)}
                    className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                    id="select-choice-2"
                  >
                    <option value="">
                      {lang === "ar" 
                        ? (applicationType === "l3_specialty" ? "-- اضغط لاختيار تخصص ليسانس للرغبة 2 --" : "-- اضغط لاختيار تخصص الماستر للرغبة 2 --") 
                        : "-- Select Specialty for Choice 2 --"
                      }
                    </option>
                    {getAvailableOptions(choice2, choice1, choice3, choice4).map(p => (
                      <option key={p.id} value={p.id}>{getProgName(p)}</option>
                    ))}
                  </select>
 
                  {choice2 && applicationType === "master" && (
                    <div className="mt-2 text-xs flex items-center gap-2">
                      {getProductCompatibility(choice2)?.isMatch ? (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-bold">✓ {lang === "ar" ? "متوافق مباشرة" : "Compatible"}</span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> {lang === "ar" ? "يتطلب دراسة ملائمة استثنائية" : "Sub-optimal matching"}
                        </span>
                      )}
                      <span className="text-slate-500">{getProductCompatibility(choice2)?.text}</span>
                    </div>
                  )}
                </div>
              )}
 
              {/* CHOICE 3 (Option 3) */}
              {(applicationType === "l3_specialty" ? 4 : numAllowed) >= 3 && (
                <div className="p-5 border border-slate-200/80 rounded-xl bg-slate-50/50 shadow-sm relative overflow-hidden">
                  <div className="absolute right-0 left-0 top-0 h-1.5 bg-official-blue/60"></div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5" htmlFor="select-choice-3">
                    <span className="w-5 h-5 rounded-full bg-official-blue/60 text-white flex items-center justify-center text-xs font-mono font-bold">3</span>
                    <span>{lang === "ar" ? "الرغبة الثالثة" : "Third Choice"} <span className="text-red-500">*</span></span>
                  </label>
                  <select
                    required
                    value={choice3}
                    onChange={(e) => setChoice3(e.target.value)}
                    className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                    id="select-choice-3"
                  >
                    <option value="">
                      {lang === "ar" 
                        ? (applicationType === "l3_specialty" ? "-- اضغط لاختيار تخصص ليسانس للرغبة 3 --" : "-- اضغط لاختيار تخصص الماستر للرغبة 3 --") 
                        : "-- Select Specialty for Choice 3 --"
                      }
                    </option>
                    {getAvailableOptions(choice3, choice1, choice2, choice4).map(p => (
                      <option key={p.id} value={p.id}>{getProgName(p)}</option>
                    ))}
                  </select>
 
                  {choice3 && applicationType === "master" && (
                    <div className="mt-2 text-xs flex items-center gap-2">
                      {getProductCompatibility(choice3)?.isMatch ? (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-bold">✓ {lang === "ar" ? "متوافق مباشرة" : "Compatible"}</span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> {lang === "ar" ? "يتطلب دراسة ملائمة استثنائية" : "Sub-optimal matching"}
                        </span>
                      )}
                      <span className="text-slate-500">{getProductCompatibility(choice3)?.text}</span>
                    </div>
                  )}
                </div>
              )}
 
              {/* CHOICE 4 (Option 4) */}
              {(applicationType === "l3_specialty" ? 4 : numAllowed) >= 4 && (
                <div className="p-5 border border-slate-200/80 rounded-xl bg-slate-50/50 shadow-sm relative overflow-hidden">
                  <div className="absolute right-0 left-0 top-0 h-1.5 bg-official-blue/40"></div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5" htmlFor="select-choice-4">
                    <span className="w-5 h-5 rounded-full bg-official-blue/40 text-white flex items-center justify-center text-xs font-mono font-bold">4</span>
                    <span>{lang === "ar" ? "الرغبة الرابعة" : "Fourth Choice"} <span className="text-red-500">*</span></span>
                  </label>
                  <select
                    required
                    value={choice4}
                    onChange={(e) => setChoice4(e.target.value)}
                    className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                    id="select-choice-4"
                  >
                    <option value="">
                      {lang === "ar" 
                        ? (applicationType === "l3_specialty" ? "-- اضغط لاختيار تخصص ليسانس للرغبة 4 --" : "-- اضغط لاختيار تخصص الماستر للرغبة 4 --") 
                        : "-- Select Specialty for Choice 4 --"
                      }
                    </option>
                    {getAvailableOptions(choice4, choice1, choice2, choice3).map(p => (
                      <option key={p.id} value={p.id}>{getProgName(p)}</option>
                    ))}
                  </select>
 
                  {choice4 && applicationType === "master" && (
                    <div className="mt-2 text-xs flex items-center gap-2">
                       {getProductCompatibility(choice4)?.isMatch ? (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-bold">✓ {lang === "ar" ? "متوافق مباشرة" : "Compatible"}</span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> {lang === "ar" ? "يتطلب دراسة ملائمة استثنائية" : "Sub-optimal matching"}
                        </span>
                      )}
                      <span className="text-slate-500">{getProductCompatibility(choice4)?.text}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}


          {/* ================= STEP 3: ATTACHMENTS UPLOAD LAYOUT ================= */}
          {step === 3 && applicationType === "master" && !isMaster80Percent && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2 text-start">
                <Upload className="w-5 h-5 text-official-emerald animate-bounce" />
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {lang === "ar" ? "رفع المستندات والملفات الثبوتية المطلوبة بيداغوجياً" : lang === "fr" ? "Dépôt des fichiers et pièces justificatives" : "Upload Supporting Academic Documents"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{lang === "ar" ? "يرجى سحب وإفلات أو تحديد وثائق واضحة وصحيحة بصيغة PDF أو صور (أقل من 5 ميغابايت لكل ملف)" : "Please drag and drop or select clear PDF documents or images under 5MB."}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* File 1: Transcript */}
                <div 
                  onDragEnter={(e) => handleDrag(e, "transcript", true)}
                  onDragOver={(e) => handleDrag(e, "transcript", true)}
                  onDragLeave={(e) => handleDrag(e, "transcript", false)}
                  onDrop={(e) => handleDrop(e, "transcript")}
                  className={`p-5 border-2 border-dashed rounded-xl flex flex-col justify-between h-52 relative transition-all duration-200 ${
                    dragActive["transcript"] 
                      ? "border-official-emerald bg-emerald-50/50 scale-[1.01]" 
                      : "border-slate-300 bg-slate-50 hover:bg-slate-100/60"
                  }`}
                >
                  <input
                    type="file"
                    id="file-input-transcript"
                    className="hidden"
                    accept=".pdf,image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange("transcript", e.target.files[0]);
                      }
                    }}
                  />
                  <div>
                    <h4 className="text-xs sm:text-xs font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                      <span>{lang === "ar" ? "كشف نقاط الليسانس الإجمالي (السنوي الثلاثي)" : "Global Bachelor's Transcript"}</span>
                      <span className="text-red-500">*</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{lang === "ar" ? "يرجى سحب وإفلات أو رفع كشف نقاط السنوات الثلاث مدمجة في ملف واحد" : "Drag & drop or upload scanned years 1, 2 and 3 transcripts combined."}</p>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-3">
                    {documents.transcript ? (
                      <div className="flex flex-col gap-1 w-full bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs text-emerald-800">
                        <span className="font-semibold flex items-center justify-between gap-1.5 overflow-hidden">
                          <span className="flex items-center gap-1 min-w-0">
                            <FileCheck className="w-4 h-4 text-emerald-650 shrink-0" />
                            <span className="truncate text-start" title={uploadedFiles.transcript?.name || "transcript.pdf"}>
                              {uploadedFiles.transcript?.name || "transcript_complete.pdf"}
                            </span>
                          </span>
                          <button type="button" onClick={() => handleRemoveDoc("transcript")} className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </span>
                        {uploadedFiles.transcript?.size && (
                          <span className="text-[10px] text-slate-400 pl-5 text-start">{uploadedFiles.transcript.size}</span>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => document.getElementById("file-input-transcript")?.click()}
                        disabled={uploadingDoc === "transcript"}
                        className="w-full py-2 bg-[#12255c] text-white rounded-lg text-xs font-bold hover:bg-[#1a3275] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {uploadingDoc === "transcript" ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            <span>{lang === "ar" ? "يرفع..." : "Uploading..."}</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>{lang === "ar" ? "رفع كشف النقاط" : "Upload transcript"}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* File 2: Graduation Diploma */}
                <div 
                  onDragEnter={(e) => handleDrag(e, "diploma", true)}
                  onDragOver={(e) => handleDrag(e, "diploma", true)}
                  onDragLeave={(e) => handleDrag(e, "diploma", false)}
                  onDrop={(e) => handleDrop(e, "diploma")}
                  className={`p-5 border-2 border-dashed rounded-xl flex flex-col justify-between h-52 relative transition-all duration-200 ${
                    dragActive["diploma"] 
                      ? "border-official-emerald bg-emerald-50/50 scale-[1.01]" 
                      : "border-slate-300 bg-slate-50 hover:bg-slate-100/60"
                  }`}
                >
                  <input
                    type="file"
                    id="file-input-diploma"
                    className="hidden"
                    accept=".pdf,image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange("diploma", e.target.files[0]);
                      }
                    }}
                  />
                  <div>
                    <h4 className="text-xs sm:text-xs font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                      <span>{lang === "ar" ? "نسحة من شهادة التخرج المؤقتة أو النهائية" : "Licence Degree or Success Certificate"}</span>
                      <span className="text-red-500">*</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{lang === "ar" ? "يرجى سحب وإفلات أو رفع شهادة ليسانس المؤقتة المعتمدة للمعهد" : "Drag & drop or upload temporary or permanent major licence diploma."}</p>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-3">
                    {documents.diploma ? (
                      <div className="flex flex-col gap-1 w-full bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs text-emerald-800">
                        <span className="font-semibold flex items-center justify-between gap-1.5 overflow-hidden">
                          <span className="flex items-center gap-1 min-w-0">
                            <FileCheck className="w-4 h-4 text-emerald-650 shrink-0" />
                            <span className="truncate text-start" title={uploadedFiles.diploma?.name || "diploma.pdf"}>
                              {uploadedFiles.diploma?.name || "diploma_licence.pdf"}
                            </span>
                          </span>
                          <button type="button" onClick={() => handleRemoveDoc("diploma")} className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </span>
                        {uploadedFiles.diploma?.size && (
                          <span className="text-[10px] text-slate-400 pl-5 text-start">{uploadedFiles.diploma.size}</span>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => document.getElementById("file-input-diploma")?.click()}
                        disabled={uploadingDoc === "diploma"}
                        className="w-full py-2 bg-[#12255c] text-white rounded-lg text-xs font-bold hover:bg-[#1a3275] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {uploadingDoc === "diploma" ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            <span>{lang === "ar" ? "يرفع..." : "Uploading..."}</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>{lang === "ar" ? "رفع شهادة ليسانس" : "Upload diploma"}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* File 3: Identity Card */}
                <div 
                  onDragEnter={(e) => handleDrag(e, "idCard", true)}
                  onDragOver={(e) => handleDrag(e, "idCard", true)}
                  onDragLeave={(e) => handleDrag(e, "idCard", false)}
                  onDrop={(e) => handleDrop(e, "idCard")}
                  className={`p-5 border-2 border-dashed rounded-xl flex flex-col justify-between h-52 relative transition-all duration-200 ${
                    dragActive["idCard"] 
                      ? "border-official-emerald bg-emerald-50/50 scale-[1.01]" 
                      : "border-slate-300 bg-slate-50 hover:bg-slate-100/60"
                  }`}
                >
                  <input
                    type="file"
                    id="file-input-idCard"
                    className="hidden"
                    accept=".pdf,image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange("idCard", e.target.files[0]);
                      }
                    }}
                  />
                  <div>
                    <h4 className="text-xs sm:text-xs font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                      <span>{lang === "ar" ? "بطاقة التعريف الوطنية بيومترية (من الجهتين)" : "National National ID (Double-Sided)"}</span>
                      <span className="text-red-500">*</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{lang === "ar" ? "يرجى سحب وإفلات أو رفع صورة ملونة واضحة لبطاقة التعريف من الجهتين" : "Drag & drop or upload a clear color photocopy scan of both sides of ID."}</p>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-3">
                    {documents.idCard ? (
                      <div className="flex flex-col gap-1 w-full bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs text-emerald-800">
                        <span className="font-semibold flex items-center justify-between gap-1.5 overflow-hidden">
                          <span className="flex items-center gap-1 min-w-0">
                            <FileCheck className="w-4 h-4 text-emerald-650 shrink-0" />
                            <span className="truncate text-start" title={uploadedFiles.idCard?.name || "idCard.jpg"}>
                              {uploadedFiles.idCard?.name || "nationalID_biometric.jpg"}
                            </span>
                          </span>
                          <button type="button" onClick={() => handleRemoveDoc("idCard")} className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </span>
                        {uploadedFiles.idCard?.size && (
                          <span className="text-[10px] text-slate-400 pl-5 text-start">{uploadedFiles.idCard.size}</span>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => document.getElementById("file-input-idCard")?.click()}
                        disabled={uploadingDoc === "idCard"}
                        className="w-full py-2 bg-[#12255c] text-white rounded-lg text-xs font-bold hover:bg-[#1a3275] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {uploadingDoc === "idCard" ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            <span>{lang === "ar" ? "يرفع..." : "Uploading..."}</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>{lang === "ar" ? "رفع بطاقة التعريف" : "Upload ID card"}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}


          {/* ================= RECONCILED FINAL STEP: REVIEW & CONFIRM FINAL STATEMENT ================= */}
          {step === totalSteps && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2 text-start">
                <FileCheck className="w-5 h-5 text-official-emerald" />
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {lang === "ar" ? "مراجعة شاملة وتأكيد صحة مدخلات ملف الترشح" : lang === "fr" ? "Vérification des informations avant envoi final" : "Dossier review and final submission agreement"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{lang === "ar" ? "يرجى مراجعة كافة البيانات؛ لا يمكن تعديل الملف بمجرد تأكيد تقديم الطلب نهائياً" : "Double check everything; no online modifications are permitted once sent."}</p>
                </div>
              </div>

              {/* Graphical Summary Board */}
              <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4 text-start text-xs sm:text-sm">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 block text-xs">{lang === "ar" ? "الاسم الكامل (عربي ولاتيني):" : "Full Name (Ar/Latin):"}</span>
                    <span className="font-bold text-slate-800 block">
                      {firstNameAr} {lastNameAr} • <span className="font-sans font-normal text-slate-500">{firstNameEn} {lastNameEn}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">{lang === "ar" ? "رقم الطالب الوطني BAC:" : "BAC National student ID:"}</span>
                    <span className="font-mono font-bold text-slate-800 block tracking-wider">{nationalStudentId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">{lang === "ar" ? "البريد الإلكتروني والهاتف:" : "Email & Mobile Phone:"}</span>
                    <span className="font-semibold text-slate-800 block">{email} | {phone}</span>
                  </div>
                  {applicationType === "l3_specialty" ? (
                    <>
                      <div>
                        <span className="text-slate-400 block text-xs">{lang === "ar" ? "المسار الأكاديمي والمستوى:" : "Academic Level & Track:"}</span>
                        <span className="font-bold text-slate-800 block">
                          {lang === "ar" ? "جامعة الأغواط • ثانية ليسانس (L2) - علوم وتكنولوجيا" : "University of Laghouat • L2 - Science & Technology"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs">{lang === "ar" ? "نتائج المسار الدراسي ومعدل التوجيه:" : "Academic results and Orientation GPA:"}</span>
                        <span className="font-bold text-[#103825] flex flex-wrap gap-1.5 items-center mt-0.5">
                          <span className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono font-normal">
                            L1: <span className="font-bold">{parseFloat(l1Gpa).toFixed(2)}</span>
                          </span>
                          <span className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono font-normal">
                            L2: <span className="font-bold">{parseFloat(l2Gpa).toFixed(2)}</span>
                          </span>
                          <span className="text-[11px] text-slate-400">←</span>
                          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded text-[11px] font-mono">
                            {lang === "ar" ? "معدل التوجيه: " : "Orientation: "}
                            <span className="font-extrabold text-[#103825]">{parseFloat(licenceGpa).toFixed(2)}</span> / 20
                          </span>
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-slate-400 block text-xs">{lang === "ar" ? "مؤسسة التخرج من الليسانس:" : "Bachelor's / Origin University:"}</span>
                        <span className="font-bold text-slate-800 block">
                          {UNIVERSITIES.find(u => u.id === university)?.nameAr || customUniversity}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs">{lang === "ar" ? "تخصص شهادة الليسانس والمعدل:" : "Licence major specialty and average GPA:"}</span>
                        <span className="font-bold text-[#103825]">
                          {LICENCE_SPECIALTIES.find(s => s.id === licenceSpecialty)?.nameAr || customLicenceSpecialty}
                          {" • "}
                          <span className="font-mono text-base font-extrabold text-slate-900">{parseFloat(licenceGpa).toFixed(2)}</span> / 20
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="border-t border-slate-200/80 pt-3 mt-2">
                  <span className="text-slate-400 block text-xs mb-2">
                    {lang === "ar" 
                      ? (applicationType === "l3_specialty"
                          ? `ترتيب رغبات التوجيه والتخصص المتاحة والمختارة (${Math.min(4, numAllowed)} رغبة) بالتسلسل التنازلي:`
                          : `ترتيب رغبات الماستر المتاحة والمختارة (${Math.min(4, numAllowed)} رغبة) بالتسلسل التنازلي:`)
                      : (applicationType === "l3_specialty"
                          ? `Arranged ${Math.min(4, numAllowed)} Specialty choices in priority order:`
                          : `Arranged ${Math.min(4, numAllowed)} Master Specialty choices in priority order:`)}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    {[choice1, choice2, choice3, choice4].slice(0, numAllowed).map((choiceId, idx) => {
                      const programObj = applicationType === "l3_specialty"
                        ? L3_SPECIALTIES.find(p => p.id === choiceId)
                        : MASTER_PROGRAMS.find(p => p.id === choiceId);
                      const programName = programObj ? getProgName(programObj) : choiceId;
                      return (
                        <div key={idx} className="bg-white border border-slate-200 rounded-lg p-2.5 flex flex-col justify-between align-middle h-full text-center relative pt-4">
                          <span className="absolute right-1.5 top-1 bg-emerald-100 text-emerald-850 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full">
                            {lang === "ar" ? `رغبة ${idx + 1}` : `Voeu ${idx + 1}`}
                          </span>
                          <p className="text-xs font-bold text-slate-700 leading-tight mt-2">{programName.split(" (")[0]}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Document summary status banner */}
                <div className="bg-emerald-950 text-white rounded-lg p-3 text-xs flex items-center justify-between border border-amber-400/40">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-amber-300 stroke-[2.5]" />
                    <span>
                      {applicationType === "l3_specialty"
                        ? (lang === "ar" ? "تم التحقق من اكتمال وتوافق رغبات التوجيه بنجاح" : "Compliance verified: All academic orientation choices validated successfully.")
                        : isMaster80Percent
                          ? (lang === "ar" ? "مؤهل للإعفاء التلقائي ودون الحاجة لرفع مستندات يدوياً (فئة 80% خريجي الأغواط)" : "Exempt from document uploads (80% Laghouat alumni quota) - automatic verification active.")
                          : (lang === "ar" ? "تم التحقق من اكتمال رفع المستندات الإلزامية بنجاح" : "Compliance verified: All mandatory electronic documents uploaded successfully.")
                      }
                    </span>
                  </div>
                  <span className="font-bold text-amber-300">{lang === "ar" ? "مكتمل" : "Ready"}</span>
                </div>
              </div>

              {/* Legal declaration block */}
              <div className="p-4 bg-amber-50/70 border-r-4 border-amber-400 rounded-xl space-y-3 text-start">
                <h4 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> {lang === "ar" ? "تصريح شرفي وصحة البيانات" : "Honor Declaration of Compliance"}
                </h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {lang === "ar" 
                    ? (applicationType === "l3_specialty"
                        ? `أشهد بشرفي على دقة وصحة جميع البيانات والمعدلات المدونة في هذه الاستمارة لتوجيهي لتخصص السنة الثالثة ليسانس، وأتحمل المسؤولية الكاملة عن أي خطأ أو تباين صريح مع سجلات وكشوف النقاط الرسمية.`
                        : `أشهد بشرفي على دقة وصحة جميع البيانات المدونة في هذه الاستمارة لترشيحي للتكوين بالدراسات العليا ماستر دفعة ${graduationYear === "other" ? (customGraduationYear || "...") : graduationYear}، وأتحمل المسؤولية القانونية الكاملة عن أي إغفال أو وثيقة غير صادقة؛ كما أقر بعلمي بأن الإبقاء على ملف وهمي أو بيانات خاطئة يعرضني للإقصاء النهائي فورا.`)
                    : (applicationType === "l3_specialty"
                        ? `I hereby declare on my honor that all the academic details and average GPAs entered for my L3 orientation are true and correct, and I assume full responsibility for any discrepancies with the official transcripts.`
                        : `I hereby declare on my honor that the information provided in this application is true, accurate, and complete. I understand that any false declaration will immediately lead to the rejection of my candidature and potential administrative measures.`)}
                </p>
                <label className="flex items-center gap-2.5 mt-2.5 cursor-pointer text-slate-850 font-bold select-none text-xs">
                  <input
                    type="checkbox"
                    checked={declarationAccepted}
                    onChange={(e) => setDeclarationAccepted(e.target.checked)}
                    className="w-4.5 h-4.5 text-emerald-600 border-amber-400 rounded focus:ring-emerald-500 cursor-pointer"
                    id="checkbox-declaration"
                  />
                  <span>
                    {applicationType === "l3_specialty"
                      ? (lang === "ar" ? "أوافق على نص التصريح الشرفي وألتزم بصحة وأمانة المعلومات الأكاديمية المدونة" : "I agree and bind myself to the academic details entered.")
                      : (lang === "ar" ? "أوافق على نص التصريح الشرفي وألتزم بصحة المعلومات والملفات المرفوعة" : "I agree and bind myself to the honor declaration contents.")
                    }
                  </span>
                </label>
              </div>

              {errors.declaration && (
                <div className="p-3 bg-red-100 text-red-800 text-xs font-bold rounded-lg mt-1">
                  {errors.declaration}
                </div>
              )}
            </div>
          )}
            </motion.div>
          </AnimatePresence>


          {/* ================= NAVIGATION FOOTER CONTROLS ================= */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between gap-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all duration-150 flex items-center gap-1.5 cursor-pointer"
                id="btn-step-prev"
              >
                {lang === "ar" ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                <span>{lang === "ar" ? "الخطوة السابقة" : "Previous Step"}</span>
              </button>
            ) : (
              <div></div>
            )}

            {step < totalSteps && (isCurrentOpen || isSiteAdmin) ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2.5 bg-official-blue hover:bg-[#16307e] text-white font-bold rounded-xl text-sm transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md"
                id="btn-step-next"
              >
                <span>{lang === "ar" ? "المتابعة والاستمرار" : "Continue"}</span>
                {lang === "ar" ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : step < totalSteps ? (
              <div className="text-xs font-bold text-rose-500 bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg">
                ⚠️ {lang === "ar" ? "التسجيل مغلق لهذا الطور حالياً" : "Registration is currently closed for this track"}
              </div>
            ) : (
              <button
                type="submit"
                className="px-8 py-3 bg-official-emerald hover:bg-emerald-650 text-white font-extrabold rounded-xl text-sm transition-all duration-150 flex items-center gap-2 cursor-pointer shadow-md transform active:scale-98"
                id="btn-submit-app"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>{lang === "ar" ? "إرسال وتأكيد الطلب نهائياً" : lang === "fr" ? "Confirmer et envoyer le dossier" : "Submit & Seal Application"}</span>
              </button>
            )}
          </div>

        </form>
      </div>

      {/* Specialty Assignment Conditions Overlay Modal */}
      {showRulesModal && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-55 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in"
          id="rules-pop-backdrop"
          onClick={() => setShowRulesModal(false)}
        >
          <div 
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden transform scale-100 transition-all duration-300"
            id="rules-pop-container"
            onClick={(e) => e.stopPropagation()}
            dir={lang === "ar" ? "rtl" : "ltr"}
          >
            {/* Modal Header */}
            <div className={`p-5 flex items-center justify-between border-b border-slate-100 ${
              applicationType === "master" ? "bg-gradient-to-r from-indigo-50/50 via-white to-indigo-50/10" : "bg-gradient-to-r from-emerald-50/50 via-white to-emerald-50/10"
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${applicationType === "master" ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"}`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="text-start">
                  <h4 className="font-extrabold text-sm text-slate-900">
                    {lang === "ar" 
                      ? `شروط التوجيه لطور ${applicationType === "master" ? "الماستر (M1)" : "الليسانس (L3)"}` 
                      : lang === "fr"
                      ? `Conditions d'orientation - ${applicationType === "master" ? "Master (M1)" : "Licence (L3)"}`
                      : `Orientation Criteria - ${applicationType === "master" ? "Master (M1)" : "Licence (L3)"}`}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {lang === "ar" ? "المعايير والقواعد المعتمدة من اللجنة البيداغوجية للقسم" : "Official rules set by the department's pedagogical commission"}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4 cursor-pointer" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 text-start space-y-4">
              {applicationType === "master" ? (
                <>
                  {/* Master Track Content */}
                  <div className="space-y-3.5">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">١</span>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                        {lang === "ar"
                          ? "الترشح مفتوح لحاملي شهادة ليسانس دفعة 2026 في التخصصات المتوافقة بيداغوجياً مع تخصص الماستر المطلوب."
                          : lang === "fr"
                          ? "Inscription ouverte aux diplômés de Licence de la promotion 2026 dans les filières d'origine compatibles."
                          : "Application is open strictly for 2026 Licence (Bachelor) graduates with compatible field specializations."}
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">٢</span>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                        {lang === "ar"
                          ? "معدل الترتيب البيداغوجي المعتمد في الفرز والتوزيع = معدل ليسانس تخرج × معامل التوافق البيداغوجي للشعبة."
                          : lang === "fr"
                          ? "Calcul du score d'orientation = Moyenne générale de Licence × Coefficient de compatibilité de la filière."
                          : "Merit Score Formula = Cumulative Graduation GPA × Stream Compatibility Coefficient."}
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">٣</span>
                      <div>
                        <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                          {lang === "ar"
                            ? "معاملات التوافق وقيمة رتبة التوافق:"
                            : lang === "fr"
                            ? "Coefficients de compatibilité appliqués :"
                            : "Compatibility Weights applied:"}
                        </p>
                        <div className="mt-1.5 grid grid-cols-3 gap-2 text-[10px] font-mono font-bold text-slate-500">
                          <div className="bg-emerald-50 text-emerald-800 p-1.5 rounded-lg border border-emerald-100 text-center">
                            {lang === "ar" ? "مطابق مباشر: 1.00" : "Direct: 1.00"}
                          </div>
                          <div className="bg-indigo-50 text-indigo-800 p-1.5 rounded-lg border border-indigo-100 text-center">
                            {lang === "ar" ? "قريب جداً: 0.90" : "Very close: 0.90"}
                          </div>
                          <div className="bg-rose-50 text-rose-850 p-1.5 rounded-lg border border-rose-100 text-center">
                            {lang === "ar" ? "غير متوافق: 0.00" : "Unrelated: 0.00"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">٤</span>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                        {lang === "ar"
                          ? "عدد المقاعد البيداغوجية المتاحة لكل تخصص ماستر محدد بـ 4 طلبة فقط لتأمين التأطير النوعي والأمثل."
                          : lang === "fr"
                          ? "La capacité d'accueil pédagogique est fixée à 4 places seulement par spécialité de Master."
                          : "National/departmental capacity limits are strictly set to 4 available seats per Master's stream."}
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">٥</span>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                        {lang === "ar"
                          ? "يتم تلبية الرغبات الأربع تنازلياً حسب الاستحقاق وقدرة استيعاب وتأطير الأفواج البيداغوجية لكل تخصص."
                          : lang === "fr"
                          ? "L'attribution des vœux est faite par ordre de mérite jusqu'à la limite des places disponibles."
                          : "Student choices (1-4) are satisfied progressively via a stable-allocation merit GPA algorithm."}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* L3 Track Content */}
                  <div className="space-y-3.5">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">١</span>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                        {lang === "ar"
                          ? "يستهدف هذا الطور طلبة السنة الثانية ليسانس (L2) لتوطينهم وتوجيههم وتوجيه رغباتهم لشعب السنة الثالثة ليسانس."
                          : lang === "fr"
                          ? "Destiné aux étudiants de 2ème année (L2) désirant s'orienter vers les spécialités de 3ème année (L3)."
                          : "This phase targets active second-year (L2) students transitioning towards L3 specialty paths."}
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">٢</span>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                        {lang === "ar"
                          ? "معدل الترتيب التوجيهي المعتمد للفرز والمقارنة = (معدل السنة أولى L1 + معدل السنة ثانية L2) / 2."
                          : lang === "fr"
                          ? "La moyenne générale d'orientation = (Moyenne de la 1ère année L1 + Moyenne de la 2ème année L2) / 2."
                          : "The active merit orientation score is strictly calculated as the simple average: (Year 1 L1 GPA + Year 2 L2 GPA) / 2."}
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">٣</span>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                        {lang === "ar"
                          ? "لا يتم إدراج أو تطبيق معاملات توافق بيداغوجية لكون الطور يوجه رغبات داخلية موحدة بقسم الهندسة الميكانيكية."
                          : lang === "fr"
                          ? "Pas d'application de coefficients de compatibilité (orientation interne directe)."
                          : "No compatibility modifiers are applied because this is an internal uniform department placement scale."}
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">٤</span>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                        {lang === "ar"
                          ? "يرتب الطلبة ترتيباً تنازلياً، ويوجهون لتلبية رغباتهم الأربعة حسب الاستحقاق والقدرة الاستيعابية للفوج البيداغوجي."
                          : lang === "fr"
                          ? "Les affectations de spécialité s'effectuent par ordre de mérite jusqu'à épuisement des quotas de chaque section."
                          : "Students are sorted downwards and allocated to their choices (1-4) by merit until each section is saturated."}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className={`px-5 py-2 rounded-xl text-xs font-black text-white hover:brightness-95 cursor-pointer shadow-xs transition-all ${
                  applicationType === "master" ? "bg-indigo-650" : "bg-emerald-650"
                }`}
              >
                {lang === "ar" ? "موافق، تم الاستيعاب" : lang === "fr" ? "D'accord, compris" : "Understood, Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Validation Alert Modal to prevent proceeding/submitting with empty mandatory fields */}
      {validationAlertFields && validationAlertFields.length > 0 && (
        <div 
          className="fixed inset-0 bg-slate-900/65 z-[9999] flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in text-start"
          onClick={() => setValidationAlertFields(null)}
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          <div 
            className="bg-white rounded-2xl border border-slate-200/95 shadow-2xl max-w-md w-full overflow-hidden transform scale-100 transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 flex items-center gap-3 bg-rose-50 border-b border-rose-100 text-rose-700">
              <div className="p-2.5 bg-rose-100/85 rounded-lg shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div className="grow">
                <h4 className="font-extrabold text-sm text-rose-900 leading-tight">
                  {lang === "ar" ? "🔑 تنبيه: توجد خانات غير مكتملة" : lang === "fr" ? "🔑 Erreur : Champs incomplets" : "🔑 Alert: Missing Information"}
                </h4>
                <p className="text-[10px] text-rose-500 font-bold mt-0.5 leading-tight">
                  {lang === "ar" ? "الرجاء تعبئة كافة البيانات المطلوبة للمتابعة" : lang === "fr" ? "Veuillez remplir les champs obligatoires" : "Please complete all mandatory parameters"}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[300px] overflow-y-auto">
              <p className="text-xs text-slate-650 font-semibold leading-relaxed">
                {lang === "ar" 
                  ? "لا يمكنك الانتقال إلى المرحلة التالية حتى تقوم بملء أو تصحيح هذه الخانات الإلزامية:"
                  : lang === "fr"
                  ? "Vous ne pouvez pas passer à l'étape suivante tant que ces informations requises ne sont pas fournies :"
                  : "You cannot proceed to the next stage until you provide or correct these mandatory inputs:"}
              </p>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 divide-y divide-slate-150 font-semibold text-xs text-slate-755">
                {validationAlertFields.map((fieldKey, idx) => {
                  const label = getFieldLabel(fieldKey);
                  const errorMsg = errors[fieldKey];
                  return (
                    <div key={idx} className="py-2.5 flex flex-col justify-start gap-1 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                        <span className="font-extrabold text-slate-800">{label}</span>
                      </div>
                      {errorMsg && (
                        <span className="text-[10px] text-rose-600 font-bold leading-normal text-start pr-3.5 pl-3.5 mt-0.5">
                          {errorMsg}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-150 flex justify-end">
              <button
                type="button"
                onClick={() => setValidationAlertFields(null)}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs font-black cursor-pointer shadow-sm hover:shadow-md transition-all duration-150 w-full sm:w-auto"
              >
                {lang === "ar" ? "حسنًا، سأكملها الآن" : lang === "fr" ? "D'accord, je complète" : "Okay, Let's Complete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
