import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Event, PaginatedEvents } from '../entitis/event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendeeAnswerEnum } from '../entitis/attendee.entity';
import { ListEvents, WhenEventFilter } from '../dto/list/list.events';
import { PaginateOptions, paginate } from '../../pagination/paginator';
import { CreateEventDto } from '../dto/create-event.dto';
import { User } from '../../auth/entities/user.entity';
import { UpdateEventDto } from '../dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private repository: Repository<Event>,
  ) {}
  private getEventsBaseQuery(): SelectQueryBuilder<Event> {
    return this.repository
      .createQueryBuilder('event')
      .orderBy('event.id', 'DESC');
  }
  public getEventsWithAttendeeCountQuery(): SelectQueryBuilder<Event> {
    return this.getEventsBaseQuery()
      .loadRelationCountAndMap('event.attendeeCount', 'event.attendees')
      .loadRelationCountAndMap(
        'event.attendeeAccepted',
        'event.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Accepted,
          }),
      )
      .loadRelationCountAndMap(
        'event.attendeeMaybe',
        'event.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Maybe,
          }),
      )
      .loadRelationCountAndMap(
        'event.attendeeRejected',
        'event.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Rejected,
          }),
      );
  }
  public async getEventWithAttendeeCount(
    id: number,
  ): Promise<Event | undefined> {
    return await this.getEventsWithAttendeeCountQuery()
      .andWhere('event.id = :id', { id })
      .getOne();
  }

  public async findOne(id: number) {
    return await this.repository.findOne({ where: { id } });
  }
  public async getEventsWithAttendeeContFilteredPaginated(
    filter: ListEvents,
    options: PaginateOptions,
  ): Promise<PaginatedEvents> {
    return await paginate(
      this.getEventsWithAttendeeContFilteredQuery(filter),
      options,
    );
  }
  private getEventsWithAttendeeContFilteredQuery(
    filter?: ListEvents,
  ): SelectQueryBuilder<Event> {
    let query = this.getEventsWithAttendeeCountQuery();

    if (Object.keys(filter).length <= 0) {
      return query;
    }
    if (filter.when) {
      if (filter.when == WhenEventFilter.Today) {
        query = query.andWhere(
          `event.when >= CURDATE() AND e.when <= CURDATE()+ INTERVAL 1 DAY`,
        );
      }
      if (filter.when === WhenEventFilter.Tommorow) {
        query = query.andWhere(
          `event.when >= CURDATE() + INTERVAL 1 DAY AND e.when <= CURDATE()+ INTERVAL 2 DAY`,
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
      .createQueryBuilder('event')
      .delete()
      .where('id = :id', { id })
      .execute();
  }
  public async createEvent(input: CreateEventDto, user: User) {
    return await this.repository.save(
      new Event({
        ...input,
        organizer: user,
        when: new Date(input.when),
      }),
    );
  }
  public async updateEvent(id: number, input: UpdateEventDto, user: User) {
    const event = await this.getEventWithAttendeeCount(id);
    if (!event) {
      throw new NotFoundException();
    }
    if (event.organizerId !== user.id) {
      throw new ForbiddenException(
        null,
        'You do not have permission to edit this event',
      );
    }
    return await this.repository.save(
      new Event({
        ...event,
        ...input,
        when: input.when ? new Date(input.when) : event.when,
      }),
    );
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
  private getEventsOrganizedByUserIdQuery(
    userId: number,
  ): SelectQueryBuilder<Event> {
    return this.getEventsBaseQuery().where('event.organizerId = :userId', {
      userId,
    });
  }
  public async getEventsAttendedByUserIdQueryPaginated(
    userId: number,
    paginateOptions: PaginateOptions,
  ): Promise<PaginatedEvents> {
    return await paginate<Event>(
      this.getEventsAttendedByUserIdQuery(userId),
      paginateOptions,
    );
  }
  private getEventsAttendedByUserIdQuery(
    userId: number,
  ): SelectQueryBuilder<Event> {
    return this.getEventsBaseQuery()
      .leftJoinAndSelect('event.attendees', 'a')
      .where('a.userId = : userId', { userId });
  }
}
