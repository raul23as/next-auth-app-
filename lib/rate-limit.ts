// Rate limiting for login attempts
interface LoginAttempt {
  count: number;
  lastAttempt: number;
  blockedUntil?: number;
}

const attempts = new Map<string, LoginAttempt>();

const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes
const BLOCK_DURATION = 30 * 60 * 1000; // 30 minutes

export function isBlocked(email: string): boolean {
  const attempt = attempts.get(email);
  if (!attempt) return false;

  if (attempt.blockedUntil && attempt.blockedUntil > Date.now()) {
    return true;
  }

  // Reset if outside the attempt window
  if (Date.now() - attempt.lastAttempt > ATTEMPT_WINDOW) {
    attempts.delete(email);
    return false;
  }

  return false;
}

export function recordFailedAttempt(email: string): number {
  const attempt = attempts.get(email) || {
    count: 0,
    lastAttempt: Date.now(),
  };

  attempt.count++;
  attempt.lastAttempt = Date.now();

  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.blockedUntil = Date.now() + BLOCK_DURATION;
  }

  attempts.set(email, attempt);
  return attempt.count;
}

export function resetAttempts(email: string): void {
  attempts.delete(email);
}

export function getAttemptInfo(email: string) {
  return attempts.get(email);
}
