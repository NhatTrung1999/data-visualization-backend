import { Module } from '@nestjs/common';
import { DataVisualizationService } from './data-visualization.service';
import { DataVisualizationController } from './data-visualization.controller';

@Module({
  controllers: [DataVisualizationController],
  providers: [DataVisualizationService],
})
export class DataVisualizationModule {}
