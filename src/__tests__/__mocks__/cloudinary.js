import { vi } from 'vitest';

export const v2 = {
  config: vi.fn(),
  uploader: {
    upload: vi.fn().mockResolvedValue({
      secure_url: 'https://res.cloudinary.com/test/image/upload/v1234567890/test.jpg',
      public_id: 'test_public_id',
      width: 800,
      height: 600,
      format: 'jpg',
    }),
    upload_stream: vi.fn((options, callback) => {
      const stream = {
        on: vi.fn(),
        write: vi.fn(),
        end: vi.fn(() => {
          if (callback) {
            callback(null, {
              secure_url: 'https://res.cloudinary.com/test/image/upload/v1234567890/test.jpg',
              public_id: 'test_public_id',
            });
          }
        }),
      };
      return stream;
    }),
    destroy: vi.fn().mockResolvedValue({ result: 'ok' }),
  },
  api: {
    delete_resources: vi.fn().mockResolvedValue({ deleted: {} }),
    resource: vi.fn().mockResolvedValue({
      public_id: 'test_public_id',
      secure_url: 'https://res.cloudinary.com/test/image/upload/v1234567890/test.jpg',
    }),
  },
};

export default { v2 };
