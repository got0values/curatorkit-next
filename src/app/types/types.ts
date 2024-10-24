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