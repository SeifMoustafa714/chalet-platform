import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UploadsService } from './uploads.service';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private service: UploadsService) {}

  // Frontend PUTs the file directly to S3 using `uploadUrl` — the file
  // bytes never pass through this API process.
  @Post('presign')
  presign(@Body() body: { fileName: string; contentType: string }) {
    return this.service.presign(body.fileName, body.contentType);
  }
}
