import { SetMetadata } from '@nestjs/common';
import { UserRoleEnum } from '../../../domain/user/enum/user-role/user-role.enum.js';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRoleEnum[]) => SetMetadata(ROLES_KEY, roles);