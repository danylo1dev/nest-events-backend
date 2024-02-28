import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendeeAnswerEnum } from './attendee';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private repository: Repository<Event>,
  ) {}
  private getEventsBaseQuery() {
    return this.repository.createQueryBuilder('e').orderBy('e.id', 'DESC');
  }
  public getEventsWithAttendeeCountQuery() {
    return this.getEventsBaseQuery()
      .loadRelationCountAndMap('e.attendeeCount', 'e.attendees')
      .loadRelationCountAndMap(
        'e.attendeeAccepted',
        'e.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Accepted,
          }),
      )
      .loadRelationCountAndMap(
        'e.attendeeMaybe',
        'e.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Maybe,
          }),
      )
      .loadRelationCountAndMap(
        'e.attendeeRejected',
        'e.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Rejected,
          }),
      );
  }
  public async getEvent(id: number): Promise<Event | undefined> {
    return await this.getEventsWithAttendeeCountQuery()
      .andWhere('e.id = :id', { id })
      .getOne();
  }
}
