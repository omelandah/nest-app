import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create multiple teachers
  await prisma.teacher.createMany({
    data: [
      { email: 'teacher1@example.com' },
      { email: 'teacher2@example.com' },
    ],
    skipDuplicates: true, // prevents errors if run multiple times
  });

  // Create multiple students
  await prisma.student.createMany({
    data: [
      { email: 'studentjon@example.com' },
      { email: 'studenthon@example.com' },
      { email: 'student3@example.com' },
      { email: 'student4@example.com' },
      { email: 'student5@example.com' },
      { email: 'student6@example.com' },
    ],
    skipDuplicates: true,
  });

  // Fetch inserted data to link them
  const teacher1 = await prisma.teacher.findUnique({
    where: { email: 'teacher1@example.com' },
  });

  const student1 = await prisma.student.findUnique({
    where: { email: 'studentjon@example.com' },
  });

  if (teacher1 && student1) {
    await prisma.studentTeacher.create({
      data: {
        teacherId: teacher1.id,
        studentId: student1.id,
      },
    });
  }
}

main()
  .then(() => console.log('Seeding complete!'))
  .catch((e) => console.error('Error seeding data:', e))
  .finally(() => prisma.$disconnect());
