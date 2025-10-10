import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

type OrderCreatedPayload = {
  id: number;
  type?: 'DINE_IN' | 'DELIVERY' | 'PICKUP';
  tableId?: number | null;
  total: number;
  count: number;
  status: string;
  createdAt: string | Date;
};

type OrderStatusChangedPayload = {
  id: number;
  status: string;
};

@WebSocketGateway({
  namespace: '/admin',
  cors: { origin: '*', credentials: false },
})
export class OrdersEventsGateway {
  @WebSocketServer() server!: Server;

  constructor(
    @InjectPinoLogger(OrdersEventsGateway.name)
    private readonly logger: PinoLogger,
  ) {}

  handleConnection(client: Socket) {
    this.logger.info({ sid: client.id }, 'WS /admin connected');
    console.log('[WS] /admin connected', client.id);
    client.emit('hello', { sid: client.id });
  }

  handleDisconnect(client: Socket) {
    this.logger.info({ sid: client.id }, 'WS /admin disconnected');
    console.log('[WS] /admin disconnected', client.id);
  }

  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() _body: any) {
    client.join('admin');
    this.logger.info(
      { sid: client.id, rooms: Array.from(client.rooms) },
      'joined admin room',
    );
    client.emit('joined', { room: 'admin' });
  }

  // ---- broadcast helpers ----
  notifyOrderCreated(payload: OrderCreatedPayload) {
    this.logger.info({ event: 'order:created', payload }, 'broadcast');
    console.log('[WS] broadcasting order:created', payload);
    this.server.to('admin').emit('order:created', payload);
  }

  notifyOrderStatusChanged(payload: OrderStatusChangedPayload) {
    this.logger.info({ event: 'order:statusChanged', payload }, 'broadcast');
    console.log('[WS] broadcasting order:statusChanged', payload);
    this.server.to('admin').emit('order:statusChanged', payload);
  }
}
