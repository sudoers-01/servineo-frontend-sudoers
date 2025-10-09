'use client';

import { useState } from 'react';
import Tabs from '@/Components/Tabs/Tabs';
import TabsList from '@/Components/Tabs/TabsList';
import TabsTrigger from '@/Components/Tabs/TabsTrigger';
import TabsContent from '@/Components/Tabs/TabsContent';

const BecomeFixerPage = () => {
  const [activeTab, setActiveTab] = useState('register');

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-center">LOGO</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-center">
          <TabsList className="mb-4">
            <TabsTrigger value="register">Registro</TabsTrigger>
            <TabsTrigger value="newOffer">Nueva Oferta</TabsTrigger>
            <TabsTrigger value="myOffer">Mis Ofertas</TabsTrigger>
            <TabsTrigger value="map">Mapa</TabsTrigger>
            <TabsTrigger value="video">Video Inspeccion</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="mt-2">
          <TabsContent value="register" activeTab={activeTab}>
            <p>Component form Register</p>
          </TabsContent>
          
          <TabsContent value="newOffer" activeTab={activeTab}>
            <p>Component form New Offer</p>
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