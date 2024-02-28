import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, MoreThan, Repository } from 'typeorm';
import { CreateEventDto } from './create-event.dto';
import { Event } from './event.entity';
import { UpdateEventDto } from './update-event.dto';
import { EventsService } from './events.service';

@Controller('/events')
export class EventsController {
  constructor(
    @InjectRepository(Event) private readonly repository: Repository<Event>,
    private readonly eventsService: EventsService,
  ) {}
  @Get()
  async findAll() {
    return await this.repository.find();
  }
  @Get('practis')
  async practis() {
    return await this.repository.find({
      select: ['id', 'when'],
      where: [
        {
          id: MoreThan(2),
          when: MoreThan(new Date('2021-02-12t13:00:00')),
        },
        {
          description: Like('%meet%'),
        },
      ],
      take: 2,
      skip: 1,
      order: {
        id: 'DESC',
      },
    });
  }
  @Get(':id')
  async findOne(@Param('id') id) {
    const event = await this.eventsService.getEvent(+id);
    if (!event) {
      throw new NotFoundException();
    }
    return event;
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
    const event = await this.repository.findOne({ where: { id } });
    return await this.repository.update(id, {
      ...event,
      ...body,
      when: body.when ? new Date(body.when) : event.when,
    });
  }
  @Delete('/:id')
  @HttpCode(204)
  async remove(@Param('id') id) {
    const event = await this.repository.findOne({ where: { id } });
    return await this.repository.remove(event);
  }
}
