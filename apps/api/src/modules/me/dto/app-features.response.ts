import { ApiProperty } from '@nestjs/swagger';
import type { AppFeaturesDto } from '@cat-gpt/shared';

export class AppFeaturesResponse implements AppFeaturesDto {
  @ApiProperty() chatEnabled: boolean;
}
