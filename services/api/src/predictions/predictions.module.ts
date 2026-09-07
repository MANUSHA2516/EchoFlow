import {
  Body,
  Controller,
  Get,
  Injectable,
  Module,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../common/auth';

class WaitTimeDto {
  @Type(() => Number) @IsInt() @Min(0) @Max(23) hourOfDay!: number;
  @Type(() => Number) @IsInt() @Min(0) @Max(6) dayOfWeek!: number;
  @Type(() => Number) @IsInt() @Min(0) queueLength!: number;
  @IsOptional() @IsIn(['normal', 'urgent']) priority?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(1) roomLoad?: number;
  @IsOptional() @IsString() slot?: string;
}

@Injectable()
class PredictionsService {
  constructor(private readonly config: ConfigService) {}
  private get base() { return this.config.get('ML_SERVICE_URL', 'http://127.0.0.1:8000'); }
  private async request(path: string, init?: RequestInit) {
    const response = await fetch(`${this.base}${path}`, {
      ...init,
      signal: AbortSignal.timeout(1500),
      headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
    });
    if (!response.ok) throw new Error(`ML service returned ${response.status}`);
    return response.json() as Promise<Record<string, unknown>>;
  }
  async wait(dto: WaitTimeDto) {
    try {
      const result = await this.request('/predict/wait-time', {
        method: 'POST',
        body: JSON.stringify({
          hour_of_day: dto.hourOfDay,
          day_of_week: dto.dayOfWeek,
          queue_length: dto.queueLength,
          priority: dto.priority ?? 'normal',
          room_load: dto.roomLoad ?? 0.5,
          slot: dto.slot,
        }),
      });
      return {
        minutes: result.minutes,
        modelVersion: result.model_version,
        confidence: result.confidence,
        dataProvenance: result.data_provenance ?? 'operational',
        generatedAt: result.generated_at,
      };
    } catch {
      const peak = [12, 13, 14].includes(dto.hourOfDay) ? 8 : 0;
      return {
        minutes: Math.round((12 + dto.queueLength * 4.5 + peak) * (dto.priority === 'urgent' ? 0.65 : 1)),
        modelVersion: 'ECHO-ML-fallback-0.1.0',
        confidence: 0.35,
        dataProvenance: 'synthetic',
        generatedAt: new Date().toISOString(),
      };
    }
  }
  async inflow(hours = 12) {
    try { return await this.request(`/predict/inflow?hours=${Math.max(1, Math.min(hours, 24))}`); }
    catch {
      return {
        horizonHours: hours,
        series: Array.from({ length: hours }, (_, i) => ({
          hour: (new Date().getHours() + i) % 24,
          forecast: 6 + (i % 5) * 2,
        })),
        modelVersion: 'ECHO-ML-fallback-0.1.0',
        dataProvenance: 'synthetic',
      };
    }
  }
  async peaks() {
    try { return await this.request('/predict/peak-hours'); }
    catch {
      return {
        peaks: [{ startHour: 13, endHour: 14, label: '1–2 PM' }],
        modelVersion: 'ECHO-ML-fallback-0.1.0',
        dataProvenance: 'synthetic',
      };
    }
  }
  async info() {
    try { return await this.request('/model/info'); }
    catch {
      return {
        version: 'ECHO-ML-fallback-0.1.0',
        status: 'fallback',
        metrics: { mae: 4.8, rmse: 6.2, r2: 0.71 },
        dataProvenance: 'synthetic',
      };
    }
  }
}

@Controller('predictions')
@UseGuards(JwtAuthGuard)
class PredictionsController {
  constructor(private readonly service: PredictionsService) {}
  @Post('wait-time') wait(@Body() dto: WaitTimeDto) { return this.service.wait(dto); }
  @Get('inflow') inflow(@Query('hours') hours?: string) { return this.service.inflow(Number(hours) || 12); }
  @Get('peak-hours') peaks() { return this.service.peaks(); }
  @Get('model-info') info() { return this.service.info(); }
}

@Module({ controllers: [PredictionsController], providers: [PredictionsService] })
export class PredictionsModule {}
