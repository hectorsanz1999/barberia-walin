import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  DocumentData
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/firestoreErrors';
import { Appointment, BarberProfile, Branch, ServiceItem, ShopInfo } from '../types';

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'local-1',
    name: 'Local #1 - Elixir',
    shortName: 'Local #1 (Elixir)',
    address: 'Carretera principal hacia Sabá, Barrio Elixir',
    villageOrSector: 'Elixir',
    municipality: 'Sabá',
    department: 'Colón',
    phone: '+504 9876-5432',
    whatsapp: '50498765432',
    scheduleWeekdays: 'Lunes a Sábado: 8:00 AM - 7:30 PM',
    scheduleWeekend: 'Domingo: 9:00 AM - 2:00 PM',
    active: true,
    mapQuery: 'Elixir, Saba, Colon, Honduras'
  },
  {
    id: 'local-2',
    name: 'Local #2 - Aldea El Esfuerzo',
    shortName: 'Local #2 (El Esfuerzo)',
    address: 'Calle principal frente al parque comunal, Aldea El Esfuerzo',
    villageOrSector: 'Aldea El Esfuerzo',
    municipality: 'Sabá',
    department: 'Colón',
    phone: '+504 9555-1234',
    whatsapp: '50495551234',
    scheduleWeekdays: 'Lunes a Sábado: 8:30 AM - 7:00 PM',
    scheduleWeekend: 'Domingo: 9:00 AM - 1:00 PM',
    active: true,
    mapQuery: 'Aldea El Esfuerzo, Saba, Colon, Honduras'
  }
];

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'corte-clasico',
    name: 'Corte Clásico Walin',
    description: 'Corte a tijera o máquina tradicional, lavado refrescante, peinado con pomada mate y loción balsámica.',
    price: 120, // Lempiras
    durationMinutes: 30,
    category: 'cortes',
    popular: true,
    active: true,
    iconName: 'Scissors'
  },
  {
    id: 'fade-degradado',
    name: 'Skin Fade / Degradado Deluxe',
    description: 'Degradado milimétrico a navaja o shaver, perfilado de patillas, frente y cuello con acabado pulcro y texturizado.',
    price: 150, // Lempiras
    durationMinutes: 40,
    category: 'cortes',
    popular: true,
    active: true,
    iconName: 'Sparkles'
  },
  {
    id: 'arreglo-barba',
    name: 'Ritual de Barba & Toalla Caliente',
    description: 'Perfilado a navaja tradicional, toalla caliente con vapor de eucalipto, aceite orgánico para barba y bálsamo hidratante.',
    price: 100, // Lempiras
    durationMinutes: 25,
    category: 'barba',
    popular: true,
    active: true,
    iconName: 'Sparkle'
  },
  {
    id: 'combo-walin-vip',
    name: 'Combo Walin Signature VIP',
    description: 'Corte completo + Ritual de barba con toalla caliente + Mascarilla facial purificante y bebida fría de cortesía.',
    price: 250, // Lempiras
    durationMinutes: 60,
    category: 'combos',
    popular: true,
    active: true,
    iconName: 'Crown'
  },
  {
    id: 'black-mask-facial',
    name: 'Tratamiento Black Mask & Facial',
    description: 'Limpieza profunda de poros, mascarilla de carbón activado, eliminación de puntos negros y tónico refrescante.',
    price: 100, // Lempiras
    durationMinutes: 20,
    category: 'tratamientos',
    popular: false,
    active: true,
    iconName: 'Flame'
  },
  {
    id: 'corte-ninos',
    name: 'Corte Junior / Niños',
    description: 'Atención paciente y amigable para los pequeños, estilo moderno y fijador suave.',
    price: 100, // Lempiras
    durationMinutes: 30,
    category: 'cortes',
    popular: false,
    active: true,
    iconName: 'Smile'
  },
  {
    id: 'pigmentacion-cejas',
    name: 'Perfilado & Pigmentación de Barba',
    description: 'Definición de líneas y sombreado natural con pigmento semipermanente para realzar la densidad de la barba.',
    price: 80, // Lempiras
    durationMinutes: 20,
    category: 'barba',
    popular: false,
    active: true,
    iconName: 'Brush'
  }
];

