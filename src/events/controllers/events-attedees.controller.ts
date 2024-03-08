import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { AttendeesService } from '../services/attendee.service';

@Controller('events/:eventId/attendees')
@SerializeOptions({ strategy: 'excludeAll' })
@UseInterceptors(ClassSerializerInterceptor)
export class EventsAttendeesController {
  constructor(private readonly attendeesService: AttendeesService) {}

  @Get()
  async findAll(@Param('eventId', ParseIntPipe) eventId: number) {
    return await this.attendeesService.findByEventId(+eventId);
  }
}
