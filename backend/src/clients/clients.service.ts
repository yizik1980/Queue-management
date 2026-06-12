import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from './schemas/client.schema';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel(Client.name) private model: Model<ClientDocument>,
  ) {}

  findAll(adminId: string): Promise<ClientDocument[]> {
    return this.model.find({ adminId }).sort({ name: 1 }).lean().exec() as any;
  }

  async create(dto: CreateClientDto): Promise<ClientDocument> {
    const created = new this.model(dto);
    return created.save();
  }

  async update(id: string, dto: Partial<CreateClientDto>, adminId: string): Promise<ClientDocument> {
    const doc = await this.model.findOneAndUpdate({ _id: id, adminId }, dto, { new: true }).exec();
    if (!doc) throw new NotFoundException(`Client ${id} not found`);
    return doc;
  }

  async remove(id: string, adminId: string): Promise<void> {
    const doc = await this.model.findOneAndDelete({ _id: id, adminId }).exec();
    if (!doc) throw new NotFoundException(`Client ${id} not found`);
  }
}
