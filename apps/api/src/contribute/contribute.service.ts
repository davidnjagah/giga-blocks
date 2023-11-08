import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateContributeDatumDto } from './dto/create-contribute-datum.dto';
import { UpdateContributeDatumDto } from './dto/update-contribute-datum.dto';
import { PrismaAppService } from '../prisma/prisma.service';
import { Status } from '@prisma/application';
import { MailService } from 'src/mailer/mailer.service';
import { paginate } from 'src/utils/paginate';
import { Prisma } from '@prisma/application';

@Injectable()
export class ContributeDataService {
  private readonly _logger = new Logger(ContributeDataService.name);

  constructor(private prisma: PrismaAppService, private mailService: MailService) {}

  async create(createContributeDatumDto: CreateContributeDatumDto, userId: string) {
    const createdData = await this.prisma.contributedData.create({
      data: { contributedUserId: userId, ...createContributeDatumDto },
    });
    return createdData;
  }

  async findAll(query) {
    const { page, perPage, schoolId, contributorId } = query;
    const where: Prisma.ContributedDataWhereInput = {};
    if (schoolId) {
      where.school_Id = schoolId;
    }
    if (contributorId) {
      where.contributedUserId = contributorId;
    }

    const args = {
      where: where,
      include: {
        contributedUser: {
          select: {
            name: true,
          },
        },
        school: {
          select: {
            name: true,
          },
        },
      },
    };

    const contributedata = await paginate(
      this.prisma.contributedData,
      { ...args },
      {
        page,
        perPage,
      },
    );
    return contributedata;
  }

  async findOne(id: string) {
    const data = await this.prisma.contributedData.findUnique({
      where: { id: id },
      include: {
        contributedUser: {
          select: {
            name: true,
          },
        },
        school: {
          select: {
            name: true,
          },
        },
      },
    });
    if (!data) {
      throw new NotFoundException('Contributed data with such ID not found');
    }
    return data;
  }

  async update(id: string, updateContributeDatumDto: UpdateContributeDatumDto) {
    const updatedData = await this.prisma.contributedData.update({
      where: { id: id },
      data: updateContributeDatumDto,
    });
    return updatedData;
  }

  async remove(id: string) {
    const deletedData = await this.prisma.contributedData.delete({
      where: { id: id },
    });
    if (deletedData) {
      return 'Contributed data deleted successfully.';
    }
  }

  async validate(id: string, isValid: boolean, userId: string) {
    try {
      const contributedData = await this.prisma.contributedData.findUnique({
        where: { id: id },
        include: {
          contributedUser: {
            select: {
              name: true,
              email: true,
            },
          },
          school: {
            select: {
              name: true,
            },
          },
        },
      });
      let transaction;
      if (!contributedData) {
        throw new NotFoundException('Contributed data with such ID not found');
      }
      if (isValid) {
        transaction = await this.updateContribution(id, contributedData, userId);
      } else {
        transaction = await this.prisma.$transaction([
          this.prisma.contributedData.update({
            data: { status: Status.Rejected, validatedBy: userId },
            where: { id: id },
          }),
        ]);
      }
      return transaction;
    } catch (error) {
      this._logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  private async updateContribution(id: string, contributedData: any, userId: string) {
    let transaction;
    const validateddata = await this.prisma.validatedData.findFirst({
      where: {
        school_Id: contributedData.school_Id,
        isArchived: false,
      },
    });
    if (!validateddata) {
      const data = {
        school_Id: contributedData.school_Id,
        data: JSON.parse(contributedData.contributed_data),
        contributed_data: [id],
      };
      transaction = await this.prisma.$transaction([
        this.prisma.contributedData.update({
          data: { status: Status.Validated, validatedBy: userId },
          where: { id: id },
        }),
        this.prisma.validatedData.create({
          data,
        }),
      ]);
    } else {
      const existingData = validateddata.data as any;
      const newData = JSON.parse(contributedData.contributed_data as any);
      const mergedData = { ...existingData, ...newData };
      transaction = await this.prisma.$transaction([
        this.prisma.contributedData.update({
          data: { status: Status.Validated, validatedBy: userId },
          where: { id: id },
        }),
        this.prisma.validatedData.update({
          data: {
            data: mergedData,
            contributed_data: [...validateddata.contributed_data, id],
          },
          where: { id: validateddata.id },
        }),
      ]);
    }
    if (contributedData.contributedUser.email) {
      this.mailService.dataValidationEmail({
        email: contributedData.contributedUser.email,
        name: contributedData.contributedUser.name,
        school: contributedData.school.name,
      });
    }
    return transaction;
  }
}
