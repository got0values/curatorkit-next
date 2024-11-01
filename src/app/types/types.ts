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