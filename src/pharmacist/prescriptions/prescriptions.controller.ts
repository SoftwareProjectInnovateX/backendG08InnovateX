import {
  Controller, Post, Get, Patch,
  Param, Body, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PrescriptionsService } from './prescriptions.service';

@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('prescription', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
      },
      fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only JPG, PNG, and PDF files are allowed'), false);
        }
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('customerName')    customerName: string,
    @Body('customerPhone')   customerPhone: string,
    @Body('customerAddress') customerAddress: string,
    @Body('userId')          userId: string,
  ) {
    return this.prescriptionsService.uploadPrescription(
      file, customerName, customerPhone, customerAddress, userId,
    );
  }

  @Get()
  async getAll() {
    return this.prescriptionsService.getAllPrescriptions();
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: any,
  ) {
    return this.prescriptionsService.updatePrescription(id, updateData);
  }
}