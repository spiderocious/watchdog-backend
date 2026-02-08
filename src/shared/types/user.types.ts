export interface User {
  id: string;
  email: string;
  full_name: string;
  password?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  full_name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface JwtPayload {
  userId: string;
}
