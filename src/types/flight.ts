export interface Flight {
  id: string;
  airline: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  stops: number;
  price: number;
}

export interface SearchParams {
  from: string;
  to: string;
  departure: string;
  passengers: number;
}
