export enum UserRole {
  Admin = 'admin',
  Manager = 'manager',
  Cashier = 'cashier',
}

export interface User {
  id: string;
  username: string;
  password?: string; // Optional for security when passing around
  name: string;
  role: UserRole;
  shopId?: string; // For manager/cashier to link to a specific shop
}
