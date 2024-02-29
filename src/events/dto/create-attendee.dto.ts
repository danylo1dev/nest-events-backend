import { IsEnum } from 'class-validator';
import { AttendeeAnswerEnum } from '../entitis/attendee.entity';

export class CreateAttendeeDto {
  @IsEnum(AttendeeAnswerEnum)
  answer: AttendeeAnswerEnum;
}
