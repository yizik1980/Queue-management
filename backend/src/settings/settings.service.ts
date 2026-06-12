import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings, SettingsDocument } from './settings.schema';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name) private model: Model<SettingsDocument>,
  ) {}

  async getOrCreate(adminId: string): Promise<SettingsDocument> {
    let doc = await this.model.findOne({ adminId }).exec();
    if (!doc) doc = await this.model.create({ adminId });
    return doc;
  }

  async update(adminId: string, dto: Partial<Settings>): Promise<SettingsDocument> {
    const doc = await this.getOrCreate(adminId);
    Object.assign(doc, dto);
    return doc.save();
  }
}
