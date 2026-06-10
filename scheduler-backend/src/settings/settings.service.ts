import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings, SettingsDocument } from './settings.schema';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name) private model: Model<SettingsDocument>,
  ) {}

  async getOrCreate(): Promise<SettingsDocument> {
    let doc = await this.model.findOne().exec();
    if (!doc) doc = await this.model.create({});
    return doc;
  }

  async update(dto: Partial<Settings>): Promise<SettingsDocument> {
    const doc = await this.getOrCreate();
    Object.assign(doc, dto);
    return doc.save();
  }
}
