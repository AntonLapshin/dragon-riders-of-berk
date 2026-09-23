import { describe, expect, it } from 'vitest';
import { sleep } from './sleep';

describe('sleep', () => {
  it('resolves after the delay', async () => {
    await expect(sleep(5)).resolves.toBeUndefined();
  });

  it('resolves immediately for zero ms', async () => {
    await expect(sleep(0)).resolves.toBeUndefined();
  });
});
