import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../constants/auth.constants.js';

/** Skips authentication. Every route is protected unless marked `@Public()`. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
