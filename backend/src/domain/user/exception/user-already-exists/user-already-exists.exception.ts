import { HttpStatus } from '@nestjs/common';

export class UserAlreadyExistsException extends Error {
  readonly statusCode = HttpStatus.CONFLICT;

  constructor(email: string) {
    super(`User already exists with email: ${email}`);
    this.name = this.constructor.name;
  }
}