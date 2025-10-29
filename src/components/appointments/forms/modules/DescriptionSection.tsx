import { TextArea } from '../../../atoms/textArea';

interface DescriptionSectionProps {
  description: string;
  error?: string;
  onChange: (value: string) => void;
}

export const DescriptionSection = ({ description, error, onChange }: DescriptionSectionProps) => {
  return (
    <TextArea
      label="Descripción del trabajo"
      value={description}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Breve descripción de lo que se requiere"
      rows={3}
      error={error}
    />
  );
};