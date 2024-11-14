export type ServerResponseType = {
  success: boolean;
  message: string;
  data?: any | null;
  tokens?: number | undefined;
}

export type Library = {
  id: number;
  name: string;
  subdomain: string;
  timezone: string;
  created_on: Date;
}

export type User = {
  id: number;
  email: string;
  library: number;
  Library: Library;
}

export type SignInListType = {
  id: number;
  name: string;
}

export type SignInType = {
  library: number;
  name: string | null;
  transId: number;
  listId: number;
  card: string;
  datetime: Date;
  notes: string | null;
  listIdName?: string;
}

export type NameListType = {
  card: string;
  name: string;
}

export type EventType = {
  transid: number;
  roomid: number | null;
  room: {
      id: number;
      name: string;
      library: number;
  } | null;
  event: string;
  reservedate: string;
  reservestart: string;
  eventstart: string;
  eventend: string;
  reserveend: string;
  notes: string;
  eventhidden: boolean | null;
  typeid: number | null,
  type: {
    id: number;
    library: number;
    name: string;
    color: string;
  } | null;
  description: string | null;
  formid: number | null,
  displaystart: string | null,
  displayend: string | null,
  formmeta: {
    id: number;
    title: string | null;
    form_schema: string | null;
    date_created: Date | null;
    attendees: number | null;
    waitinglist: number | null;
  } | null;
  formdata: {
    id: number;
    form_id: number;
    form_data: string | null;
  }[];
  equipment_ids: string[] | [];
  tags: string[] | [];
  showroom: boolean | null;
}

export type EventRoomType = {
  id: number;
  name: string;
}

export type EventFormType = {
  id: number;
  title: string | null;
  form_schema: string | null;
  form_ui_schema: string | null;
  date_created: Date | null;
  attendees: number | null;
  waitinglist: number | null;
}

export type EditEventPageFormDataType = {
  eventName: string | null;
  roomId: number | null;
  typeId: number | null;
  reserveDate: string | null;
  reserveStart: string | null;
  reserveEnd: string | null;
  eventStart: string | null;
  eventEnd: string | null;
  notes: string | null;
  eventDescription: string | null;
  eventHidden: boolean | null;
  transId: number | null;
  registrationForm: number | null;
  displayStart: string | null;
  displayEnd: string | null;
  equipment_ids: string[] | [];
  tags: string[] | [];
  showRoom: boolean | null;
}

export type EquipmentType = {
  id: number;
  name: string;
}

export type EventTypeType = {
  id: number;
  color: {
    hex: string;
    rgb: string;
  };
  name: string;
}

export type EventsTwoType = {
  id: number;
  title: string;
  allDay: boolean;
  start: string;
  end: string;
}

export type GetEventsReturnType = {
  events: EventType[];
  eventtypes: EventTypeType[];
  eventrooms: EventRoomType[];
  equipment: EquipmentType[];
  eventforms: EventFormType[];
  eventformdata: {
    id: number;
    form_id: number;
    form_data: string | null;
  }[];
  subdomain: string | undefined;
  eventsTwo: EventsTwoType[];
  eventscount: number;
}

export type ColorType = {
  hex: string;
  rgb: string;
}

export type HeaderInfoType = {
  address_one: string;
  address_two: string;
  phone: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export type CustomSettingsType = {
  id: number;
  show_event_calendar: number;
  show_request_study_room: number;
  show_reading_club: number;
  header_info: HeaderInfoType | null;
  library: number;
  big_calendar_view: boolean;
  library_url: string;
  allow_dark_mode: boolean;
  primary_color: ColorType;
  secondary_color: ColorType;
  keep_accordions_open: number;
  logo: string;
} | null

export type BigCalendarEventsType = {
  typeColor: string;
  reservestart: string;
  eventstart: string;
  eventend: string;
  reserveend: string;
  displaystart: string | null;
  displayend: string | null;
  tags: any;
  equipment: any;
  title: string;
  form_id: number | null;
}

export type EventDataType = {
  reservestart: string;
  eventstart: string;
  eventend: string;
  reserveend: string;
  displaystart: string | null;
  displayend: string | null;
  tags: any;
  equipment: any;
  transid: number;
  library: number;
  eventname: string;
  description: string;
  form_id: number | null;
  eventtype: number;
  
  showroom: boolean | null;
  roomName: string;
  eventTypeName: string;
  eventTypeColor: string;
  numberRegistered: number;
  attendees: number;
  waitingList: number;
  registrationType: string;
}

export type SetFormType = {
  formid: string; 
  formschema: string;
  formuischema: string | null;
  formeventtypename: string; 
  formeventtypeid: string;
}

export type StudyRoomFormDataType = {
  id: number;
  library: number;
  form_id: number;
  form_data: string | null;
  study_room_name: string | null;
  study_room_id: number;
  request_datetime_from: Date;
  request_datetime_to: Date;
  datetime_submitted: Date;
  confirmed: number | null;
}

export type StudyRoomType = {
  id: number;
  library: number;
  name: string;
  description: string | null;
  form: number | null;
  minimum_capacity: number | null;
  maximum_capacity: number | null;
}

export type StudyRoomDTOType = {
  id: number;
  library: number;
  name: string;
  description: string | null;
  form: string;
  formId: number | null;
  minimum_capacity: number | null;
  maximum_capacity: number | null;
}

export type ReserveFormType = {
  id: number;
  library: number;
  title: string | null;
  form_schema: string | null;
  form_ui_schema: string | null;
  date_created: Date | null;
}

export type EventFormDataType = {
  id: number;
  library: number;
  form_id: number;
  form_data: string | null;
  datetime: Date;
  eventtypename: string | null;
  eventtypeid: number | null;
}

export type CompCardDataType = {
  id: number;
    name: string;
    signindata: {
        transid: number;
        name: string;
        length: number;
        timein: string;
        timeout: string;
        datetimein: string;
    };
}

export type ComputerType = {
  id: number;
  name: string;
  library: number;
}

export type ComputSignInDataType = {
  name: string | undefined;
  datetimein: string;
  datetimeout: string;
  transid: number;
  library: number;
  barcode: string | null;
  computer: number;
  computerName: string;
  length: number;
  notes: string | null;
}

export type CheckoutItemType = {
  id: number;
  name: string;
  library: number;
}

export type CheckoutTypes = {
  item: string | undefined;
  id: number;
  library: number;
  card: string;
  name: string | null;
  checked_out: Date;
  returned: Date | null;
}