import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CpfCnpj } from '../domain/cpf-cnpj.vo';

@ValidatorConstraint({ name: 'IsCpfCnpj', async: false })
export class IsCpfCnpjConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value === 'string' && CpfCnpj.isValid(value);
  }

  defaultMessage(): string {
    return 'documento deve ser um CPF ou CNPJ válido';
  }
}

export function IsCpfCnpj(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCpfCnpjConstraint,
    });
  };
}
