import { Injectable, BadRequestException, PipeTransform } from '@nestjs/common';
import { isDefined, isEnum } from 'class-validator';

@Injectable()
export class EnumValidationPipe implements PipeTransform {
  //eslint-disable-next-line  @typescript-eslint/no-explicit-any
  constructor(private enumEntity: any) {}

  //eslint-disable-next-line  @typescript-eslint/no-explicit-any
  transform(value: any) {
    if (!isDefined(value)) {
      throw new BadRequestException(
        `a query value of either ${Object.values(this.enumEntity).join(
          ', ',
        )} is required`,
      );
    }
    if (isEnum(value, this.enumEntity)) {
      return this.enumEntity[value];
    } else {
      const errorMessage = `the value '${value}' is not a valid enum value of ${
        this.enumEntity.constructor.name
      } enum. Acceptable value must be one of: ${Object.values(
        this.enumEntity,
      ).join(', ')}`;
      throw new BadRequestException(errorMessage);
    }
  }
}
