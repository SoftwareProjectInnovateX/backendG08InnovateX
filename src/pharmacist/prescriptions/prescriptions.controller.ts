import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PrescriptionsService } from './prescriptions.service';

@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('prescription', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('customerName') customerName: string,
    @Body('customerPhone') customerPhone: string,
    @Body('customerAddress') customerAddress: string,
  ) {
    return this.prescriptionsService.uploadPrescription(
      file,
      customerName,
      customerPhone,
      customerAddress,
    );
  }

  @Get()
  async getAll() {
    return this.prescriptionsService.getAllPrescriptions();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateData: any) {
    return this.prescriptionsService.updatePrescription(id, updateData);
  }
}
