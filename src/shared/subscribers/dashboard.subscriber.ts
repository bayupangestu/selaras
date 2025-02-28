import { Insight } from '../../entity/insight.entity';
import { UserDashboard } from '../../entity/user-dashboard.entity';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  Repository
} from 'typeorm';
import { AppDataSource } from '../typeorm/app-data-source';

@EventSubscriber()
@Injectable()
export class DashboardListenerService
  implements EntitySubscriberInterface<UserDashboard>
{
  listenTo() {
    return UserDashboard;
  }

  //   async beforeInsert(event: InsertEvent<UserDashboard>) {
  //     try {
  //       const dashboardData = event.entity;
  //       console.log(dashboardData);
  //     } catch (err) {}
  //   }
}
