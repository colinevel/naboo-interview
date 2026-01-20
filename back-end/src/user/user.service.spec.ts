import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserModule } from './user.module';
import { randomUUID } from 'crypto';
import { TestModule, closeInMongodConnection } from 'src/test/test.module';
import { ActivityService } from '../activity/activity.service';
import { ActivityModule } from 'src/activity/activity.module';

describe('UserService', () => {
  let userService: UserService;
  let activityService: ActivityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestModule, UserModule, ActivityModule],
    }).compile();

    userService = module.get<UserService>(UserService);
    activityService = module.get<ActivityService>(ActivityService);
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('basic create / get', async () => {
    const email = randomUUID() + '@test.com';
    const user = await userService.createUser({
      email,
      password: 'password',
      firstName: 'firstName',
      lastName: 'lastName',
    });

    const fetchedUser = await userService.getById(user.id);

    expect(fetchedUser).toMatchObject({
      email,
      firstName: 'firstName',
      lastName: 'lastName',
    });
  });

  it('toggle favorite activity with add activity to favorites', async () => {
    const user = await userService.createUser({
      email: randomUUID() + '@test.com',
      password: 'password',
      firstName: 'firstName',
      lastName: 'lastName',
    });

    const activity = await activityService.create(user.id, {
      name: 'activity',
      city: 'city',
      description: 'description',
      price: 100,
    });

    const updatedUser = await userService.toggleFavoriteActivity(
      user.id,
      activity.id,
    );

    expect(updatedUser.favoriteActivities).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: activity.id })]),
    );
  });

  it('toggle favorite activity with remove activity from favorites', async () => {
    const user = await userService.createUser({
      email: randomUUID() + '@test.com',
      password: 'password',
      firstName: 'firstName',
      lastName: 'lastName',
    });

    const activity = await activityService.create(user.id, {
      name: 'activity',
      city: 'city',
      description: 'description',
      price: 100,
    });

    await userService.toggleFavoriteActivity(user.id, activity.id);

    const updatedUser = await userService.toggleFavoriteActivity(
      user.id,
      activity.id,
    );

    expect(updatedUser.favoriteActivities).toEqual(expect.arrayContaining([]));
  });

  it('update favorite activities order', async () => {
    const user = await userService.createUser({
      email: randomUUID() + '@test.com',
      password: 'password',
      firstName: 'firstName',
      lastName: 'lastName',
    });

    const activity1 = await activityService.create(user.id, {
      name: 'activity1',
      city: 'city',
      description: 'description',
      price: 100,
    });
    const activity2 = await activityService.create(user.id, {
      name: 'activity2',
      city: 'city',
      description: 'description',
      price: 100,
    });
    const activity3 = await activityService.create(user.id, {
      name: 'activity3',
      city: 'city',
      description: 'description',
      price: 100,
    });

    await userService.toggleFavoriteActivity(user.id, activity1.id);
    await userService.toggleFavoriteActivity(user.id, activity2.id);
    await userService.toggleFavoriteActivity(user.id, activity3.id);

    const updatedUser = await userService.updateFavoriteActivitiesOrder(
      user.id,
      [activity3.id, activity2.id, activity1.id],
    );

    expect(updatedUser.favoriteActivities).toEqual([
      expect.objectContaining({ id: activity3.id }),
      expect.objectContaining({ id: activity2.id }),
      expect.objectContaining({ id: activity1.id }),
    ]);
  });
});
