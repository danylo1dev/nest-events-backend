import { Expose } from 'class-transformer';
import { SelectQueryBuilder } from 'typeorm';

export interface PaginateOptions {
  limit: number;
  currentPage: number;
  total?: boolean;
}
@Expose()
export class PaginatonResult<T> {
  constructor(partial: Partial<PaginatonResult<T>>) {
    Object.assign(this, partial);
  }
  first: number;
  last: number;
  limit: number;
  total?: number;
  data: T[];
}

export async function paginate<T>(
  qb: SelectQueryBuilder<T>,
  options: PaginateOptions = {
    limit: 10,
    currentPage: 1,
  },
): Promise<PaginatonResult<T>> {
  const offset = (options.currentPage - 1) * options.limit;
  const data = await qb.limit(options.limit).offset(offset).getMany();
  return new PaginatonResult({
    first: offset + 1,
    last: offset + data.length,
    limit: +options.limit,
    total: +options.total ? await qb.getCount() : null,
    data,
  });
}
