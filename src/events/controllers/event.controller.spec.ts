import { Repository } from 'typeorm';
import { Event } from '../entitis/event.entity';
import { EventsService } from '../services/events.service';
import { EventsController } from './event.controller';
import { ListEvents } from '../dto/list/list.events';
import { User } from '../../auth/entities/user.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('EventsController', () => {
  let eventsService: EventsService;
  let eventsController: EventsController;
  let eventsRepository: Repository<Event>;
  beforeEach(() => {
    eventsService = new EventsService(eventsRepository);
    eventsController = new EventsController(eventsService);
  });
  describe('findAll', () => {
    it('Should return a list of events', async () => {
      const result = {
        first: 1,
        last: 1,
        limit: 1,
        data: [{}],
      };
      const spy = jest
        .spyOn(eventsService, 'getEventsWithAttendeeContFilteredPaginated')
        .mockImplementation((): any => result);
      expect(await eventsController.findAll(new ListEvents())).toEqual(result);
      expect(spy).toBeCalledTimes(1);
    });
  });

  describe('remove', () => {
    let deleteSpy;
    let findSpy;
    beforeEach(() => {
      deleteSpy = jest.spyOn(eventsService, 'deleteEvent');
      findSpy = jest.spyOn(eventsService, 'findOne');
    });
    afterEach(() => {
      expect(findSpy).toBeCalledTimes(1);
    });
    it("should not delete an event, when it's not found", async () => {
      findSpy = findSpy.mockImplementation((): any => undefined);
      try {
        await eventsController.remove(1, new User());
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
      }
      expect(deleteSpy).toBeCalledTimes(0);
    });
    it('should throw Forbidden Exception if user does not organizator', async () => {
      findSpy = findSpy.mockImplementation(
        (): any => new Event({ organizerId: 1 }),
      );
      try {
        await eventsController.remove(1, new User({ id: 2 }));
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }
      expect(deleteSpy).toBeCalledTimes(0);
    });
    it('should delete event', async () => {
      findSpy = findSpy.mockImplementation(
        (): any => new Event({ organizerId: 1 }),
      );
      try {
        const res = await eventsController.remove(1, new User({ id: 1 }));
        expect(res).toBeNull();
      } catch (err) {}
      expect(deleteSpy).toBeCalledTimes(1);
    });
  });
});
