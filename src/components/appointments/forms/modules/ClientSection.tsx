import { read } from 'fs';
import { Input } from '../../../atoms/inputs';
import React from 'react';

interface ClientSectionProps {
  client: string;
  contact: string;
  errors: Record<string, string>;
  onClientChange: (value: string) => void;
  onContactChange: (value: string) => void;
  readonly?: boolean;
}

export const ClientSection = React.forwardRef<HTMLInputElement, ClientSectionProps>(
  ({ client, contact, errors, onClientChange, onContactChange,readonly }, ref) => {
    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      
      if (value.length < 5) {
        onContactChange(" ");
        return;
      }
      
      if (!value.startsWith(" ")) {
        onContactChange(" " + value.replace(/[^\d]/g, '').slice(0, 8));
        return;
      }
      
      const numbersOnly = value.slice(5).replace(/[^\d]/g, '');
      if (numbersOnly.length <= 8) {
        onContactChange(" " + numbersOnly);
      }
    };

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          ref={ref}
          label="Cliente *"
          value={client}
          readOnly={readonly} 
          onChange={(e) => onClientChange(e.target.value)}
          placeholder="Nombre del cliente"
          error={errors.client}
        />
        
        <Input
          label="Contacto *"
          value={contact}
          readOnly={readonly}
          onChange={handleContactChange}
          placeholder="7XXXXXXX"
          error={errors.contact}
        />
      </div>
    );
  }
);

ClientSection.displayName = 'ClientSection';