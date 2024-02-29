import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { User } from 'src/auth/entities/user.entity';
import { AuthGuardJwt } from 'src/auth/guards/auth-guard-jwt.guard';
import { CurrentUser } from 'src/auth/strategies/curent-user.decorator';
import { CreateEventDto } from './dto/create-event.dto';
import { ListEvents } from './dto/list/list.events';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';

@Controller('/events')
@SerializeOptions({ strategy: 'excludeAll' })
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}
  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(ClassSerializerInterceptor)
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

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(@Param('id') id) {
    const event = await this.eventsService.getEvent(+id);
    if (!event) {
      throw new NotFoundException();
    }
    return event;
  }

  @Post()
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async create(@Body() body: CreateEventDto, @CurrentUser() user: User) {
    return await this.eventsService.crreateEvent(body, user);
  }
  @Patch('/:id')
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async update(
    @Param('id') id,
    @Body() body: UpdateEventDto,
    @CurrentUser() user: User,
  ) {
    const event = await this.eventsService.getEvent(id);
    if (!event) {
      throw new NotFoundException();
    }
    if (event.organizerId !== user.id) {
      throw new ForbiddenException(
        null,
        ' You are not  permision to edit this event',
      );
    }
    return await this.eventsService.updateEvent(event, body);
  }
  @Delete('/:id')
  @HttpCode(204)
  @UseGuards(AuthGuardJwt)
  async remove(@Param('id') id, @CurrentUser() user: User) {
    const event = await this.eventsService.getEvent(id);
    if (!event) {
      throw new NotFoundException();
    }
    if (event.organizerId !== user.id) {
      throw new ForbiddenException(
        null,
        ' You are not  permision to edit this event',
      );
    }
    await this.eventsService.deleteEvent(id);
  }
}
