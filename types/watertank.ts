export interface Booking {
  id: string;
  name: string;
  serviceType: 'WATER_TANKER' | 'DUSTBIN_VAN';
  bookingDate: Date;
  amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  address: string;
  phone: string;
  user: { name: string | null; id: string };
}

export interface Fee {
  id: string;
  serviceType: 'WATER_TANKER' | 'DUSTBIN_VAN';
  amount: number;
}