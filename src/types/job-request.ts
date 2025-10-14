export interface JobRequestFormData {
  jobMotive: string;
  jobDescription: string;
  locationOption: 'keep' | 'modify';
  startTime: string;
  endTime: string;
  suggestedRate: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
}

export interface CreateJobRequestPayload {
  jobMotive: string;
  jobDescription: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  startTime: string;
  endTime: string;
  suggestedRate: number;
}