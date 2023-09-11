import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { hexStringToBuffer } from '../utils/string-format';

@Injectable()
export class UsersService {
  private readonly _logger = new Logger('User Services');
  constructor(private prisma: PrismaService) {}

  async register(createUserDto: CreateUserDto) {
    this._logger.log(`Registering new user: ${createUserDto?.email}`);
    const walletAddress = hexStringToBuffer(createUserDto?.walletAddress);
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        walletAddress,
      },
    });
  }

  async addValidator(createUserDto: CreateUserDto) {
    this._logger.log(`Creating new user: ${createUserDto?.email}`);
    const walletAddress = hexStringToBuffer(createUserDto?.walletAddress);
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        walletAddress,
        roles: ['VALIDATOR'],
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    this._logger.log(`Updating user: ${id}`);
    return `This action updates a #${id} user with payload ${updateUserDto}`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async findOneByEmail(email: string): Promise<any> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async requestValidator(createUserDto: CreateUserDto) {
    return await this.prisma.user.create({
      data: {
        email: createUserDto?.email,
        roles: ['PENDING'],
        name: createUserDto?.name,
      },
    });
  }

  async approveValidator(id: string) {
    return await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        roles: ['VALIDATOR'],
      },
    });
  }
}