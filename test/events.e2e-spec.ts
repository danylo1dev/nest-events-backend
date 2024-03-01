import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { Connection } from 'typeorm';
import { AppModule } from '../src/app.module';
import { User } from '../src/auth/entities/user.entity';
import {
  loadFixtures as loadFixturesBase,
  tokenForUser as tokenForUserBase,
} from './utils';

let app: INestApplication;
let mod: TestingModule;
let connection: Connection;

const loadFixtures = async (sqlFileName: string) => {
  await loadFixturesBase(connection, sqlFileName);
};

const tokenForUser = (
  user: User = new User({
    id: 1,
    username: 'e2e-test',
  }),
): string => tokenForUserBase(app, user);

beforeEach(async () => {
  mod = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = mod.createNestApplication();
  app.useGlobalPipes(new ValidationPipe());
  await app.init();

  connection = app.get(Connection);
});
afterEach(async () => {
  await app.close();
});

describe('Events (e2e)', () => {
  it('should return an empty list of events', async () => {
    return request(app.getHttpServer())
      .get('/events')
      .expect(200)
      .then((response) => {
        expect(response.body.data.length).toBe(0);
      });
  });
  it('should return a single event', async () => {
    await loadFixtures('1-event-1-user.sql');
    return request(app.getHttpServer())
      .get('/events/1')
      .expect(200)
      .then((response) => {
        console.log(response.body);
        expect(response.body.id).toBe(1);
        expect(response.body.name).toBe('Interesting Party');
      });
  });
  it('should retrn a list of (2) events', async () => {
    await loadFixtures('2-events-1-user.sql');
    return request(app.getHttpServer())
      .get('/events?limit=3')
      .expect(200)
      .then(({ body: { first, last, limit, total } }) => {
        expect(first).toBe(1);
        expect(last).toBe(2);
        expect(limit).toBe(3);
        expect(total).toBe(2);
      });
  });

  it('should throw an error when creating events being unauthenticated', () => {
    return request(app.getHttpServer()).post('/events').send({}).expect(401);
  });
  it('should throw an error when creating events with wrong input', async () => {
    await loadFixtures('1-user.sql');
    return await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${tokenForUser()}`)
      .send({})
      .expect(400)
      .then((res) => {
        expect(res.body).toMatchObject({
          statusCode: 400,
          message: [
            'The name length is wrong',
            'name must be a string',
            'description must be longer than or equal to 5 characters',
            'when must be a valid ISO 8601 date string',
            'address must be longer than or equal to 5 characters',
          ],
          error: 'Bad Request',
        });
      });
  });
  it('should create an event', async () => {
    await loadFixtures('1-user.sql');
    const testEvent = {
      name: 'E2e Event',
      description: 'A fake event from e2e tests',
      when: `2024-03-01T09:53:39.000Z`,
      address: 'Street 123',
    };

    return request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${tokenForUser()}`)
      .send(testEvent)
      .expect(201)
      .then(() => {
        return request(app.getHttpServer())
          .get('/events/1')
          .expect(200)
          .then((response) => {
            expect(response.body).toMatchObject({
              id: 1,
              ...testEvent,
            });
          });
      });
  });
  it('should throw an error when changing non existing event', () => {
    return request(app.getHttpServer())
      .put('/events/100')
      .set('Authorization', `Bearer ${tokenForUser()}`)
      .send({})
      .expect(404);
  });
  it('should throw an error when changing an event of other user', async () => {
    await loadFixtures('1-event-2-users.sql');

    return request(app.getHttpServer())
      .patch('/events/1')
      .set(
        'Authorization',
        `Bearer ${tokenForUser(new User({ id: 2, username: 'nasty' }))}`,
      )
      .send({
        name: 'Updated event name',
      })
      .expect(403);
  });
  it('should update an event name', async () => {
    await loadFixtures('1-event-1-user.sql');

    return request(app.getHttpServer())
      .patch('/events/1')
      .set('Authorization', `Bearer ${tokenForUser()}`)
      .send({
        name: 'Updated event name',
      })
      .expect(200)
      .then((response) => {
        expect(response.body.name).toBe('Updated event name');
      });
  });

  it('should remove an event', async () => {
    await loadFixtures('1-event-1-user.sql');

    return request(app.getHttpServer())
      .delete('/events/1')
      .set('Authorization', `Bearer ${tokenForUser()}`)
      .expect(204)
      .then(() => {
        return request(app.getHttpServer()).get('/events/1').expect(404);
      });
  });

  it('should throw an error when removing an event of other user', async () => {
    await loadFixtures('1-event-2-users.sql');

    return request(app.getHttpServer())
      .delete('/events/1')
      .set(
        'Authorization',
        `Bearer ${tokenForUser(new User({ id: 2, username: 'nasty' }))}`,
      )
      .expect(403);
  });

  it('should throw an error when removing non existing event', async () => {
    await loadFixtures('1-user.sql');

    return request(app.getHttpServer())
      .delete('/events/-1')
      .set('Authorization', `Bearer ${tokenForUser()}`)
      .expect(404);
  });
});
