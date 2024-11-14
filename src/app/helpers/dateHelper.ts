import momentTimezone from "moment-timezone";

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
  const currentUTCDateString = getCurrentUTCDateString();
  const currentUTCDateStart = `${currentUTCDateString} 00:00:00`;
  return new Date(currentUTCDateStart);
};

export function getCurrentUTCDateEnd(){
  const currentUTCDateString = getCurrentUTCDateString();
  const currentUTCDateStart = `${currentUTCDateString} 23:59:59`;
  return new Date(currentUTCDateStart);
};