import {
  IsString,
  IsArray,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Permission } from '../enums/permission.enum';

export class CreateStoreDto {
  @IsString()
  businessName: string;

  @IsEnum(['SERVICE_BASED', 'PRODUCT_BASED'])
  businessType: 'SERVICE_BASED' | 'PRODUCT_BASED';

  @IsString()
  phoneNumber: string;

  @IsString()
  businessEmail: string;

  @IsString()
  location: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;
}

export class StoreDto {
  id: string;
  businessName: string;
  businessType: 'SERVICE_BASED' | 'PRODUCT_BASED';
  phoneNumber: string;
  businessEmail: string;
  location: string;
  logoUrl?: string;
  isVerified: boolean;
  createdAt: string;
}

export class UpdateStoreVerificationDto {
  @IsBoolean()
  isVerified: boolean;
}

export class CreateStoreRoleDto {
  @IsString()
  title: string;

  @IsArray()
  @IsEnum(Permission, { each: true })
  permissions: Permission[];
}

export class StoreRoleDto {
  id: string;
  storeId: string;
  title: string;
  permissions: Permission[];
}

export class AddUserToStoreDto {
  @IsString()
  userId: string;

  @IsString()
  @IsOptional()
  roleId?: string;
}

export class StoreMemberDto {
  id: string;
  storeId: string;
  userId: string;
  roleId?: string;
  role?: StoreRoleDto;
}
