export type AppointmentStatus = 'pendiente' | 'confirmada' | 'completada' | 'cancelada';

export interface Branch {
  id: string;
  name: string;
  shortName: string;
  address: string;
  villageOrSector: string; // Elixir o Aldea El Esfuerzo
  municipality: string; // Sabá
  department: string; // Colón
  phone: string;
  whatsapp: string;
  scheduleWeekdays: string;
  scheduleWeekend: string;
  active: boolean;
  mapQuery: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  barberId: string;
  barberName: string;
  branchId: string;
  branchName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number; // En Lempiras (L.)
  durationMinutes: number;
  category: 'cortes' | 'barba' | 'combos' | 'tratamientos';
  popular?: boolean;
  active: boolean;
  iconName?: string;
}

export interface BarberProfile {
  id: string;
  name: string;
  role: string;
  specialties: string;
  rating: number;
  reviewsCount: number;
  available: boolean;
  avatarUrl: string;
  bio: string;
  yearsExperience: number;
  assignedBranchId?: 'all' | 'local-1' | 'local-2';
  assignedBranchName?: string;
}

export interface ShopInfo {
  name: string;
  tagline: string;
  currency: string;
  currencySymbol: string;
  phone: string;
  whatsapp: string;
  department: string;
  municipality: string;
  announcement: string;
}
