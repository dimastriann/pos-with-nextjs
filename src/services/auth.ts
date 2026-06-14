import { User } from '@/models/User';
import { storageService, STORAGE_KEYS } from './storage';

export class AuthService {
  static login(username: string, password?: string): User | null {
    const users = storageService.getAll<User>(STORAGE_KEYS.USERS);
    const user = users.find((u) => u.username === username);

    // Simple password check (in a real app, hash this!)
    if (user && user.password === password) {
      const { password, ...userWithoutPassword } = user;
      storageService.setItem(STORAGE_KEYS.CURRENT_USER, userWithoutPassword);
      return userWithoutPassword as User;
    }
    return null;
  }

  static logout() {
    storageService.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  static getCurrentUser(): User | null {
    return storageService.getItem<User>(STORAGE_KEYS.CURRENT_USER);
  }

  static isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }
}
