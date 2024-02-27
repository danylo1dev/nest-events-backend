import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateEventDto } from './create-event.dto';
import { UpdateEventDto } from './update-event.dto';
import { Event } from './event.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('/events')
export class EventsController {
  constructor(
    @InjectRepository(Event) private readonly repository: Repository<Event>,
  ) {}
  @Get()
  async findAll() {
    return await this.repository.find();
  }
  @Get('/:id')
  async findOne(@Param('id') id) {
    return await this.repository.findOne(id);
  }
  @Post()
  async create(@Body() body: CreateEventDto) {
    return await this.repository.save({
      ...body,
      when: new Date(body.when),
    });
  }
  @Patch('/:id')
  async update(@Param('id') id, @Body() body: UpdateEventDto) {
    const event = await this.repository.findOne(id);
    return await this.repository.update(id, {
      ...event,
      ...body,
      when: body.when ? new Date(body.when) : event.when,
    });
  }
  @Delete('/:id')
  @HttpCode(204)
  async remove(@Param('id') id) {
    const event = await this.repository.findOne(id);
    return await this.repository.remove(event);
  }
}
