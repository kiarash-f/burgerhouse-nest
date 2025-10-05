export enum OrderStatus {
  PENDING = 'pending', // created, awaiting payment
  PAID = 'paid', // paid (webhook will move here)
  PREPARING = 'preparing', // kitchen started
  READY = 'ready', // ready for pickup/delivery
  DELIVERED = 'delivered', // completed
  CANCELLED = 'cancelled', // user/admin cancelled
}
