import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';

@Controller('/')
@SerializeOptions({ strategy: 'excludeAll' })
@UseInterceptors(ClassSerializerInterceptor)
export class AppController {
  @Get()
  getHello() {
    return 'hello world';
  }
}
