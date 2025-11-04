export interface AuthenticatedRequest extends Express.Request {
  user: {
    userId: number;
    username: string;
    role: string;
  };
}
