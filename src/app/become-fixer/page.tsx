'use client';

import { useState } from 'react';
import Tabs from '@/Components/Tabs/Tabs';
import TabsList from '@/Components/Tabs/TabsList';
import TabsTrigger from '@/Components/Tabs/TabsTrigger';
import TabsContent from '@/Components/Tabs/TabsContent';
import FixerRegisterForm, { type FormFieldConfig } from '@/Components/Form/FixerRegisterForm';
import NewOfferForm from './NewOfferForm';

const registerFields: FormFieldConfig[] = [
  {
    id: 'name',
    label: 'Nombre',
    type: 'text',
    placeholder: 'tu nombres completo',
  },
  {
    id: 'specialty',
    label: 'Especialidad',
    type: 'select',
    placeholder: 'Selecciona tu especialidad',
    options: [
      { label: 'Electricidad', value: 'electricidad' },
      { label: 'Plomería', value: 'plomeria' },
      { label: 'Albañilería', value: 'albanileria' },
      { label: 'Pintura', value: 'pintura' },
    ],
  },
  { id: 'phone', label: 'Telefono', type: 'phone', placeholder: '+591 70341618' },
  { id: 'email', label: 'Email', type: 'email', placeholder: 'Tu@gmail.com' },
  { id: 'certificate', label: 'Titulo/Certificacion', type: 'file', placeholder: 'Subir titulo o certificacion' },
];

const BecomeFixerPage = () => {
  const [activeTab, setActiveTab] = useState('register');

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-center">LOGO</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-center">
          <TabsList className="flex mb-4 gap-[0.1px]">
            <TabsTrigger value="register">Registro</TabsTrigger>
            <TabsTrigger value="newOffer">Nueva Oferta</TabsTrigger>
            <TabsTrigger value="myOffer">Mis Ofertas</TabsTrigger>
            <TabsTrigger value="map">Mapa</TabsTrigger>
            <TabsTrigger value="video">Video Inspeccion</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="mt-2">
          <TabsContent value="register" activeTab={activeTab}>
            <FixerRegisterForm fields={registerFields} />
          </TabsContent>
          
          <TabsContent value="newOffer" activeTab={activeTab}>
            <NewOfferForm />
          </TabsContent>
          
          <TabsContent value="myOffer" activeTab={activeTab}>
            <p>secction My Offer</p>
          </TabsContent>
          
          <TabsContent value="map" activeTab={activeTab}>
            <p>section map</p>
          </TabsContent>
          
          <TabsContent value="video" activeTab={activeTab}>
            <p>section video</p>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default BecomeFixerPage;