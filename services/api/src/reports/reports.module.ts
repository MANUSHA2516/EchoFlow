import { Controller, Get, Injectable, Module, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRole } from '@echoflow/types';
import { JwtAuthGuard, Roles, RolesGuard } from '../common/auth';
import { DatabaseModule } from '../database/database.module';
import { QueueTicket, Visit } from '../database/schemas';

@Injectable()
class ReportsService {
  constructor(
    @InjectModel(QueueTicket.name) private readonly tickets: Model<QueueTicket>,
    @InjectModel(Visit.name) private readonly visits: Model<Visit>,
  ) {}
  async staff() {
    const serviceDate = new Date().toISOString().slice(0, 10);
    const byStage = await this.tickets.aggregate([
      { $match: { serviceDate } },
      { $group: { _id: '$stage', count: { $sum: 1 }, averageWait: { $avg: '$predictedWaitMinutes' } } },
      { $sort: { count: -1 } },
    ]);
    const byRoom = await this.tickets.aggregate([
      { $match: { serviceDate } },
      { $group: { _id: '$roomId', count: { $sum: 1 } } },
      { $lookup: { from: 'echo_rooms', localField: '_id', foreignField: '_id', as: 'room' } },
    ]);
    return { serviceDate, byStage, byRoom, dataProvenance: 'operational' };
  }
  async admin() {
    const dailyVolume = await this.tickets.aggregate([
      { $group: { _id: '$serviceDate', total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$stage', 'complete'] }, 1, 0] } } } },
      { $sort: { _id: 1 } },
      { $limit: 90 },
    ]);
    const visitMix = await this.visits.aggregate([
      { $group: { _id: '$visitType', count: { $sum: 1 } } },
    ]);
    return { dailyVolume, visitMix, dataProvenance: 'operational' };
  }
}

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
class ReportsController {
  constructor(private readonly service: ReportsService) {}
  @Get('staff') @Roles(UserRole.Technician, UserRole.RoomLead, UserRole.SuperAdmin)
  staff() { return this.service.staff(); }
  @Get('admin') @Roles(UserRole.SuperAdmin)
  admin() { return this.service.admin(); }
}

@Module({
  imports: [DatabaseModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
