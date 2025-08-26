import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDataVisualizationDto {
  host: string;
  database: string;
  username: string;
  password: string;
  querysql: string;
  checkedColumns?: string[];
  checkedClauseColumns?: string[];
  aggregateFunction?: string;
  topNCount?: number;
  clause?: string;
  page?: number;
  limit?: number;
}
