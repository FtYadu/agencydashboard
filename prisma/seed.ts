import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'demo-agency' },
    update: {},
    create: {
      name: 'Demo Agency',
      slug: 'demo-agency',
      website: 'https://demo-agency.com',
      description: 'A sample agency for demonstration purposes',
    },
  });

  console.log('✅ Organization created');

  // Create admin user
  const adminPassword = await hash('admin123456', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@demo-agency.com' },
    update: {},
    create: {
      email: 'admin@demo-agency.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      organizationId: organization.id,
    },
  });

  console.log('✅ Admin user created (email: admin@demo-agency.com, password: admin123456)');

  // Create team members
  const managerPassword = await hash('manager123456', 12);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@demo-agency.com' },
    update: {},
    create: {
      email: 'manager@demo-agency.com',
      name: 'Project Manager',
      password: managerPassword,
      role: 'MANAGER',
      status: 'ACTIVE',
      organizationId: organization.id,
    },
  });

  const memberPassword = await hash('member123456', 12);
  const teamMember = await prisma.user.upsert({
    where: { email: 'member@demo-agency.com' },
    update: {},
    create: {
      email: 'member@demo-agency.com',
      name: 'Team Member',
      password: memberPassword,
      role: 'TEAM_MEMBER',
      status: 'ACTIVE',
      organizationId: organization.id,
    },
  });

  console.log('✅ Team members created');

  // Create sample clients
  const clients = await Promise.all([
    prisma.client.upsert({
      where: { email: 'john@techcorp.com' },
      update: {},
      create: {
        name: 'John Smith',
        email: 'john@techcorp.com',
        phone: '+1 (555) 123-4567',
        company: 'TechCorp Inc.',
        website: 'https://techcorp.com',
        status: 'ACTIVE',
        organizationId: organization.id,
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
      },
    }),
    prisma.client.upsert({
      where: { email: 'sarah@designstudio.com' },
      update: {},
      create: {
        name: 'Sarah Johnson',
        email: 'sarah@designstudio.com',
        phone: '+1 (555) 987-6543',
        company: 'Design Studio',
        status: 'ACTIVE',
        organizationId: organization.id,
        city: 'New York',
        state: 'NY',
        country: 'USA',
      },
    }),
    prisma.client.upsert({
      where: { email: 'mike@startup.io' },
      update: {},
      create: {
        name: 'Mike Chen',
        email: 'mike@startup.io',
        phone: '+1 (555) 456-7890',
        company: 'Startup.io',
        status: 'PROSPECT',
        organizationId: organization.id,
        city: 'Austin',
        state: 'TX',
        country: 'USA',
      },
    }),
  ]);

  console.log('✅ Sample clients created');

  // Create sample projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete redesign of the corporate website',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      budget: 50000,
      hourlyRate: 150,
      startDate: new Date('2024-01-15'),
      deadline: new Date('2024-04-15'),
      organizationId: organization.id,
      clientId: clients[0].id,
      createdById: adminUser.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App Development',
      description: 'iOS and Android mobile application',
      status: 'PLANNING',
      priority: 'URGENT',
      budget: 120000,
      hourlyRate: 175,
      startDate: new Date('2024-02-01'),
      deadline: new Date('2024-08-01'),
      organizationId: organization.id,
      clientId: clients[1].id,
      createdById: adminUser.id,
    },
  });

  console.log('✅ Sample projects created');

  // Create sample tasks
  await Promise.all([
    prisma.task.create({
      data: {
        title: 'Design homepage mockups',
        description: 'Create initial design concepts for the homepage',
        status: 'COMPLETED',
        priority: 'HIGH',
        projectId: project1.id,
        assignedToId: teamMember.id,
        createdById: manager.id,
        estimatedHours: 16,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Develop responsive navigation',
        description: 'Implement mobile-friendly navigation menu',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        projectId: project1.id,
        assignedToId: teamMember.id,
        createdById: manager.id,
        estimatedHours: 12,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Set up development environment',
        description: 'Configure React Native development environment',
        status: 'TODO',
        priority: 'HIGH',
        projectId: project2.id,
        assignedToId: teamMember.id,
        createdById: manager.id,
        estimatedHours: 8,
      },
    }),
  ]);

  console.log('✅ Sample tasks created');

  // Create sample time entries
  await Promise.all([
    prisma.timeEntry.create({
      data: {
        description: 'Homepage design work',
        hours: 8,
        date: new Date('2024-01-20'),
        billable: true,
        userId: teamMember.id,
        projectId: project1.id,
      },
    }),
    prisma.timeEntry.create({
      data: {
        description: 'Navigation development',
        hours: 6,
        date: new Date('2024-01-21'),
        billable: true,
        userId: teamMember.id,
        projectId: project1.id,
      },
    }),
  ]);

  console.log('✅ Sample time entries created');

  // Create sample invoice
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-001',
      status: 'SENT',
      issueDate: new Date('2024-01-25'),
      dueDate: new Date('2024-02-25'),
      subtotal: 5250,
      tax: 525,
      total: 5775,
      organizationId: organization.id,
      clientId: clients[0].id,
      items: {
        create: [
          {
            description: 'Design Services',
            quantity: 20,
            rate: 150,
            amount: 3000,
          },
          {
            description: 'Development Services',
            quantity: 15,
            rate: 150,
            amount: 2250,
          },
        ],
      },
    },
  });

  console.log('✅ Sample invoice created');

  // Create sample expenses
  await Promise.all([
    prisma.expense.create({
      data: {
        description: 'Adobe Creative Cloud Subscription',
        amount: 79.99,
        category: 'SOFTWARE',
        date: new Date('2024-01-01'),
        billable: false,
        organizationId: organization.id,
      },
    }),
    prisma.expense.create({
      data: {
        description: 'Stock photography license',
        amount: 199,
        category: 'MARKETING',
        date: new Date('2024-01-15'),
        billable: true,
        organizationId: organization.id,
      },
    }),
  ]);

  console.log('✅ Sample expenses created');

  console.log('\n🎉 Seeding completed successfully!\n');
  console.log('Login credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:   admin@demo-agency.com / admin123456');
  console.log('Manager: manager@demo-agency.com / manager123456');
  console.log('Member:  member@demo-agency.com / member123456');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
