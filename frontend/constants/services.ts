export interface Service {
  id: string;
  name: string;
  duration: number;
}

export const SERVICES: Service[] = [
  { id: "teeth-cleaning", name: "Teeth Cleaning", duration: 60 },
  { id: "dental-consultation", name: "Dental Consultation", duration: 30 },
  { id: "cavity-filling", name: "Cavity Filling", duration: 45 },
  { id: "teeth-whitening", name: "Teeth Whitening", duration: 90 },
  { id: "emergency", name: "Emergency", duration: 30 },
];
