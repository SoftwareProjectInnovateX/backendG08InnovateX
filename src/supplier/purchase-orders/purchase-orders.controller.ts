import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { ApproveOrderDto } from './dto/approve-order.dto';
import { RejectOrderDto } from './dto/reject-order.dto';

@Controller('supplier/purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  /**
   * GET /supplier/purchase-orders?supplierId=xxx&status=PENDING
   * Fetch all orders for a supplier, optionally filtered by status
   */
  @Get()
  async getOrders(
    @Query('supplierId') supplierId: string,
    @Query('status') status?: string,
  ) {
    return this.purchaseOrdersService.getOrders(supplierId, status);
  }

  /**
   * GET /supplier/purchase-orders/:orderId
   * Fetch a single order by Firestore document ID
   */
  @Get(':orderId')
  async getOrderById(@Param('orderId') orderId: string) {
    return this.purchaseOrdersService.getOrderById(orderId);
  }

  /**
   * PATCH /supplier/purchase-orders/:orderId/approve
   * Approve a PENDING purchase order
   * Body: { supplierId, supplierName }
   */
  @Patch(':orderId/approve')
  @HttpCode(HttpStatus.OK)
  async approveOrder(
    @Param('orderId') orderId: string,
    @Body() body: ApproveOrderDto,
  ) {
    return this.purchaseOrdersService.approveOrder(
      orderId,
      body.supplierId,
      body.supplierName,
    );
  }

  /**
   * PATCH /supplier/purchase-orders/:orderId/reject
   * Reject a PENDING purchase order with a reason
   * Body: { supplierId, supplierName, rejectReason }
   */
  @Patch(':orderId/reject')
  @HttpCode(HttpStatus.OK)
  async rejectOrder(
    @Param('orderId') orderId: string,
    @Body() body: RejectOrderDto,
  ) {
    return this.purchaseOrdersService.rejectOrder(
      orderId,
      body.supplierId,
      body.supplierName,
      body.rejectReason,
    );
  }
}