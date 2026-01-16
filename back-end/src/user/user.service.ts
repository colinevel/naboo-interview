import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SignUpInput } from 'src/auth/types';
import { User } from './user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
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

    if (user.favoriteActivities?.some((fav) => fav.toString() === activityId)) {
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

    // Remove activity from favorites
    user.favoriteActivities =
      user.favoriteActivities?.filter((fav) => fav.toString() !== activityId) ||
      [];
    await user.save();
  }

  async toggleFavoriteActivity(
    userId: string,
    activityId: string,
  ): Promise<void> {
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
  }

  async updateFavoriteActivitiesOrder(
    userId: string,
    activityIds: string[],
  ): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate that all IDs belong to user's favorites
    const favoriteIds =
      user.favoriteActivities?.map((fav) => fav.toString()) || [];
    const isValid =
      activityIds.every((id) => favoriteIds.includes(id)) &&
      activityIds.length === favoriteIds.length;

    if (!isValid) {
      throw new NotFoundException('Invalid activity IDs or order');
    }

    const reorderedActivities = activityIds
      .map((id) =>
        user.favoriteActivities?.find((fav) => fav.toString() === id),
      )
      .filter(
        (activity): activity is NonNullable<typeof activity> =>
          activity !== undefined,
      );

    user.favoriteActivities = reorderedActivities;
    await user.save();
  }
}
