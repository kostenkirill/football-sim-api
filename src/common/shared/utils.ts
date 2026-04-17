import { nanoid } from 'nanoid';

export const generateId = (prefix: string): string => `${prefix}-${nanoid(8)}`;
