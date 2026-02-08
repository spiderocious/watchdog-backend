import { UserModel, UserDocument } from '@models/user.model';

class UserRepository {
  private static instance: UserRepository;

  private constructor() {}

  public static getInstance(): UserRepository {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository();
    }
    return UserRepository.instance;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email }).lean();
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email }).select('+password').lean();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return UserModel.findOne({ id }).lean();
  }

  async create(data: {
    id: string;
    email: string;
    full_name: string;
    password: string;
  }): Promise<UserDocument> {
    const user = await UserModel.create(data);
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword as UserDocument;
  }
}

export const userRepository = UserRepository.getInstance();
