// src/auth/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// Usage: @Roles('admin') or @Roles('admin', 'pharmacist')
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);