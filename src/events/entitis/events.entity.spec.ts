import { Event } from './event.entity';

test('Event should be initialized through constructor', () => {
  const expectEvent = {
    name: 'Interesting event',
    description: 'That will funn',
  };

  const event = new Event({
    ...expectEvent,
  });
  expect(event).toEqual({
    ...expectEvent,
    id: undefined,
    when: undefined,
    address: undefined,
    attendees: undefined,
    organizerId: undefined,
    attendeeCount: undefined,
    attendeeRejected: undefined,
    attendeeMaybe: undefined,
    attendeeAccepted: undefined,
  });
});
