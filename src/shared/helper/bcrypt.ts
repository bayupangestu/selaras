import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { FB } from 'fb';

export function bcryptHasPassword(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

export function bcryptCompare(password, encryptPassword) {
  return bcrypt.compareSync(password, encryptPassword);
}
