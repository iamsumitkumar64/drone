import { HttpStatus } from '@nestjs/common';

export class InvalidCredentialsException extends Error {
  readonly statusCode = HttpStatus.UNAUTHORIZED;

  constructor() {
    super('Mismatched email or password');
    this.name = this.constructor.name;
  }
}