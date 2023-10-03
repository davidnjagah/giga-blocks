import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/application';
import { UpdateSchoolDto } from './dto/update-schools.dto';
import { PrismaAppService } from 'src/prisma/prisma.service';
import { ListSchoolDto } from './dto/list-schools.dto';
import { paginate } from 'src/utils/paginate';
import { QueueService } from 'src/mailer/queue.service';
import { getBatchandAddressfromSignature } from 'src/utils/web3/wallet';
import { Role } from '@prisma/application';
import { MintQueueDto, MintQueueSingleDto } from './dto/mint-queue.dto';

@Injectable()
export class SchoolService {
  constructor(private prisma: PrismaAppService, private readonly queueService: QueueService) {}

  async findAll(query: ListSchoolDto) {
    const { page, perPage } = query;
    const where: Prisma.SchoolWhereInput = {
      deletedAt: null,
    };

    return paginate(
      this.prisma.school,
      { where },
      {
        page,
        perPage,
      },
    );
  }

  async queueOnchainData(data: number) {
    return this.queueService.sendTransaction(data);
  }

  async checkAdmin(address: string) {
    return true;
    const admin = await this.prisma.user.findUnique({
      where: {
        walletAddress: Buffer.from(address),
      },
    });
    if (Role.ADMIN in admin.roles) {
      return true;
    }
    throw new UnauthorizedException('You are not an admin');
  }

  async checkAdminandMintQueue(MintData: MintQueueDto) {
    const { batch, address } = getBatchandAddressfromSignature(MintData.signatureWithData);

    if (await this.checkAdmin(address)) {
      return this.queueService.sendMintNFT(batch, address, MintData);
    }
  }

  async checkAdminandSingleMintQueue(MintData: MintQueueSingleDto) {
    const { batch, address } = getBatchandAddressfromSignature(MintData.signatureWithData);
    return this.queueService.sendSingleMintNFT(batch, address, MintData);
  }

  async findOne(id: string) {
    return await this.prisma.school.findUnique({
      where: {
        id,
      },
    });
  }

  async byCountry(country: string) {
    const firstLetter = country.charAt(0);
    if (firstLetter === firstLetter.toUpperCase()) {
      return await this.prisma.school.findMany({
        where: {
          country: country,
        },
      });
    } else {
      const capitalizedLetter = firstLetter.toUpperCase();
      const restOfTheString = country.slice(1);
      return await this.prisma.school.findMany({
        where: {
          country: `${capitalizedLetter}${restOfTheString}`,
        },
      });
    }
  }

  update(id: number, updateSchoolDto: UpdateSchoolDto) {
    return `This action updates a #${id} school`;
  }

  async removeAll() {
    return await this.prisma.school.deleteMany();
  }
}
