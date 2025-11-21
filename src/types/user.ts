// src/types/user.ts
export interface AppUser {
    id: string;
    email: string | null;
    user_metadata: {
      [key: string]: any;
    };
  }