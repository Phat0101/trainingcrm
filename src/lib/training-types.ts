export const TRAINING_TYPES = [
  'Sinh hoạt chuyên môn tại Bệnh viện',
  'Sinh hoạt chuyên môn ngoài Bệnh viện',
  'Tham gia NCKH/ Hội đồng nghiệm thu NCKH',
  'Khác',
] as const;

export type TrainingType = (typeof TRAINING_TYPES)[number];
