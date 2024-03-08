import { Test } from '@nestjs/testing';
import { Event } from '../entitis/event.entity';
import { EventsService } from './events.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as paginator from '../../pagination/paginator';

jest.mock('../../pagination/paginator');

describe('EventsService', () => {
  let service: EventsService;
  let repository: Repository<Event>;
  let selectQB;
  let deleteQB;
  let mockedPaginate;
  beforeEach(async () => {
    mockedPaginate = paginator.paginate as jest.Mock;
    deleteQB = {
      where: jest.fn(),
      execute: jest.fn(),
    };
    selectQB = {
      delete: jest.fn().mockReturnValue(deleteQB),
      where: jest.fn(),
      execute: jest.fn(),
      orderBy: jest.fn(),
      leftJoinAndSelect: jest.fn(),
    };
    const module = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: {
            save: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(selectQB),
            delete: jest.fn(),
            where: jest.fn(),
            execute: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<EventsService>(EventsService);
    repository = module.get<Repository<Event>>(getRepositoryToken(Event));
  });
  describe('updateEvent', () => {
    it('should update the event', async () => {
      const repoSpy = jest
        .spyOn(repository, 'save')
        .mockResolvedValue({ id: 1 } as Event);
      expect(
        service.updateEvent(new Event({ id: 1 }), { name: 'New Name' }),
      ).resolves.toEqual({ id: 1 });
      expect(repoSpy).toBeCalledWith({ id: 1, name: 'New Name' });
    });
  });
  describe('delete event', () => {
    it('should delete an event', async () => {
      const createQueryBuilderSpy = jest.spyOn(
        repository,
        'createQueryBuilder',
      );
      const deleteSpy = jest.spyOn(selectQB, 'delete');
      const whereSpy = jest.spyOn(deleteQB, 'where').mockReturnValue(deleteQB);
      const executeSpy = jest.spyOn(deleteQB, 'execute');

      expect(service.deleteEvent(1)).resolves.toBe(undefined);

      expect(createQueryBuilderSpy).toHaveBeenCalledTimes(1);
      expect(createQueryBuilderSpy).toHaveBeenCalledWith('e');

      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(whereSpy).toHaveBeenCalledTimes(1);
      expect(whereSpy).toHaveBeenCalledWith('id = :id', { id: 1 });
      expect(executeSpy).toHaveBeenCalledTimes(1);
    });
  });
  describe('getEventsAttendeesByUserIdPaginated', () => {
    it('should return a list of paginated events ', async () => {
      const orederBySpy = jest
        .spyOn(selectQB, 'orderBy')
        .mockReturnValue(selectQB);
      const leftJoinSpy = jest
        .spyOn(selectQB, 'leftJoinAndSelect')
        .mockReturnValue(selectQB);
      const whereSpy = jest.spyOn(selectQB, 'where').mockReturnValue(selectQB);
      const mock = {
        firs: 1,
        last: 1,
        total: 1,
        limit: 10,
        data: [],
      };
      mockedPaginate.mockResolvedValue(mock);
      expect(
        service.getEventsAttendedByUserIdQueryPaginated(500, {
          limit: 1,
          currentPage: 1,
        }),
      ).resolves.toEqual(mock);

      expect(orederBySpy).toBeCalledTimes(1);
      expect(orederBySpy).toBeCalledWith('e.id', 'DESC');
      expect(leftJoinSpy).toBeCalledTimes(1);
      expect(leftJoinSpy).toBeCalledWith('e.attendees', 'a');
      expect(whereSpy).toBeCalledTimes(1);
      expect(whereSpy).toBeCalledWith('a.userId = : userId', { userId: 500 });
      expect(mockedPaginate).toBeCalledTimes(1);
      expect(mockedPaginate).toBeCalledWith(selectQB, {
        currentPage: 1,
        limit: 1,
      });
    });
  });
});
