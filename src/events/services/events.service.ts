import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Event, PaginatedEvents } from '../entitis/event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendeeAnswerEnum } from '../entitis/attendee.entity';
import { ListEvents, WhenEventFilter } from '../dto/list/list.events';
import { PaginateOptions, paginate } from 'src/pagination/paginator';
import { CreateEventDto } from '../dto/create-event.dto';
import { User } from 'src/auth/entities/user.entity';
import { UpdateEventDto } from '../dto/update-event.dto';

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
  public async getEventsWithAttendeeContFilteredPaginated(
    filter: ListEvents,
    options: PaginateOptions,
  ): Promise<PaginatedEvents> {
    return await paginate(
      this.getEventsWithAttendeeContFiltered(filter),
      options,
    );
  }
  private getEventsWithAttendeeContFiltered(filter?: ListEvents) {
    let query = this.getEventsWithAttendeeCountQuery();

    if (Object.keys(filter).length <= 0) {
      return query;
    }
    if (filter.when) {
      if (filter.when == WhenEventFilter.Today) {
        query = query.andWhere(
          `e.when >= CURDATE() AND e.when <= CURDATE()+ INTERVAL 1 DAY`,
        );
      }
      if (filter.when === WhenEventFilter.Tommorow) {
        query = query.andWhere(
          `e.when >= CURDATE() + INTERVAL 1 DAY AND e.when <= CURDATE()+ INTERVAL 2 DAY`,
        );
      }
      if (filter.when == WhenEventFilter.ThisWeek) {
        query = query.andWhere(`YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1) `);
      }
      if (filter.when == WhenEventFilter.ThisWeek) {
        query = query.andWhere(
          `YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1)+1 `,
        );
      }
      return query;
    }
  }
  public async deleteEvent(id: number) {
    return await this.repository
      .createQueryBuilder('e')
      .delete()
      .where('id = :id', { id })
      .execute();
  }
  public async crreateEvent(input: CreateEventDto, user: User) {
    return await this.repository.save({
      ...input,
      organizer: user,
      when: new Date(input.when),
    });
  }
  public async updateEvent(event: Event, input: UpdateEventDto) {
    return await this.repository.save({
      ...event,
      ...input,
      when: input.when ? new Date(input.when) : event.when,
    });
  }
  public async getEventsOrganizedByUserIdQueryPaginated(
    userId: number,
    paginateOptions: PaginateOptions,
  ): Promise<PaginatedEvents> {
    return await paginate<Event>(
      this.getEventsOrganizedByUserIdQuery(userId),
      paginateOptions,
    );
  }
  private getEventsOrganizedByUserIdQuery(userId: number) {
    return this.getEventsBaseQuery().where('e.organizerId = :userId', {
      userId,
    });
  }
}
