import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SignUpInput } from 'src/auth/types';
import { User } from './user.schema';
import { Activity } from '../activity/activity.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Activity.name)
    private activityModel: Model<Activity>,
  ) {}

  async getByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email: email }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email: email }).exec();
  }

  async getById(id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .populate('favoriteActivities')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async createUser(
    data: SignUpInput & {
      role?: User['role'];
    },
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = new this.userModel({ ...data, password: hashedPassword });
    return user.save();
  }

  async updateToken(id: string, token: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.token = token;
    return user.save();
  }

  async countDocuments(): Promise<number> {
    return this.userModel.countDocuments().exec();
  }

  async setDebugMode({
    userId,
    enabled,
  }: {
    userId: string;
    enabled: boolean;
  }): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        debugModeEnabled: enabled,
      },
      { new: true },
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private async addFavoriteActivity(
    userId: string,
    activityId: string,
  ): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const activity = await this.activityModel.findById(activityId).exec();
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    const userFavoriteIds =
      user.favoriteActivities?.map((fav) => fav.toString()) || [];

    // Check if activityId is already in favorites
    if (userFavoriteIds.includes(activityId)) {
      return;
    }

    user.favoriteActivities = [
      ...(user.favoriteActivities || []),
      activityId as any,
    ];

    await user.save();
  }

  private async removeFavoriteActivity(
    userId: string,
    activityId: string,
  ): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.favoriteActivities =
      user.favoriteActivities?.filter((fav) => fav.toString() !== activityId) ||
      [];
    await user.save();
  }

  async toggleFavoriteActivity(
    userId: string,
    activityId: string,
  ): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isFavorited = user.favoriteActivities?.some(
      (fav) => fav.toString() === activityId,
    );

    if (isFavorited) {
      await this.removeFavoriteActivity(userId, activityId);
    } else {
      await this.addFavoriteActivity(userId, activityId);
    }

    return this.getById(userId);
  }

  async updateFavoriteActivitiesOrder(
    userId: string,
    activityIds: string[],
  ): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const favoriteIds =
      user.favoriteActivities?.map((fav) => fav.toString()) || [];

    // check to only reorder the same fav activities array
    const isSameFavActivitiesArray =
      activityIds.every((id) => favoriteIds.includes(id)) &&
      activityIds.length === favoriteIds.length;

    if (!isSameFavActivitiesArray) {
      throw new NotFoundException('Invalid activities array');
    }

    user.favoriteActivities = activityIds.map(
      (id) => new Types.ObjectId(id),
    ) as any;

    await user.save();

    return this.getById(userId);
  }
}
