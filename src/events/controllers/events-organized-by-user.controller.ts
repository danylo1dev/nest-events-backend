import {
  ClassSerializerInterceptor,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { EventsService } from '../services/events.service';
import constants from '../constants';

@Controller('events-organized-by-user/:userId')
@SerializeOptions({ strategy: 'excludeAll' })
@UseInterceptors(ClassSerializerInterceptor)
export class EventsOrganizedByUserController {
  constructor(private readonly eventsService: EventsService) {}
  @Get()
  async findAll(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page', new DefaultValuePipe(constants.defaultPage), ParseIntPipe)
    page = constants.defaultPage,
  ) {
    return await this.eventsService.getEventsOrganizedByUserIdQueryPaginated(
      userId,
      { currentPage: page, limit: constants.limit },
    );
  }
}
