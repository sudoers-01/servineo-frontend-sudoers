'use client';

import { Field, Input, Select, Textarea } from '@/Components/Form';
import { useState } from 'react';

const NewOfferForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');

  const categories = [
    { label: 'Seleccione categoría', value: '' },
    { label: 'Electricidad', value: 'electricidad' },
    { label: 'Plomería', value: 'plomeria' },
    { label: 'Albañilería', value: 'albanileria' },
    { label: 'Pintura', value: 'pintura' },
  ];

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-black bg-white p-6 sm:p-8">
      <h2 className="mb-6 text-center text-xl font-bold">Nueva Oferta</h2>
      <div className="space-y-4">
        <Field id="title" label="Título de servicio">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Reparación de grifo"
            className="w-full"
          />
        </Field>
        <Field id="description" label="Descripción">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción detalladamente que ofertas del servicio"
            rows={4}
            className="w-full"
          />
        </Field>
        <Field id="price" label="Precio">
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00 Bs"
            className="w-full"
          />
        </Field>
        <Field id="category" label="Categoría">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-4xl w-full sm:w-auto">Guardar</button>
          <button className="px-4 py-2 bg-gray-300 rounded-4xl w-full sm:w-auto">Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default NewOfferForm;