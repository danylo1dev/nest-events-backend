import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-auth.dto';
import { User } from './entities/user.entity';

@Controller('/user')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const { password, retypedPassword, ...data } = createUserDto;
    if (password !== retypedPassword) {
      throw new BadRequestException();
    }

    const existingUser = await this.userRepository.findOne({
      where: [
        {
          email: createUserDto.email,
        },
        {
          username: createUserDto.username,
        },
      ],
    });
    if (existingUser) {
      throw new BadRequestException(
        'User with email or username alredy exist ',
      );
    }
    const hashedPassword = await this.authService.hashPassword(password);
    const user = {
      ...data,
      password: hashedPassword,
    };
    const createdUser = await this.userRepository.save(user);
    return {
      ...createdUser,
      token: await this.authService.getTokenForUser(createdUser),
    };
  }
}
