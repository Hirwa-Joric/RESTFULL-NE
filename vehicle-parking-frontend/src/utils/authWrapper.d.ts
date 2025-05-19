// TypeScript declaration file for authWrapper.js
export const User: Record<string, any>;

export function getStoredUser(): any | null;
export function getStoredToken(): string | null;
export function storeUserData(user: any, token: string): void;
export function clearUserData(): void;
export function isAuthenticated(): boolean;
export function hasRole(requiredRole: string | string[]): boolean;
export function logoutUser(): void;
export function getFullName(user: any): string; 