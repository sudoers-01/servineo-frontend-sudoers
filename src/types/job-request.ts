export interface UserLocation {
  lat: string;
  lng: string;
}

export interface CreateJobRequestPayload {
  jobMotive: string;
  jobDescription: string;
  location: {
    type: 'Point';
    coordinates: [string, string];
  };
  startTime: string;
  endTime: string;
  suggestedRate: string | number;
  id_fixer: string;
  requesterId: string;
}

export interface JobRequest {
  _id: string;
  jobMotive: string;
  jobDescription: string;
  location: {
    type: 'Point';
    coordinates: [string, string];
  };
  startTime: string;
  endTime: string;
  suggestedRate: number;
  id_requester: string;
  id_fixer?: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
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
