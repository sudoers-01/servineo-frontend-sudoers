export interface Comment {
  id: number;
  name: string;
  job: string;
  date: string;
  text: string;
  rating: number;
  sentiment: 'positive' | 'negative';
}

export const mockComments: Comment[] = [
  {
    id: 1,
    name: 'John Doe',
    job: 'Reparación de toma eléctrica',
    date: '10/10/2025',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed a nisi est. Fusce nec dui eros.',
    rating: 3,
    sentiment: 'positive',
  },
  {
    id: 2,
    name: 'John Doe',
    job: 'Reparación de toma eléctrica',
    date: '10/10/2025',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed a nisi est. Fusce nec dui eros.',
    rating: 3,
    sentiment: 'negative',
  },
  {
    id: 3,
    name: 'John Doe',
    job: 'Reparación de toma eléctrica',
    date: '10/10/2025',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed a nisi est. Fusce nec dui eros.',
    rating: 3,
    sentiment: 'positive',
  },
];
