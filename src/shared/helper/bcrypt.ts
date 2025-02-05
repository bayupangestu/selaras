import * as bcrypt from 'bcryptjs';
export function bcryptHasPassword(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

export function bcryptCompare(password, encryptPassword) {
  return bcrypt.compareSync(password, encryptPassword);
}
