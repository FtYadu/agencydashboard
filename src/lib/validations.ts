import { z } from 'zod';

// ========================================
// AUTH SCHEMAS
// ========================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// ========================================
// USER SCHEMAS
// ========================================

export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'MANAGER', 'TEAM_MEMBER', 'CLIENT']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  organizationId: z.string().optional(),
});

// ========================================
// CLIENT SCHEMAS
// ========================================

export const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PROSPECT']).optional(),
  notes: z.string().optional(),
});

export const clientContactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  position: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

// ========================================
// PROJECT SCHEMAS
// ========================================

export const projectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  status: z
    .enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'])
    .optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  clientId: z.string().min(1, 'Client is required'),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  deadline: z.coerce.date().optional(),
  budget: z.coerce.number().min(0).optional(),
  hourlyRate: z.coerce.number().min(0).optional(),
});

export const milestoneSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  dueDate: z.coerce.date(),
  projectId: z.string(),
});

// ========================================
// TASK SCHEMAS
// ========================================

export const taskSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  status: z
    .enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'CANCELLED'])
    .optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  projectId: z.string().min(1, 'Project is required'),
  assignedToId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  estimatedHours: z.coerce.number().min(0).optional(),
});

// ========================================
// TIME ENTRY SCHEMAS
// ========================================

export const timeEntrySchema = z.object({
  description: z.string().optional(),
  hours: z.coerce.number().min(0.1, 'Hours must be at least 0.1'),
  date: z.coerce.date(),
  billable: z.boolean().optional(),
  projectId: z.string().min(1, 'Project is required'),
  taskId: z.string().optional(),
});

// ========================================
// INVOICE SCHEMAS
// ========================================

export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  rate: z.coerce.number().min(0, 'Rate must be at least 0'),
});

export const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  issueDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  tax: z.coerce.number().min(0).optional(),
  discount: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

// ========================================
// EXPENSE SCHEMAS
// ========================================

export const expenseSchema = z.object({
  description: z.string().min(2, 'Description must be at least 2 characters'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  category: z.enum([
    'TRAVEL',
    'EQUIPMENT',
    'SOFTWARE',
    'MARKETING',
    'OFFICE',
    'OTHER',
  ]),
  date: z.coerce.date(),
  receipt: z.string().optional(),
  notes: z.string().optional(),
  billable: z.boolean().optional(),
});

// ========================================
// COMMENT SCHEMAS
// ========================================

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
  taskId: z.string(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type ClientContactInput = z.infer<typeof clientContactSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type MilestoneInput = z.infer<typeof milestoneSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type TimeEntryInput = z.infer<typeof timeEntrySchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
