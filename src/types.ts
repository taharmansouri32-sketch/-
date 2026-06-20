/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ApplicationStatus {
  PENDING = "pending",       // قيد الدراسة
  ACCEPTED = "accepted",     // مقبول مبدئياً
  REJECTED = "rejected",     // مرفوض
}

export interface DocumentUploads {
  transcript: boolean;      // كشف نقاط ليسانس
  diploma: boolean;         // شهادة ليسانس أو النجاح المؤقتة
  idCard: boolean;          // بطاقة التعريف الوطنية
  motivation: boolean;      // رسالة الدافع (للترشح للماستر)
}

export interface CandidateApplication {
  id: string;                // رقم التسجيل الموحد (مثال: M2026-4820 أو L2026-3820)
  applicationType?: "master" | "l3_specialty"; // نوع طلب التسجيل (ماستر أو توجيه ليسانس L3)
  firstNameAr: string;       // الاسم بالعربية
  lastNameAr: string;        // اللقب بالعربية
  firstNameEn: string;       // الاسم باللاتينية
  lastNameEn: string;        // اللقب باللاتينية
  email: string;             // البريد الإلكتروني
  phone: string;             // رقم الهاتف
  nationalStudentId: string; // رقم التسجيل الوطني للطالب (BAC)
  licenceSpecialty: string;  // تخصص الليسانس
  customLicenceSpecialty?: string; // تخصص ليسانس مخصص في حال اختيار "آخر"
  licenceGpa: number;        // معدل الليسانس (من 20)
  l1Gpa?: number;            // معدل السنة الأولى ليسانس (للأولى / الطور الأول)
  l2Gpa?: number;            // معدل السنة الثانية ليسانس (للثانية / الطور الأول)
  university: string;        // جامعة التخرج
  graduationYear: number;    // سنة التخرج
  choices: [string, string, string, string]; // بالضبط 4 خيارات لبرامج الماستر
  status: ApplicationStatus; // حالة الملف
  acceptedChoiceIndex?: number; // مؤشر الرغبة التي تم قبول الطالب فيها (0، 1، 2، 3)
  acceptedProgramId?: string;  // معرف برنامج الماستر المقبول فيه
  rejectionReason?: string;    // سبب الرفض إن وجد
  createdAt: string;         // تاريخ التقديم
  documents: DocumentUploads;
  uploadedFileNames?: Record<string, string>;
}

export interface MasterProgram {
  id: string;               // معرف البرنامج (مثال: M-AI)
  nameAr: string;           // اسم الماستر بالعربية
  nameEn: string;           // اسم الماستر بالإنجليزية
  nameFr: string;           // اسم الماستر بالفرنسية
  categoryAr: string;       // الشعبة/المجال بالعربية
  categoryEn: string;       // الشعبة/المجال بالإنجليزية
  categoryFr: string;       // الشعبة/المجال بالفرنسية
  facultyAr: string;        // الكلية بالعربية
  facultyEn: string;        // الكلية بالإنجليزية
  facultyFr: string;        // الكلية بالفرنسية
  capacity: number;         // الطاقة الاستيعابية
  minRecommendedGpa: number; // المعدل الأدنى الموصى به لولوج هذا التخصص
  allowedLicenceSpecialties: string[]; // معرفات تخصصات ليسانس المقبولة
}

export interface LicenceSpecialty {
  id: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
}
