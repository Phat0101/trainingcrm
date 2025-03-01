-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthDate" TEXT,
    "gender" TEXT,
    "position" TEXT,
    "specialization" TEXT,
    "department" TEXT,
    "joinDate" TEXT,
    "licenseNumber" TEXT,
    "licenseIssueDate" TEXT,
    "licenseIssuer" TEXT,
    "licensePracticeScope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingRecord" (
    "id" TEXT NOT NULL,
    "trainingIndex" INTEGER NOT NULL,
    "trainingType" TEXT NOT NULL,
    "content" TEXT,
    "organizer" TEXT,
    "totalHour" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EmployeeTraining" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EmployeeTraining_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrainingType_name_key" ON "TrainingType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingRecord_trainingIndex_key" ON "TrainingRecord"("trainingIndex");

-- CreateIndex
CREATE INDEX "_EmployeeTraining_B_index" ON "_EmployeeTraining"("B");

-- AddForeignKey
ALTER TABLE "_EmployeeTraining" ADD CONSTRAINT "_EmployeeTraining_A_fkey" FOREIGN KEY ("A") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeTraining" ADD CONSTRAINT "_EmployeeTraining_B_fkey" FOREIGN KEY ("B") REFERENCES "TrainingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
