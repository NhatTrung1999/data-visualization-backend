import { Injectable } from '@nestjs/common';
import { connectDatabase } from 'src/configdb/connect';
import { CreateDataVisualizationDto } from './dto/create-data-visualization.dto';

@Injectable()
export class DataVisualizationService {
  private restrictToSelectQuery(query: string): boolean {
    const dangerousKeywords = [
      'DROP',
      'DELETE',
      'ALTER',
      'INSERT',
      'UPDATE',
      'TRUNCATE',
      'CREATE',
      'REPLACE',
      'EXEC',
      'EXECUTE',
    ];
    const queryUpper = query.toUpperCase().replace(/\s+/g, ' ').trim();

    if (!queryUpper.startsWith('SELECT')) {
      return false;
    }

    for (const keyword of dangerousKeywords) {
      if (
        queryUpper.includes(` ${keyword} `) ||
        queryUpper.includes(`${keyword} (`)
      ) {
        return false;
      }
    }

    return true;
  }

  async executeQuery(
    host: string,
    database: string,
    username: string,
    password: string,
    querysql: string,
    checkedColumns: string[] = [],
    aggregateFunction: string = '',
    topNCount?: number,
  ) {
    try {
      if (!this.restrictToSelectQuery(querysql)) {
        throw new Error('Only SELECT queries are allowed.');
      }

      if (
        aggregateFunction.toUpperCase() === 'TOP_N' &&
        (!topNCount || topNCount < 1 || topNCount > 1000)
      ) {
        throw new Error('TOP N count must be a number between 1 and 1000.');
      }

      const pool = await connectDatabase({
        host,
        database,
        username,
        password,
        querysql,
      });

      const tempResult = await pool.request().query(querysql);
      const columns = tempResult.recordset.columns
        ? Object.keys(tempResult.recordset.columns)
        : [];

      let sqlQuery = querysql;
      if (checkedColumns.length > 0 && aggregateFunction) {
        if (aggregateFunction.toUpperCase() !== 'TOP_N') {
          const selectColumns = columns.map((col) =>
            checkedColumns.includes(col) &&
            aggregateFunction.toUpperCase() !== 'TOP_N'
              ? `${aggregateFunction}(${col}) as ${col}`
              : col,
          );
          const groupByColumns = columns.filter(
            (col) => !checkedColumns.includes(col),
          );
          const selectClause = selectColumns.join(', ');
          const groupByClause =
            groupByColumns.length > 0
              ? ` GROUP BY ${groupByColumns.join(', ')}`
              : '';
          sqlQuery = `SELECT ${selectClause} FROM (${querysql}) as baseQuery${groupByClause}`;
        } else {
          const selectClause = checkedColumns.join(', ');
          sqlQuery = `SELECT TOP ${topNCount} ${selectClause} FROM (${querysql}) as baseQuery ORDER BY ${checkedColumns[0]} DESC`;
        }
      }

      console.log(sqlQuery);
      const result = await pool.request().query(sqlQuery);

      const resultColumns = result.recordset.columns
        ? Object.keys(result.recordset.columns)
        : columns.length > 0
          ? columns
          : [];

      await pool.close();

      return {
        columns: resultColumns,
        data: result.recordset,
      };
    } catch (error) {
      throw new Error(`Error executing query: ${error.message}`);
    }
  }
}
