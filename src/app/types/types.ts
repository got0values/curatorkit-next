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
    equipment_ids: string | never[];
    tags: string | never[];
    showroom: boolean | null;
  }

  export type GetEventsReturnType = {
    events: EventType[];
    eventtypes: {
      id: number;
      color: string;
      name: string;
    }[];
    eventrooms: {
      id: number;
      name: string;
    }[];
    equipment: {
      id: number;
      name: string;
    }[];
    eventforms: {
      id: number;
      title: string | null;
      form_schema: string | null;
      date_created: Date | null;
      attendees: number | null;
      waitinglist: number | null;
    }[];
    eventformdata: {
      id: number;
      form_id: number;
      form_data: string | null;
    }[];
    subdomain: string | undefined;
    eventsTwo: {
      id: number;
      title: string;
      allDay: boolean;
      start: string;
      end: string;
    }[];
    eventscount: number;
  }