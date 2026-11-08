import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Placa } from '../domain/placa.vo';

@ValidatorConstraint({ name: 'IsPlaca', async: false })
export class IsPlacaConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value === 'string' && Placa.isValid(value);
  }

  defaultMessage(): string {
    return 'placa deve estar no formato antigo (AAA9999) ou Mercosul (AAA9A99)';
  }
}

export function IsPlaca(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPlacaConstraint,
    });
  };
}
