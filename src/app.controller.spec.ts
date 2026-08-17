import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseService } from './shared/firebase/firebase.service';

describe('AppController', () => {
  let appController: AppController;

  const mockFirebaseService = {
    getAdmin: jest.fn().mockReturnValue({
      setCustomUserClaims: jest.fn().mockResolvedValue(true),
      getUser: jest.fn().mockResolvedValue({ customClaims: { role: 'admin' } }),
    }),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: FirebaseService, useValue: mockFirebaseService },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
