'use server'

import {tokenCookieToLibraryId} from '../helpers/tokenCookieToUserId';
import { PrismaClient } from '@prisma/client';
import { ServerResponseType } from '../types/types';
import momentTimezone from 'moment-timezone';

const prisma = new PrismaClient()

export async function getCompSignIns(): Promise<ServerResponseType> {
  try {
    const libraryId = await tokenCookieToLibraryId();
    if (!libraryId) {
      return {success: false, message: "unauthorized"}
    }

    const library = await prisma.library.findUnique({
      where: {
        id: libraryId
      }
    })
    if (!library) {
      return {success: false, message: "Unauthorized"}
    }

    const libraryTimezone = library?.timezone;
    const now = momentTimezone().tz(libraryTimezone!);
    const currentDate = now.format('YYYY-MM-DD');

    let computers = await prisma.computers.findMany({
      where: {
        library: libraryId
      }
    })

    let compCard = [];
    for (var computer of computers) {
      let compSignIns = await prisma.compSignIns.findFirst({
        where: {
          library: libraryId,
          computer: computer.id,
          name: {
            not: ""
          },
          datetimeout: null
        }
      })
      if (compSignIns) {
        compCard.push({
          id: computer.id,
          name: computer.name,
          signindata: {
            transid: compSignIns.transid,
            name: compSignIns.name,
            length: compSignIns.length,
            timein: compSignIns.datetimein,
            timeout: compSignIns.datetimeout,
            datetimein: compSignIns.datetimein
            }
        })
      }
      else {
        compCard.push({
          id: computer.id,
          name: computer.name
        })
      }
    }

  // computers = db.execute(select(Computers).where(Computers.userId==userid))
  // computers = computers.fetchall()
  // compcard = []
  // if len(computers):
  //   for computer in computers:
  //     compsignins = db.execute(
  //       select(
  //         CompSignIns.transid,
  //         CompSignIns.name,
  //         CompSignIns.length,
  //         func.DATE_FORMAT(CompSignIns.datetimein, '%H:%i'),
  //         func.DATE_FORMAT(CompSignIns.datetimeout, '%H:%i'),
  //         func.DATE_FORMAT(CompSignIns.datetimein, '%Y-%m-%d %H:%i'))
  //     .where(
  //       CompSignIns.computer==computer[0],
  //       CompSignIns.userId==userid,
  //       CompSignIns.name.is_not(None),
  //       CompSignIns.datetimeout==None).order_by(func.convert_tz(CompSignIns.datetimein,'UTC',local_time_zone).desc()).limit(1))
  //     compsignins = compsignins.fetchall()
  //     if len(compsignins):
  //       compcard.append({
  //         "id": computer[0],
  //         "name": computer[2],
  //         "signindata": dict({
  //           "transid": compsignins[0][0],
  //           "name": compsignins[0][1],
  //           "length": compsignins[0][2],
  //           "timein": compsignins[0][3],
  //           "timeout": compsignins[0][4],
  //           "datetimein": compsignins[0][5]
  //           })
  //       })
  //     else:
  //       compcard.append({
  //         "id": computer[0],
  //         "name": computer[2]
  //       })

    await prisma.$disconnect();
    return {
      success: true, 
      message: "Success", 
      data: compCard
    }
  }
  catch(res) {
    console.error(res)
    await prisma.$disconnect();
    return {success: false, message: "Failed to get computer sign-ins.", data: null}
  }
}