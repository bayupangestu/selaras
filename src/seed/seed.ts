import { AppDataSource } from '../shared/typeorm/app-data-source';
import { Platform } from '../entity/platform.entity';
import { Role } from '../entity/role.entity';
import { Setting } from '../entity/setting.entity';
import { User } from '../entity/user.entity';
import { CampaignType } from '../entity/campaign-type.entity';
import { bcryptHasPassword } from '../shared/helper/bcrypt';

async function seed() {
  try {
    // Inisialisasi DataSource
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');
    console.log(
      'Entities:',
      AppDataSource.entityMetadatas.map((e) => e.name)
    );

    const platformRepository = AppDataSource.getRepository(Platform);
    const roleRepository = AppDataSource.getRepository(Role);
    const settingRepository = AppDataSource.getRepository(Setting);
    const userRepository = AppDataSource.getRepository(User);
    const campaignTypeRepository = AppDataSource.getRepository(CampaignType);

    // Seed Platform Data
    const platforms = [{ name: 'meta' }, { name: 'google' }];
    for (const platformData of platforms) {
      const existingPlatform = await platformRepository.findOneBy({
        name: platformData.name
      });
      if (!existingPlatform) {
        const newPlatform = platformRepository.create(platformData);
        await platformRepository.save(newPlatform);
        console.log(`Platform seeded: ${platformData.name}`);
      }
    }

    // Seed Role Data
    const roles = [{ name: 'admin' }, { name: 'user' }];
    for (const roleData of roles) {
      const existingRole = await roleRepository.findOneBy({
        name: roleData.name
      });
      if (!existingRole) {
        const newRole = roleRepository.create(roleData);
        await roleRepository.save(newRole);
        console.log(`Role seeded: ${roleData.name}`);
      }
    }

    // Seed Setting Data
    const settings = [
      { key: 'META_APP_SECRET', value: process.env.META_APP_SECRET },
      { key: 'ACCESS_TOKEN', value: process.env.ACCESS_TOKEN },
      { key: 'META_BASE_URL', value: process.env.META_BASE_URL },
      { key: 'META_APP_ID', value: process.env.META_APP_ID }
    ];
    for (const settingData of settings) {
      const existingSetting = await settingRepository.findOneBy({
        key: settingData.key
      });
      if (!existingSetting) {
        const newSetting = settingRepository.create(settingData);
        await settingRepository.save(newSetting);
        console.log(`Setting seeded: ${settingData.key}`);
      }
    }

    // Seed Admin User
    const adminRole = await roleRepository.findOneBy({ name: 'admin' });
    if (!adminRole) {
      throw new Error('Admin role not found!');
    }

    const adminUser = await userRepository.findOneBy({
      email: 'admin@mail.com'
    });
    if (!adminUser) {
      const newUser = userRepository.create({
        email: 'admin@mail.com',
        password: bcryptHasPassword('admin123!'),
        name: 'Admin User',
        role_id: adminRole,
        last_login_at: null,
        access_token: null,
        start_at: new Date(),
        end_at: null
      });
      await userRepository.save(newUser);
      console.log('Admin user seeded successfully');
    }

    // Seed Campaign Type
    const campaignTypes = [
      { name: 'cpv' },
      { name: 'cpl' },
      { name: 'cpe' },
      { name: 'cpc' },
      { name: 'cpm' }
    ];
    for (const campaignTypeData of campaignTypes) {
      const existingCampaignType = await campaignTypeRepository.findOne({
        where: {
          name: campaignTypeData.name
        }
      });
      if (!existingCampaignType) {
        const newCampaignType = campaignTypeRepository.create(campaignTypeData);
        await campaignTypeRepository.save(newCampaignType);
        console.log(`Campaign Type seeded: ${campaignTypeData.name}`);
      }
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

seed();
