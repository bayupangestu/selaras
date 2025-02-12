import { DashboardAttributeVisibility } from '@/entity/dashboard-attribute-visibility.entity';
import { UserDashboard } from '@/entity/user-dashboard.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getMetadataArgsStorage } from 'typeorm';

@Injectable()
export class DashboardAttributeService {
  constructor(
    @InjectRepository(UserDashboard)
    private readonly userDashboardRepository: Repository<UserDashboard>
  ) {}

  getEntityColumns(entity: any): string[] {
    const metadataArgsStorage = getMetadataArgsStorage();

    // Ambil semua kolom dari entitas yang diberikan
    const columns = metadataArgsStorage.columns
      .filter((column) => column.target === entity)
      .filter(
        (column) =>
          !['created_at', 'updated_at', 'deleted_at', 'id'].includes(
            column.propertyName
          )
      )
      .map((column) => column.options.name || column.propertyName);

    // Ambil semua hubungan (relasi) dari entitas tersebut
    const relations = metadataArgsStorage.relations
      .filter((relation) => relation.target === entity)
      .map((relation) => relation.propertyName);

    // Ambil semua kolom foreign key dari relasi
    const foreignKeyColumns = metadataArgsStorage.relations
      .filter((relation) => relation.target === entity)
      .flatMap((relation) => {
        const relationMetadata = metadataArgsStorage.relations.find(
          (rel) =>
            rel.target === entity && rel.propertyName === relation.propertyName
        );
        if (!relationMetadata) return [];
        return [];
      });

    // Gabungkan kolom dan hubungan, lalu hapus duplikat
    const allColumns = [...columns, ...relations];

    // Filter out kolom foreign key dan kolom yang sudah ada di kolom asli
    const filteredColumns = allColumns.filter((column) => {
      return !foreignKeyColumns.includes(column) && !relations.includes(column);
    });

    return Array.from(new Set(filteredColumns));
  }

  async getAttribute() {
    const columns = this.getEntityColumns(UserDashboard);
    return {
      statusCode: 200,
      data: columns
    };
  }
}
