import { DataSource } from 'typeorm';
import { InsightListenerService } from '../subscribers/insight.subscriber';
import { UserDashboard } from '../../entity/user-dashboard.entity';
import { config } from 'dotenv';
import { AccountInsights } from '../../entity/account.entity';
import { AdAccount } from '../../entity/ad-account.entity';
import { AdCreative } from '../../entity/ad-creative.entity';
import { AdSet } from '../../entity/ad-set.entity';
import { Ad } from '../../entity/ad.entity';
import { AssignedUser } from '../../entity/assigned-user.entity';
import { AudienceNetworkAnalytics } from '../../entity/audience-network-analytics.entity';
import { CampaignType } from '../../entity/campaign-type.entity';
import { Campaign } from '../../entity/campaign.entity';
import { CustomAudience } from '../../entity/custom-audience.entity';
import { DashboardAttributeVisibility } from '../../entity/dashboard-attribute-visibility.entity';
import { Insight } from '../../entity/insight.entity';
import { LeadgenForm } from '../../entity/leadgen-form.entity';
import { Page } from '../../entity/page.entity';
import { Platform } from '../../entity/platform.entity';
import { Role } from '../../entity/role.entity';
import { Setting } from '../../entity/setting.entity';
import { UserAd } from '../../entity/user-ad.entity';
import { UserAdsets } from '../../entity/user-adset.entity';
import { UserCampaign } from '../../entity/user-campaign.entity';
import { UserProject } from '../../entity/user-project.entity';
import { User } from '../../entity/user.entity';
import { InsightBreakdown } from '../../entity/insight-breakdown.entity';
import { DashboardListenerService } from '../subscribers/dashboard.subscriber';
config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  // entities: [__dirname + '/entity/*.js'], // Gunakan __dirname untuk memastikan path benar
  migrations: ['dist/migrations/*.{js,ts}'],
  entities: [
    AccountInsights,
    AdAccount,
    AdCreative,
    AdSet,
    Ad,
    AssignedUser,
    AudienceNetworkAnalytics,
    CampaignType,
    Campaign,
    CustomAudience,
    DashboardAttributeVisibility,
    Insight,
    LeadgenForm,
    Page,
    Platform,
    Role,
    Setting,
    UserAd,
    UserAdsets,
    UserCampaign,
    UserDashboard,
    UserProject,
    User,
    InsightBreakdown
  ],
  subscribers: [InsightListenerService, DashboardListenerService],
  synchronize: true,
  logging: false
});
