-- Normalize TrainingRecord.trainingType values to the 4 canonical options:
--   1. Sinh hoạt chuyên môn tại Bệnh viện       (unchanged)
--   2. Sinh hoạt chuyên môn ngoài Bệnh viện
--   3. Tham gia NCKH/ Hội đồng nghiệm thu NCKH
--   4. Khác
--
-- Any value not matching the first three known legacy strings is mapped to 'Khác'.

UPDATE "TrainingRecord"
SET "trainingType" = CASE
    WHEN "trainingType" = 'Sinh hoạt chuyên môn tại Bệnh viện'
        THEN 'Sinh hoạt chuyên môn tại Bệnh viện'
    WHEN "trainingType" = 'Đào tạo liên tục ngoài Bệnh viện'
        THEN 'Sinh hoạt chuyên môn ngoài Bệnh viện'
    WHEN "trainingType" = 'Nghiên cứu khoa học - Sáng kiến'
        THEN 'Tham gia NCKH/ Hội đồng nghiệm thu NCKH'
    ELSE 'Khác'
END;
