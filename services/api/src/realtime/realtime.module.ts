import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { QUEUE_EVENTS, QueueEventName, UserRole } from '@echoflow/types';
import { AuthUser } from '../common/auth';

@WebSocketGateway({
  cors: { origin: true, credentials: true },
  namespace: '/',
})
export class RealtimeGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    const raw =
      client.handshake.auth?.token ??
      client.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');
    try {
      const user = await this.jwt.verifyAsync<AuthUser>(raw, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });
      client.data.user = user;
      client.join(`${user.typ}:${user.sub}`);
      if (user.role === UserRole.SuperAdmin) client.join('admin');
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage('queue.join')
  joinQueue(client: Socket, serviceDate: string) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(serviceDate)) client.join(`queue:${serviceDate}`);
  }

  emitQueue(event: QueueEventName, serviceDate: string, payload: unknown) {
    this.server.to(`queue:${serviceDate}`).emit(event, payload);
    this.server.to('admin').emit(event, payload);
  }

  emitPatient(event: QueueEventName, patientId: string, payload: unknown) {
    this.server.to(`patient:${patientId}`).emit(event, payload);
  }

  readonly events = QUEUE_EVENTS;
}

@Global()
@Module({
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
