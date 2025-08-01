import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataVisualizationModule } from './data-visualization/data-visualization.module';

@Module({
  imports: [DataVisualizationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
