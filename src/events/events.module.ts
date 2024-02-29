import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './controllers/event.controller';
import { Attendee } from './entitis/attendee.entity';
import { EventsService } from './services/events.service';
import { Event } from './entitis/event.entity';
import { AttendeesService } from './services/attendee.service';
import { EventsAttendeesController } from './controllers/events-attedees.controller';
import { EventsOrganizedByUserController } from './controllers/events-organized-by-user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Attendee])],
  controllers: [
    EventsController,
    EventsAttendeesController,
    EventsOrganizedByUserController,
  ],
  providers: [EventsService, AttendeesService],
})
export class EventsModule {}
