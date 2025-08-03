import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDataVisualizationDto {
  host: string;
  database: string;
  username: string;
  password: string;
  querysql: string;
  checkedColumns?: string[];
  aggregateFunction?: string;
  topNCount?: number;
}
