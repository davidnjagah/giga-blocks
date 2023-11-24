import { PrismaClient } from '@prisma/application';
import * as fs from 'fs';
interface SchoolData {
  schoolName: string;
  schoolType: string;
  country: string;
  longitude: number;
  latitude: number;
  connectivity: boolean;
  electricity_availabilty: boolean;
  coverage_availabitlity: string;
}

export async function handler(
  field: string,
  fileData: any,
  filename: string,
  encoding: string,
  mimetype: string,
  user: any,
): Promise<any> {
  try {
    const prisma = new PrismaClient();
    const chunks: any[] = [];
    //process the file data as it's streamed
    fileData.on('data', (chunk: any) => {
      chunks.push(chunk);
    });
    const userdata = user;
    let uploadBatch;

    uploadBatch = await new Promise((resolve, reject) => {
      fileData.on('end', async () => {
        // Now you can process the  file as needed
        const fileContent = Buffer.concat(chunks).toString();
        // Process the fileContent here

        const rows = fileContent.trim().split('\n').slice(1);
        await prisma.cSVUpload
          .create({
            data: {
              uploadedBy: userdata.id,
              fileValue: rows,
              fileName: filename,
            },
          })
          .then(async res => {
            uploadBatch = res;
            for (const row of rows) {
              const [
                schoolName,
                longitudeStr,
                latitudeStr,
                schoolType,
                country,
                connectivity,
                coverage_availabitlity,
                electricity_availabilty,
              ] = row.split(',');

              const longitude = parseFloat(longitudeStr);
              const latitude = parseFloat(latitudeStr);

              if (isNaN(longitude) || isNaN(latitude)) {
                console.error(`Invalid longitude or latitude for school "${schoolName}"`);
                throw new Error('Invalid longitude or latitude');
              }

              const schoolData: SchoolData = {
                schoolName,
                schoolType,
                country,
                longitude,
                latitude,
                connectivity: Boolean(connectivity),
                coverage_availabitlity,
                electricity_availabilty: Boolean(electricity_availabilty),
              };

              await prisma.school.create({
                data: {
                  name: schoolData.schoolName,
                  school_type: schoolData.schoolType,
                  longitude: schoolData.longitude,
                  latitude: schoolData.latitude,
                  connectivity: schoolData.connectivity as boolean,
                  electricity_available: schoolData.electricity_availabilty as boolean,
                  coverage_availability: schoolData.coverage_availabitlity,
                  country: country,
                  uploadId: res.id,
                  createdById: userdata.id,
                },
              });

              console.log(`School "${schoolName}" saved to the database.`);
            }
            resolve(res);
            return res;
          })
          .catch(error => {
            console.log(error);
          });
      });
    });

    return uploadBatch;

    // console.log('CSV data import completed.');
  } catch (error) {
    console.error('Error reading or saving CSV data:', error);
  }
}