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

  // async executeQuery(
  //   host: string,
  //   database: string,
  //   username: string,
  //   password: string,
  //   querysql: string,
  //   checkedColumns: string[] = [],
  //   aggregateFunction: string = '',
  //   topNCount?: number,
  //   clause?: string,
  //   page: number = 1,
  //   limit: number = 10
  // ) {
  //   try {
  //     if (!this.restrictToSelectQuery(querysql)) {
  //       throw new Error('Only SELECT queries are allowed.');
  //     }

  //     if (
  //       aggregateFunction.toUpperCase() === 'TOP_N' &&
  //       (!topNCount || topNCount < 1 || topNCount > 1000)
  //     ) {
  //       throw new Error('TOP N count must be a number between 1 and 1000.');
  //     }

  //     const pool = await connectDatabase({
  //       host,
  //       database,
  //       username,
  //       password,
  //       querysql,
  //     });

  //     const tempResult = await pool.request().query(querysql);
  //     const columns = tempResult.recordset.columns
  //       ? Object.keys(tempResult.recordset.columns)
  //       : [];

  //     if (['SUM', 'AVG'].includes(aggregateFunction.toUpperCase())) {
  //       const numericTypes = [
  //         'int',
  //         'bigint',
  //         'decimal',
  //         'numeric',
  //         'float',
  //         'real',
  //         'money',
  //         'smallmoney',
  //         'tinyint',
  //         'smallint',
  //       ];

  //       for (const col of checkedColumns) {
  //         const colMeta = tempResult.recordset.columns[col];
  //         if (!colMeta) {
  //           throw new Error(`Column "${col}" not found in result set.`);
  //         }
  //         const sqlType = (colMeta.type as any)?.name?.toLowerCase?.() || '';
  //         const isNumeric = numericTypes.some((t) => sqlType.includes(t));
  //         if (!isNumeric) {
  //           throw new Error(
  //             `Column "${col}" has type "${sqlType}" which is not valid for ${aggregateFunction}.`,
  //           );
  //         }
  //       }
  //     }

  //     let sqlQuery = querysql;
  //     if (checkedColumns.length > 0 && aggregateFunction) {
  //       if (aggregateFunction.toUpperCase() !== 'TOP_N') {
  //         const selectColumns =
  //           clause === 'GROUP BY'
  //             ? columns.map((col) =>
  //                 checkedColumns.includes(col)
  //                   ? `${aggregateFunction}(${col}) AS ${col}`
  //                   : col,
  //               )
  //             : checkedColumns.map(
  //                 (col) => `${aggregateFunction}(${col}) AS ${col}`,
  //               );
  //         const groupByColumns =
  //           clause === 'GROUP BY'
  //             ? columns.filter((col) => !checkedColumns.includes(col))
  //             : [];
  //         const selectClause = selectColumns.join(', ');
  //         const groupByClause =
  //           groupByColumns.length > 0
  //             ? ` GROUP BY ${groupByColumns.join(', ')}`
  //             : '';
  //         sqlQuery = `SELECT ${selectClause} FROM (${querysql}) AS baseQuery${groupByClause}`;
  //       } else {
  //         const selectClause = checkedColumns.join(', ');
  //         sqlQuery = `SELECT TOP ${topNCount} ${selectClause} FROM (${querysql}) AS baseQuery ORDER BY ${checkedColumns[0]} DESC`;
  //       }
  //     }

  //     const countQuery = `SELECT COUNT(*) AS total FROM (${querysql}) AS baseQuery`;
  //     const countResult = await pool.request().query(countQuery);
  //     const totalRecords = countResult.recordset[0].total;

  //     const offset = (page - 1) * limit;
  //     sqlQuery = `
  //       ${sqlQuery}
  //       ORDER BY ${checkedColumns[0] || columns[0] || '(SELECT NULL)'}
  //       OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
  //     `;

  //     console.log(sqlQuery);
  //     const result = await pool.request().query(sqlQuery);
  //     const resultColumns = result.recordset.columns
  //       ? Object.keys(result.recordset.columns)
  //       : columns.length > 0
  //         ? columns
  //         : [];

  //     await pool.close();

  //     return {
  //       columns: resultColumns,
  //       data: result.recordset,
  //       totalRecords,
  //       page,
  //       limit,
  //     };
  //   } catch (error) {
  //     throw new Error(`Error executing query: ${error.message}`);
  //   }
  // }

  async executeQuery(
    host: string,
    database: string,
    username: string,
    password: string,
    querysql: string,
    checkedColumns: string[] = [],
    aggregateFunction: string = '',
    topNCount?: number,
    clause?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    try {
      // console.log(host, database, username, password, querysql, checkedColumns, aggregateFunction, topNCount, clause, page, limit);
      if (!this.restrictToSelectQuery(querysql)) {
        throw new Error('Only SELECT queries are allowed.');
      }

      if (
        aggregateFunction.toUpperCase() === 'TOP_N' &&
        (!topNCount || topNCount < 1 || topNCount > 1000)
      ) {
        throw new Error('TOP N count must be between 1 and 1000.');
      }

      const pool = await connectDatabase({
        host,
        database,
        username,
        password,
        // querysql,
      });

      const tempResult = await pool.request().query(querysql);
      const columns = tempResult.recordset.columns
        ? Object.keys(tempResult.recordset.columns)
        : [];

      if (['SUM', 'AVG'].includes(aggregateFunction.toUpperCase())) {
        const numericTypes = [
          'int',
          'bigint',
          'decimal',
          'numeric',
          'float',
          'real',
          'money',
          'smallmoney',
          'tinyint',
          'smallint',
        ];
        for (const col of checkedColumns) {
          const colMeta = tempResult.recordset.columns[col];
          if (!colMeta)
            throw new Error(`Column "${col}" not found in result set.`);
          const sqlType = (colMeta.type as any)?.name?.toLowerCase?.() || '';
          if (!numericTypes.some((t) => sqlType.includes(t))) {
            throw new Error(
              `Column "${col}" has type "${sqlType}" which is not valid for ${aggregateFunction}.`,
            );
          }
        }
      }

      const offset = (page - 1) * limit;
      let sqlQuery = '';
      let countQuery = '';

      if (checkedColumns.length > 0 && aggregateFunction) {
        if (aggregateFunction.toUpperCase() === 'TOP_N') {
          const orderColumn =
            checkedColumns[0] || columns[0] || '(SELECT NULL)';
          // const cteQuery = `
          //   WITH TopOrders AS (
          //     SELECT TOP ${topNCount} *
          //     FROM (${querysql}) AS baseQuery
          //     ORDER BY [${orderColumn}] DESC
          //   )
          //   SELECT * FROM TopOrders
          // `;

          const cteQuery = `SELECT TOP ${topNCount} *
                            FROM (${querysql}) AS baseQuery
                            ORDER BY [${orderColumn}] DESC`;
          // console.log(cteQuery);


          sqlQuery = `
            SELECT * 
            FROM (${cteQuery}) as a
            ORDER BY [${orderColumn}] DESC
            OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
          `;

          countQuery = `SELECT COUNT(*) AS total FROM (${sqlQuery}) AS countBase`;

          // console.log(countQuery);
        } else {
          const selectColumns =
            clause === 'GROUP BY'
              ? columns.map((col) =>
                  checkedColumns.includes(col)
                    ? `${aggregateFunction}([${col}]) AS [${col}]`
                    : col,
                )
              : checkedColumns.map(
                  (col) => `${aggregateFunction}([${col}]) AS [${col}]`,
                );

          const groupByColumns =
            clause === 'GROUP BY'
              ? columns.filter((col) => !checkedColumns.includes(col))
              : [];

          const selectClause = selectColumns.join(', ');
          const groupByClause =
            groupByColumns.length > 0
              ? ` GROUP BY ${groupByColumns.join(', ')}`
              : '';

          sqlQuery = `SELECT ${selectClause} FROM (${querysql}) AS baseQuery${groupByClause}
                      ORDER BY [${checkedColumns[0] || columns[0] || '(SELECT NULL)'}]
                      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
          countQuery = `SELECT COUNT(*) AS total FROM (SELECT ${selectClause} FROM (${querysql}) AS baseQuery${groupByClause}) as totalCount`;
        }
      } else {
        sqlQuery = `
          ${querysql}
          ORDER BY [${checkedColumns[0] || columns[0] || '(SELECT NULL)'}]
          OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
        `;

        countQuery = `SELECT COUNT(*) AS total FROM (${querysql}) AS baseQuery`;
      }

      const countResult = await pool.request().query(countQuery);
      const totalRecords = countResult.recordset[0].total;

      const result = await pool.request().query(sqlQuery);
      const resultColumns = result.recordset.columns
        ? Object.keys(result.recordset.columns)
        : columns;

      await pool.close();

      return {
        columns: resultColumns,
        data: result.recordset,
        totalRecords,
        page,
        limit,
      };
    } catch (error) {
      throw new Error(`Error executing query: ${error.message}`);
    }
  }
}
