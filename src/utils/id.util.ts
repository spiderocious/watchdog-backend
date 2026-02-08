import { randomBytes } from 'crypto';

export const generateId = (length: number = 8, prefix: string = ''): string => {
  const random = randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);

  return prefix ? `${prefix}_${random}` : random;
};
