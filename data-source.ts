import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv'; // Sử dụng dotenv để đọc file .env

config(); // Load biến môi trường từ file .env

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_DATABASE || 'product_management',
  // Quan trọng: Chỉ định đường dẫn đến entities và migrations
  entities: [__dirname + '/src/**/*.entity{.ts,.js}'], // Tìm tất cả file .entity.ts hoặc .entity.js trong src
  migrations: [__dirname + '/src/database/migrations/*{.ts,.js}'], // Nơi lưu trữ các file migration
  // logging: true, // Bật logging để xem câu lệnh SQL được thực thi (tùy chọn)
  // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, // Cấu hình SSL nếu cần
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource; // Export DataSource instance để CLI sử dụng
