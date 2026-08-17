import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import Groq from 'groq-sdk';

// Mock the Groq SDK client
const mockCreate = jest.fn();
jest.mock('groq-sdk', () => {
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    };
  });
});

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatService],
    }).compile();

    service = module.get<ChatService>(ChatService);
    mockCreate.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('chat', () => {
    it('should block prescription drugs and return safety response immediately', async () => {
      // Amoxicillin is in the blocked list
      const result = await service.chat('Can you recommend amoxicillin?', []);
      
      expect(result.reply).toContain('Amoxicillin is a prescription medication');
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should call Groq completion API with correct parameters including the specdec model', async () => {
      const mockResult = {
        choices: [
          {
            message: {
              content: 'Please use paracetamol for mild headaches.',
            },
          },
        ],
      };
      mockCreate.mockResolvedValue(mockResult);

      const result = await service.chat('What OTC medicine should I take for headache?', []);

      expect(result.reply).toBe('Please use paracetamol for mild headaches.');
      expect(mockCreate).toHaveBeenCalledTimes(1);

      // Verify completion parameters
      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.model).toBe('openai/gpt-oss-20b');
      expect(callArgs.max_tokens).toBe(500);

      // Verify system prompt is passed
      const systemMessage = callArgs.messages.find((m: any) => m.role === 'system');
      expect(systemMessage).toBeDefined();
      expect(systemMessage.content).toContain('Formatting rules:');
      expect(systemMessage.content).toContain('NEVER use markdown tables.');
    });

    it('should return fallback message if Groq API fails', async () => {
      mockCreate.mockRejectedValue(new Error('Groq connection timeout'));

      const result = await service.chat('Hello', []);

      expect(result.reply).toBe('Sorry, I am currently unavailable. Please try again.');
    });
  });
});
