import { Body, Controller, Post } from '@nestjs/common';
import { DataVisualizationService } from './data-visualization.service';
import { CreateDataVisualizationDto } from './dto/create-data-visualization.dto';
import { connectDatabase } from 'src/configdb/connect';

@Controller('data-visualization')
export class DataVisualizationController {
  constructor(
    private readonly dataVisualizationService: DataVisualizationService,
  ) {}

  @Post()
  async executeQuery(@Body() query: CreateDataVisualizationDto) {
    try {
      const pool = await connectDatabase(query);
      const result = await pool.request().query(query.querysql);
      const columnNames = Object.keys(result.recordset.columns);
      const columnCount = columnNames.length;
      await pool.close();

      return {
        data: result.recordset,
        columns: columnNames,
        columnCount: columnCount,
      };
    } catch (error: any) {
      console.log(error.message);
    }
  }
}
