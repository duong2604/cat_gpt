import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Đánh dấu endpoint không cần đăng nhập (mặc định mọi endpoint đều yêu cầu đăng nhập). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
