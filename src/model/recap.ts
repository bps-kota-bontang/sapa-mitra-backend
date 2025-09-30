import { POK } from "./activity";

export type RecapPdf = {
  activity: {
    main: string;
    name: string;
    category: string;
    unit: string;
  };
  period: {
    month: string;
    year: string;
  };
  region: string;
  pok: POK;
  partners: {
    number: number;
    name: string;
    gol: string;
    npwp: string;
    rate: string;
    volume: number;
    total: number;
    tax: number;
    grandTotal: number;
    accountNumber: string;
  }[];
  grandTotal: {
    nominal: string;
    spell: string;
    volume: number;
    tax: string;
  };
  authority: {
    name: string;
    nip: string;
  };
  treasurer: {
    name: string;
    nip: string;
  };
  user: {
    name: string;
    nip: string;
  };
};
