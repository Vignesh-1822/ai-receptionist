export interface Booking {
  id: string;
  customer_name: string;
  phone_number: string;
  service: string;
  date: string;
  time: string;
  status: string;
  created_at: string;
  call_id?: string;
}
