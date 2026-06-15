import { adapter } from '@/adapters';
import { RESOURCE_KEYS } from '@/adapters/resourceKeys';
import { UserSchema } from '@/schemas/user.schema';
import { User } from '@/models/User';
import { generateId } from '@/lib/utils/generateId';

export const userRepository = {
  getAll: (): Promise<User[]> => adapter.getAll<User>(RESOURCE_KEYS.USERS),

  getById: (id: string): Promise<User | null> =>
    adapter.getById<User>(RESOURCE_KEYS.USERS, id),

  create: (data: Omit<User, 'id'>): Promise<User> => {
    const user = UserSchema.parse({ ...data, id: generateId() });
    return adapter.create(RESOURCE_KEYS.USERS, user);
  },

  update: (data: User): Promise<User> => {
    const user = UserSchema.parse(data);
    return adapter.update(RESOURCE_KEYS.USERS, user);
  },

  delete: (id: string): Promise<void> =>
    adapter.delete(RESOURCE_KEYS.USERS, id),
};
