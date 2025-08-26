import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataVisualizationModule } from './data-visualization/data-visualization.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'frontend', 'dist'),
    }),
    DataVisualizationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
