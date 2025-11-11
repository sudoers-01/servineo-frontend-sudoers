'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDevices } from '../Hooks/useDevices';
//import { formatDistanceToNow } from 'date-fns';
import { Button } from "@/app/controlC/HU6/ui/button";
import { Card, CardContent } from "@/app/controlC/HU6/ui/card";
import { ArrowLeft, Laptop, Monitor, Smartphone, AlertCircle } from "lucide-react";

export default function SeguridadPage() {
  const router = useRouter(); // ✅ define el router antes de usarlo
  interface Device {
    id: string;
    type: "dispositivo 1" | "dispositivo 2" | "dispositivo 3";
    location: string;
    lastActivity: Date;
  }
  const [devices, setDevices] = useState<Device[]>([
    { id: "1", type: "dispositivo 1", location: "Ubicación 1", lastActivity: new Date() },
    { id: "2", type: "dispositivo 2", location: "Ubicación 2", lastActivity: new Date() },
    { id: "3", type: "dispositivo 3", location: "Ubicación 3", lastActivity: new Date() },
  ]);

  // Define the current device ID
  const currentDeviceId = "1"; // Replace "1" with the actual ID of the current device

  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Define otherSessions based on devices
  const otherSessions = devices.filter((device) => device.id !== "currentDeviceId");

  // Define activeSessions based on devices
  const activeSessions = devices;

  const handleLogoutConfirm = () => {
    if (selectedDevice) {
      setDevices(devices.filter((d) => d.id !== selectedDevice.id));
      setSelectedDevice(null);
    }
  };

  const handleAddDevice = () => {
    if (devices.length < 3) {
      const newDevice: Device = {
        id: (devices.length + 1).toString(),
        type: `dispositivo ${devices.length + 1}` as Device["type"],
        location: `Ubicación ${devices.length + 1}`,
        lastActivity: new Date(), // Add the lastActivity property
      };
      setDevices([...devices, newDevice]);
    }
  };

  const handleCloseAllSessions = () => {
    setDevices(devices.filter((device) => device.id === currentDeviceId));
    setShowConfirmation(false);
    setSuccessMessage("Todas las sesiones en otros dispositivos han sido cerradas.");
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "dispositivo 1":
        return <Laptop className="w-6 h-6" />;
      case "dispositivo 2":
        return <Monitor className="w-6 h-6" />;
      case "dispositivo 3":
        return <Smartphone className="w-6 h-6" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white relative">
      {/* Notificación de éxito */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-slide-in">
          <AlertCircle className="w-5 h-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-full md:w-1/4 border-r p-6 space-y-4">
        <h2 className="text-xl font-semibold">Configuración</h2>
        <nav className="space-y-2">
          <button
            onClick={() => router.push('/controlC/HU5')}
            className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
          >
            ✏️ Editar Perfil
          </button>
          <button className="w-full text-left px-3 py-2 rounded-md bg-indigo-100 text-indigo-600 font-medium">
            🔒 Seguridad
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <button
          onClick={() => router.push("/controlC/Configuracion")}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Volver
        </button>

        <h1 className="text-2xl font-semibold mb-2">Gestión de Sesiones</h1>
        <p className="text-gray-600 mb-6">
          Tienes la sesión iniciada en estos dispositivos. Puedes cerrar sesiones en otros dispositivos para mantener tu cuenta segura.
        </p>

        {/* Información importante */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Importante:</strong> Al cerrar sesiones, se desconectarán todos
                los dispositivos excepto el actual. Las personas que usen esos
                dispositivos deberán iniciar sesión nuevamente.
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {devices.map((device) => (
            <Card key={device.id} className="border border-blue-200">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <div className="text-gray-700">{getIcon(device.type)}</div>
                  <div>
                    <p className="font-medium">{device.type}</p>
                    <p className="text-sm text-gray-500">{device.location}</p>

                  </div>
                </div>
                <Button
                  variant="destructive"
                  className="bg-red-100 text-red-600 border border-red-300 hover:bg-red-200"
                  onClick={() => setSelectedDevice(device)}
                >
                  Cerrar sesión
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded-lg text-sm flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Alerta de límite de dispositivos */}
        {activeSessions.length >= 3 && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg text-sm flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Has alcanzado el límite de 3 dispositivos conectados.
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Sesiones activas</p>
            <p className="text-2xl font-bold text-gray-800">{activeSessions.length}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Otros dispositivos</p>
            <p className="text-2xl font-bold text-gray-800">{otherSessions.length}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Dispositivo actual</p>
            <p className="text-2xl font-bold text-green-600">✓</p>
          </div>
        </div>

        {/* Botón para cerrar todas las sesiones */}
        {otherSessions.length > 0 && (
          <Button
            onClick={() => setShowConfirmation(true)}
            disabled={loading}
            className="w-full bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-400 mb-6"
          >
            {loading ? 'Cerrando sesiones...' : 'Cerrar sesiones en otros dispositivos'}
          </Button>
        )}

        {otherSessions.length === 0 && activeSessions.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center mb-6">
            <p className="text-gray-600">
              No hay otras sesiones activas. Solo este dispositivo está conectado.
            </p>
          </div>
        )}

        {/* Lista de sesiones activas */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Sesiones Activas ({activeSessions.length})
          </h2>

          {activeSessions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay dispositivos conectados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <Card
                  key={session.id}
                  className={`border ${session.id === currentDeviceId
                    ? 'border-green-400 bg-green-50'
                    : 'border-blue-200'
                    }`}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-gray-700">
                        {getIcon(session.type)}
                      </div>
                      <div>



                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal de confirmación */}
      {showConfirmation && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center">
            <h2 className="text-lg font-semibold mb-2">¿Cerrar sesiones?</h2>
            <p className="text-gray-600 mb-4">
              Esta acción cerrará todas las sesiones activas en otros dispositivos (
              {otherSessions.length} {otherSessions.length === 1 ? 'sesión' : 'sesiones'}
              ). Las personas que usen esos dispositivos tendrán que volver a iniciar sesión.
            </p>
            <div className="flex justify-around">
              <Button
                onClick={() => setShowConfirmation(false)}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCloseAllSessions}
                className="bg-red-500 text-white hover:bg-red-600"
                disabled={loading}
              >
                {loading ? 'Cerrando...' : 'Sí, cerrar sesiones'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

