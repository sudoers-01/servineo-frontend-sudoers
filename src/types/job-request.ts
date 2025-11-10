export interface UserLocation {
  lat: string;
  lng: string;
}

export interface CreateJobRequestPayload {
  title: string;
  description: string;
  location: {
    type: 'Point';
    coordinates: [string, string];
  };
  startTime: string;
  endTime: string;
  price: string | number;
  fixerId: string;
  requesterId: string;
}

export interface JobRequest {
  _id: string;
  title: string;
  description: string;
  location?: {
    type: 'Point';
    coordinates: [string, string];
  };
  startTime?: string;
  endTime?: string;
  price: number;
  requesterId: string;
  fixerId?: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'paid';
  createdAt: string;
  updatedAt?: string;
  rating?: number;
  comment?: string;
  type?: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface JobRequestData {
  jobMotive: string;
  jobDescription: string;
  locationOption: 'keep' | 'modify';
  startTime: string;
  endTime: string;
  suggestedRate: string;
}

export interface JobRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: JobRequest) => void;
  fixerId: string;
}

export interface JobRequestFormProps {
  initialLocation: Location | null;
  loading: boolean;
  onSubmit: (formData: JobRequestData, newLocation: Location | null) => void;
  onCancel: () => void;
}