export const INITIAL_BARBERS: BarberProfile[] = [
  {
    id: 'walin-master',
    name: 'Walin Gómez',
    role: 'Master Barber & Propietario',
    specialties: 'Degradados de alta definición, tijera clásica y perfilado de barbas',
    rating: 5.0,
    reviewsCount: 210,
    available: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    bio: 'Fundador de Barbería Walin. Elevando el arte del corte en Sabá, Colón.',
    yearsExperience: 10,
    assignedBranchId: 'all',
    assignedBranchName: 'Ambos Locales (Elixir & El Esfuerzo)'
  },
  {
    id: 'mateo-fade',
    name: 'Mateo "Fades" Rivas',
    role: 'Especialista en Taper & Skin Fade',
    specialties: 'Low, Mid, High Fade y freestyle lines',
    rating: 4.9,
    reviewsCount: 154,
    available: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    bio: 'Precisión milimétrica y simetría en cada corte moderno.',
    yearsExperience: 6,
    assignedBranchId: 'local-1',
    assignedBranchName: 'Local #1 - Elixir'
  },
  {
    id: 'carlos-beard',
    name: 'Carlos "El Maestro" Vidal',
    role: 'Especialista en Afeitado Tradicional',
    specialties: 'Ritual de navaja, toallas calientes y cuidado facial',
    rating: 4.9,
    reviewsCount: 130,
    available: true,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    bio: 'Experto en rituales de barbería clásica y relajación total.',
    yearsExperience: 8,
    assignedBranchId: 'local-2',
    assignedBranchName: 'Local #2 - Aldea El Esfuerzo'
  },
  {
    id: 'david-stylist',
    name: 'David Santos',
    role: 'Estilista & Diseñador de Imagen',
    specialties: 'Cortes texturizados, asesoría de imagen y cortes infantiles',
    rating: 4.8,
    reviewsCount: 95,
    available: true,
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    bio: 'Creatividad y estilos modernos adaptados a cada cliente.',
    yearsExperience: 5,
    assignedBranchId: 'local-1',
    assignedBranchName: 'Local #1 - Elixir'
  }
];

export const INITIAL_SHOP_INFO: ShopInfo = {
  name: 'Barbería Walin',
  tagline: 'Cortes con Estilo, Carácter & Tradición en Honduras',
  currency: 'Honduran Lempiras',
  currencySymbol: 'L.',
  phone: '+504 9876-5432',
  whatsapp: '50498765432',
  department: 'Colón',
  municipality: 'Sabá',
  announcement: '💈 Atención en nuestros 2 locales: Elixir y Aldea El Esfuerzo, Sabá, Colón. ¡Reserva tu turno en línea!'
};

// INITIAL SEEDING HELPER
export async function seedInitialDataIfEmpty() {
  try {
    // 1. Branches
    const branchesSnap = await getDocs(collection(db, 'branches'));
    if (branchesSnap.empty) {
      console.log('Seeding Honduras branches to Firestore...');
      for (const branch of INITIAL_BRANCHES) {
        await setDoc(doc(db, 'branches', branch.id), branch);
      }
    }

    // 2. Services
    const servicesSnap = await getDocs(collection(db, 'services'));
    if (servicesSnap.empty) {
      console.log('Seeding initial services in Lempiras to Firestore...');
      for (const service of INITIAL_SERVICES) {
        await setDoc(doc(db, 'services', service.id), service);
      }
    }

    // 3. Barbers
    const barbersSnap = await getDocs(collection(db, 'barbers'));
    if (barbersSnap.empty) {
      console.log('Seeding initial barbers to Firestore...');
      for (const barber of INITIAL_BARBERS) {
        await setDoc(doc(db, 'barbers', barber.id), barber);
      }
    }

    // 4. Settings
    const settingsSnap = await getDocs(collection(db, 'settings'));
    if (settingsSnap.empty) {
      console.log('Seeding initial shop settings to Firestore...');
      await setDoc(doc(db, 'settings', 'general'), INITIAL_SHOP_INFO);
    }
  } catch (error) {
    console.warn('Seeding note:', error);
  }
}

