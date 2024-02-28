import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './event.controller';
import { Attendee } from './entitis/attendee.entity';
import { EventsService } from './events.service';
import { Event } from './entitis/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Attendee])],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
