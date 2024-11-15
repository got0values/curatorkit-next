import momentTimezone from "moment-timezone";

export function getInputLibraryTimezoneDateStart(inputDate: string, libraryTimezone: string){
  return momentTimezone.tz(inputDate, libraryTimezone).startOf('day').utc().toDate();
};

export function getInputLibraryTimezoneDateEnd(inputDate: string, libraryTimezone: string){
  return momentTimezone.tz(inputDate, libraryTimezone).endOf('day').utc().toDate();
};

export function getCurrentLibraryTimezoneDateStart(libraryTimezone: string){
  let startOfDay = momentTimezone().tz(libraryTimezone!).startOf("day");
  return startOfDay.toDate();
};

export function getCurrentLibraryTimezoneDateEnd(libraryTimezone: string){
  let endOfDay = momentTimezone().tz(libraryTimezone!).endOf("day");
  return endOfDay.toDate();
};

export function getCurrentUTCDateString(){
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function getCurrentUTCDateStart(){
  return momentTimezone().utc().startOf("day").toDate()
};

export function getCurrentUTCDateEnd(){
  return momentTimezone().utc().endOf("day").toDate()
};