
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectConnection()
    private readonly mongoConnection: Connection,
  ) {}

  async check() {
    await this.dataSource.query('SELECT 1');

    const mongoDb = this.mongoConnection.db;

    if (!mongoDb) {
      throw new Error('MongoDB no disponible');
    }

    await mongoDb.admin().ping();

    return {
      postgres: 'ok',
      mongo: 'ok',
    };
  }
}
