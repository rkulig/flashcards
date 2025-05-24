import type { AuthRequestDto } from "../../types";

/**
 * Response interface for authentication service
 */
export interface AuthResponse {
  userId: string;
  token: string;
}

/**
 * Authentication service providing mock implementation
 * In production, this would integrate with Supabase Auth or other authentication providers
 */
export class AuthService {
  /**
   * Mock authentication method
   * Always returns success for demonstration purposes
   *
   * @param requestDto - Validated authentication request data
   * @returns Promise with mock authentication data
   */
  async authenticate(requestDto: AuthRequestDto): Promise<AuthResponse> {
    // Simulate async operation delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Generate mock response based on email to make it deterministic
    const userId = `mock-user-${requestDto.email.split("@")[0]}`;
    const token = `mock-jwt-token-${Date.now()}`;

    return {
      userId,
      token,
    };
  }
}

/**
 * Create a new instance of AuthService
 * In the future, this could accept configuration or dependencies
 */
export const createAuthService = (): AuthService => {
  return new AuthService();
};