// REALTIME LISTENERS
export function subscribeToAppointments(callback: (appointments: Appointment[]) => void) {
  const path = 'appointments';
  try {
    const q = query(collection(db, path));
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as Appointment[];
        items.sort((a, b) => {
          const dtA = `${a.date} ${a.time}`;
          const dtB = `${b.date} ${b.time}`;
          return dtB.localeCompare(dtA);
        });
        callback(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function subscribeToServices(callback: (services: ServiceItem[]) => void) {
  const path = 'services';
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
          })) as ServiceItem[];
          callback(items);
        } else {
          callback(INITIAL_SERVICES);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function subscribeToBarbers(callback: (barbers: BarberProfile[]) => void) {
  const path = 'barbers';
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
          })) as BarberProfile[];
          callback(items);
        } else {
          callback(INITIAL_BARBERS);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function subscribeToBranches(callback: (branches: Branch[]) => void) {
  const path = 'branches';
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
          })) as Branch[];
          callback(items);
        } else {
          callback(INITIAL_BRANCHES);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function subscribeToSettings(callback: (settings: ShopInfo) => void) {
  const path = 'settings';
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const docSnap = snapshot.docs.find((d) => d.id === 'general');
        if (docSnap && docSnap.exists()) {
          callback(docSnap.data() as ShopInfo);
        } else {
          callback(INITIAL_SHOP_INFO);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// APPOINTMENT MUTATIONS
export async function createAppointment(data: Omit<Appointment, 'id' | 'createdAt'>): Promise<string> {
  const path = 'appointments';
  try {
    const shortCode = 'WLN-' + Math.floor(100000 + Math.random() * 900000);
    const appointmentDocRef = doc(db, path, shortCode);

    const fullData: Appointment = {
      ...data,
      id: shortCode,
      createdAt: new Date().toISOString()
    };

    await setDoc(appointmentDocRef, fullData);
    return shortCode;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateAppointmentStatus(appointmentId: string, status: Appointment['status']) {
  const path = `appointments/${appointmentId}`;
  try {
    const docRef = doc(db, 'appointments', appointmentId);
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateAppointmentDetails(appointmentId: string, updates: Partial<Appointment>) {
  const path = `appointments/${appointmentId}`;
  try {
    const docRef = doc(db, 'appointments', appointmentId);
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteAppointment(appointmentId: string) {
  const path = `appointments/${appointmentId}`;
  try {
    const docRef = doc(db, 'appointments', appointmentId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// SERVICE MUTATIONS (Admin)
export async function saveService(service: ServiceItem) {
  const path = `services/${service.id}`;
  try {
    await setDoc(doc(db, 'services', service.id), service);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function toggleServiceActive(serviceId: string, active: boolean) {
  const path = `services/${serviceId}`;
  try {
    await updateDoc(doc(db, 'services', serviceId), { active });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteService(serviceId: string) {
  const path = `services/${serviceId}`;
  try {
    await deleteDoc(doc(db, 'services', serviceId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// BARBER MUTATIONS (Admin)
export async function saveBarber(barber: BarberProfile) {
  const path = `barbers/${barber.id}`;
  try {
    await setDoc(doc(db, 'barbers', barber.id), barber);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function toggleBarberAvailability(barberId: string, available: boolean) {
  const path = `barbers/${barberId}`;
  try {
    await updateDoc(doc(db, 'barbers', barberId), { available });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteBarber(barberId: string) {
  const path = `barbers/${barberId}`;
  try {
    await deleteDoc(doc(db, 'barbers', barberId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// BRANCH MUTATIONS (Admin)
export async function saveBranch(branch: Branch) {
  const path = `branches/${branch.id}`;
  try {
    await setDoc(doc(db, 'branches', branch.id), branch);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function toggleBranchActive(branchId: string, active: boolean) {
  const path = `branches/${branchId}`;
  try {
    await updateDoc(doc(db, 'branches', branchId), { active });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// SETTINGS MUTATIONS (Admin)
export async function updateShopSettings(settings: Partial<ShopInfo>) {
  const path = 'settings/general';
  try {
    await setDoc(doc(db, 'settings', 'general'), settings, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// GENERIC DATABASE EXPLORER FUNCTIONS (Admin Direct Database Access)
export async function fetchCollectionDocuments(collectionName: string): Promise<Record<string, unknown>[]> {
  try {
    const snap = await getDocs(collection(db, collectionName));
    return snap.docs.map((d) => ({
      _documentId: d.id,
      ...d.data()
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionName);
  }
}

export async function saveGenericDocument(collectionName: string, docId: string, data: Record<string, unknown>) {
  const path = `${collectionName}/${docId}`;
  try {
    await setDoc(doc(db, collectionName, docId), data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteGenericDocument(collectionName: string, docId: string) {
  const path = `${collectionName}/${docId}`;
  try {
    await deleteDoc(doc(db, collectionName, docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
