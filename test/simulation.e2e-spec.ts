import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Simulation (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should start a simulation', async () => {
    const response = await request(app.getHttpServer())
      .post('/simulation/start')
      .send({ name: 'Qatar 2022' })
      .expect(201);

    expect(response.body).toMatchObject({
      name: 'Qatar 2022',
      status: 'running',
    });
  });

  it('should reject invalid simulation name', async () => {
    await request(app.getHttpServer())
      .post('/simulation/start')
      .send({ name: 'Q#2022' })
      .expect(400);
  });

  it('should finish a simulation', async () => {
    const start = await request(app.getHttpServer())
      .post('/simulation/start')
      .send({ name: 'Qatar 2022' });

    const body = start.body as { id: string };
    const id = body.id;

    const response = await request(app.getHttpServer())
      .patch(`/simulation/${id}/finish`)
      .expect(200);
    const responseBody = response.body as { status: string };
    expect(responseBody.status).toBe('completed');
  });

  it('should enforce 5 second cooldown', async () => {
    await request(app.getHttpServer())
      .post('/simulation/start')
      .send({ name: 'Qatar 2022' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/simulation/start')
      .send({ name: 'Qatar 2022' })
      .expect(429);
  });
});
