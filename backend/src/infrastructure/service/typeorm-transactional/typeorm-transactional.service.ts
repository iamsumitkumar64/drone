import { DataSource, DataSourceOptions } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';

export const createTransactionalDataSourceService = async (
    options: DataSourceOptions,
) => {
    const dataSource = new DataSource(options);
    await dataSource.initialize();

    return addTransactionalDataSource({
        dataSource,
    });
};