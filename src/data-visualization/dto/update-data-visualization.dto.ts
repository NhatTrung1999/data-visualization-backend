import { PartialType } from '@nestjs/mapped-types';
import { CreateDataVisualizationDto } from './create-data-visualization.dto';

export class UpdateDataVisualizationDto extends PartialType(CreateDataVisualizationDto) {}
