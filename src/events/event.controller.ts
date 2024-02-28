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
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, MoreThan, Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './entitis/event.entity';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';
import { ListEvents } from './dto/list/list.events';

@Controller('/events')
export class EventsController {
  constructor(
    @InjectRepository(Event) private readonly repository: Repository<Event>,
    private readonly eventsService: EventsService,
  ) {}
  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() filter: ListEvents) {
    return await this.eventsService.getEventsWithAttendeeContFilteredPaginated(
      filter,
      {
        total: true,
        currentPage: filter.page,
        limit: filter.limit,
      },
    );
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
    const res = await this.eventsService.deleteEvent(id);
    if (res.affected !== 1) {
      throw new NotFoundException();
    }
  }
}
