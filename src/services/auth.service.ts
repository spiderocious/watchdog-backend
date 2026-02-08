import bcrypt from 'bcrypt';
import { userRepository } from '@repositories/user.repository';
import { JwtUtil } from '@utils/jwt.util';
import { generateId } from '@utils/id.util';
import { logger } from '@utils/logger.util';
import { ServiceResult, ServiceSuccess, ServiceError, CreateUserDTO, AuthResponse, User } from '@shared/types';
import { MESSAGE_KEYS } from '@shared/constants';

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async register(data: CreateUserDTO): Promise<ServiceResult<AuthResponse>> {
    try {
      const existing = await userRepository.findByEmail(data.email);
      if (existing) {
        return new ServiceError('Email already taken', MESSAGE_KEYS.EMAIL_TAKEN);
      }

      const hashedPassword = await bcrypt.hash(data.password, 12);
      const userId = generateId(8, 'usr');

      const user = await userRepository.create({
        id: userId,
        email: data.email,
        full_name: data.full_name,
        password: hashedPassword,
      });

      const accessToken = JwtUtil.generateToken({ userId: user.id });
      const refreshToken = generateId(16, 'rt');

      return new ServiceSuccess(
        {
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            created_at: user.created_at,
            updated_at: user.updated_at,
          },
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: 86400,
        },
        MESSAGE_KEYS.REGISTER_SUCCESS
      );
    } catch (error: any) {
      logger.error('Register error', error);
      return new ServiceError(error.message, MESSAGE_KEYS.INTERNAL_SERVER_ERROR);
    }
  }

  async login(email: string, password: string): Promise<ServiceResult<AuthResponse>> {
    try {
      const user = await userRepository.findByEmailWithPassword(email);
      if (!user || !user.password) {
        return new ServiceError('Invalid credentials', MESSAGE_KEYS.INVALID_CREDENTIALS);
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return new ServiceError('Invalid credentials', MESSAGE_KEYS.INVALID_CREDENTIALS);
      }

      const accessToken = JwtUtil.generateToken({ userId: user.id });
      const refreshToken = generateId(16, 'rt');

      return new ServiceSuccess(
        {
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            created_at: user.created_at,
            updated_at: user.updated_at,
          },
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: 86400,
        },
        MESSAGE_KEYS.LOGIN_SUCCESS
      );
    } catch (error: any) {
      logger.error('Login error', error);
      return new ServiceError(error.message, MESSAGE_KEYS.INTERNAL_SERVER_ERROR);
    }
  }

  async getMe(userId: string): Promise<ServiceResult<Omit<User, 'password'>>> {
    try {
      const user = await userRepository.findById(userId);
      if (!user) {
        return new ServiceError('User not found', MESSAGE_KEYS.USER_NOT_FOUND);
      }

      return new ServiceSuccess(
        {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
        MESSAGE_KEYS.USER_FETCHED
      );
    } catch (error: any) {
      logger.error('Get me error', error);
      return new ServiceError(error.message, MESSAGE_KEYS.INTERNAL_SERVER_ERROR);
    }
  }
}

export const authService = AuthService.getInstance();
