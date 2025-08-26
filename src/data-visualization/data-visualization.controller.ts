import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { DataVisualizationService } from './data-visualization.service';
import { CreateDataVisualizationDto } from './dto/create-data-visualization.dto';
import { connectDatabase } from 'src/configdb/connect';

@Controller('data-visualization')
export class DataVisualizationController {
  constructor(
    private readonly dataVisualizationService: DataVisualizationService,
  ) {}

  @Post('get-columns')
  async getColumns(@Body() query: CreateDataVisualizationDto) {
    try {
      console.log(query);
      const result = await this.dataVisualizationService.executeQuery(
        query.host,
        query.database,
        query.username,
        query.password,
        query.querysql,
      );
      return {
        columns: result.columns,
        columnCount: result.columns.length,
      };
    } catch (error: any) {
      console.error(error.message);
      throw new HttpException(
        `${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('execute-query')
  async executeQuery(@Body() query: CreateDataVisualizationDto) {
    try {
      const result = await this.dataVisualizationService.executeQuery(
        query.host,
        query.database,
        query.username,
        query.password,
        query.querysql,
        query.checkedColumns || [],
        query.aggregateFunction || '',
        query.topNCount,
        query.clause,
        query.page || 1,
        query.limit || 10,
      );
      return {
        columns: result.columns,
        data: result.data,
        totalRecords: result.totalRecords,
        page: result.page,
        limit: result.limit,
      };
    } catch (error: any) {
      console.error(error.message);
      throw new HttpException(
        `${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // @Post('get-query')
  // async getQuery(@Body() query: CreateDataVisualizationDto) {
  //   return this.dataVisualizationService.getQuery(
  //     query.host,
  //     query.database,
  //     query.username,
  //     query.password,
  //     query.querysql,
  //   );
  // }
}
