import { HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends Error {
  readonly statusCode = HttpStatus.NOT_FOUND;

  constructor() {
    super('User not found with this email');
    this.name = this.constructor.name;
  }
}