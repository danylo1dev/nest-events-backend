import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  DefaultValuePipe,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Put,
  Query,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EventsService } from '../services/events.service';
import { AttendeesService } from '../services/attendee.service';
import { CreateAttendeeDto } from '../dto/create-attendee.dto';
import { CurrentUser } from '../../auth/strategies/curent-user.decorator';
import { AuthGuardJwt } from '../../auth/guards/auth-guard-jwt.guard';
import { User } from '../../auth/entities/user.entity';

@Controller('events-attendance')
@SerializeOptions({ strategy: 'excludeAll' })
@UseGuards(AuthGuardJwt)
@UseInterceptors(ClassSerializerInterceptor)
export class CurrentUserEventAttendanceController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly attendeesService: AttendeesService,
  ) {}

  @Get()
  async findAll(
    @CurrentUser() user: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
  ) {
    return await this.eventsService.getEventsOrganizedByUserIdQueryPaginated(
      user.id,
      {
        currentPage: page,
        limit: 6,
      },
    );
  }
  @Get('/:eventId')
  async findOne(
    @Param('eventId', ParseIntPipe) eventId: number,
    @CurrentUser() user: User,
  ) {
    const attendee = await this.attendeesService.findOneByEventIdAndUserId(
      eventId,
      user.id,
    );
    if (!attendee) {
      throw new NotFoundException();
    }

    return attendee;
  }
  @Put('/:eventId')
  async createOrUpdate(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() input: CreateAttendeeDto,
    @CurrentUser() user: User,
  ) {
    return this.attendeesService.createOrUpdate(input, eventId, user.id);
  }
}
