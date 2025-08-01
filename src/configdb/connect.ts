import * as sql from 'mssql';

export async function connectDatabase(configs: {
  host: string;
  database: string;
  username: string;
  password: string;
  querysql: string;
}) {
  const config: sql.config = {
    server: configs.host,
    database: configs.database,
    user: configs.username,
    password: configs.password,
    options: {
      encrypt: false,
      enableArithAbort: true,
      trustServerCertificate: true,
    },
  };

  try {
    const pool = await sql.connect(config);
    console.log('Successfully connected to the database');
    return pool;
  } catch (error: any) {
    throw new Error(`Lỗi khi kết nối SQL Server: ${error.message}`);
  }
}
