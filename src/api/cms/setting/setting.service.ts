import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Setting } from '@/entity/setting.entity';

@Injectable()
export class SettingService implements OnModuleInit {
  private settingsCache: Map<string, string> = new Map();

  constructor(
    @InjectRepository(Setting)
    private settingsRepository: Repository<Setting>
  ) {}

  async onModuleInit() {
    await this.loadSettings();
  }

  private async loadSettings() {
    const settings = await this.settingsRepository.find();
    settings.forEach((setting) => {
      this.settingsCache.set(setting.key, setting.value);
    });
  }

  getValue(key: string): string | undefined {
    return this.settingsCache.get(key);
  }

  async refreshSettings() {
    await this.loadSettings();
  }

  async create(body: any) {
    const checkKey = await this.settingsRepository.findOne({
      where: {
        key: body.key
      }
    });

    if (checkKey)
      throw new HttpException(
        `${body.key} Telah Terdaftar`,
        HttpStatus.BAD_REQUEST
      );
    const newSetting = new Setting();
    newSetting.key = body.key.toUpperCase();
    newSetting.value = body.value;
    await this.settingsRepository.save(newSetting);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Setting Baru Telah Tersimpan'
    };
  }

  async findAll(query: any) {
    query.page = query.page || 1;
    query.pageSize = query.pageSize || 10;
    const skip = (query.page - 1) * query.pageSize;

    const qb = this.settingsRepository.createQueryBuilder('setting');

    qb.skip(skip).take(query.pageSize);

    if (query.search) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('setting.key ILIKE :search', {
            search: `%${query.search}%`
          });
        })
      );
    }

    const [result, total] = await qb.getManyAndCount();
    return {
      statusCode: 200,
      data: result,
      total
    };
  }

  async findOne(id) {
    const setting = await this.settingsRepository.findOne({
      where: {
        id
      }
    });
    if (!setting) {
      throw new HttpException('Setting not found', 404);
    }
    return {
      statusCode: 200,
      data: setting
    };
  }

  async update(id, body) {
    const setting = await this.settingsRepository.findOne({
      where: {
        id
      }
    });
    if (!setting) {
      throw new HttpException('Setting not found', 404);
    }
    setting.value = body.value || setting.value;
    await this.settingsRepository.save(setting);
    return {
      statusCode: 200,
      message: 'Setting updated!'
    };
  }
}
