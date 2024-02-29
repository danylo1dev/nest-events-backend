import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { AttendeesService } from '../services/attendee.service';

@Controller('events/:eventsId/attendees/')
@SerializeOptions({ strategy: 'excludeAll' })
export class EventsAttendeesController {
  constructor(private readonly attendeesService: AttendeesService) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(@Param('eventId') eventId) {
    return await this.attendeesService.findByEventId(eventId);
  }
}
