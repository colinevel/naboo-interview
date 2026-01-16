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
  ): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if activity is already favorited
    if (user.favoriteActivities?.some((fav) => fav.toString() === activityId)) {
      return user;
    }

    // Add activity to favorites
    user.favoriteActivities = [
      ...(user.favoriteActivities || []),
      activityId as any,
    ];
    await user.save();

    return this.getById(userId);
  }

  private async removeFavoriteActivity(
    userId: string,
    activityId: string,
  ): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove activity from favorites
    user.favoriteActivities =
      user.favoriteActivities?.filter((fav) => fav.toString() !== activityId) ||
      [];
    await user.save();

    return this.getById(userId);
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
      return this.removeFavoriteActivity(userId, activityId);
    } else {
      return this.addFavoriteActivity(userId, activityId);
    }
  }
}
