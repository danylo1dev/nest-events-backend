import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateEventDto } from './create-event.dto';

@Controller('/events')
export class EventsController {
  @Get()
  findAll() {
    return {
      id: 1,
      name: 'Danylo',
    };
  }
  @Get('/:id')
  findOne(@Param('id') id) {
    return {
      id,
      name: 'Danylo',
    };
  }
  @Post()
  create(@Body() body: CreateEventDto) {
    return body;
  }
  @Patch('/:id')
  update(@Param('id') id, @Body() body) {
    return { id, ...body };
  }
  @Delete('/:id')
  remove(@Param('id') id) {
    return id;
  }
}
