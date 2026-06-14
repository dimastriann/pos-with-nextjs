import { z } from 'zod';
import { UserRole } from '@/models/User';

export const UserSchema = z.object({
  id: z.string().min(1),
  username: z.string().min(2, 'Username must be at least 2 characters'),
  password: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  role: z.nativeEnum(UserRole),
  shopId: z.string().optional(),
});

export type UserInput = z.infer<typeof UserSchema>;
