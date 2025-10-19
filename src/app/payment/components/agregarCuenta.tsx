'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { ChangeEvent } from 'react';

const DEMO_FIXER_ID = 'id_temporal_001_fixer';
const API_BASE_URL = '/api';

type PathSetter = (path: string) => void;

// --- Componentes (PaymentSuccessPage) ---

const PaymentSuccessPage = ({ onCloseAll }: { onCloseAll?: () => void }) => {
  const [statusMessage, setStatusMessage] = useState('Cuenta bancaria registrada exitosamente.');

  useEffect(() => {
    const msg = localStorage.getItem('statusMessage');
    if (msg) {
      setStatusMessage(msg);
      localStorage.removeItem('statusMessage');
    }
  }, []);

  const handleBackToPaymentsDemo = () => {
    console.log('🔵 Botón presionado - PaymentSuccessPage'); // Debug
    console.log('🔵 onCloseAll existe?', !!onCloseAll); // Debug
    
    if (onCloseAll) {
      console.log('🔵 Ejecutando onCloseAll...'); // Debug
      onCloseAll();
    } else {
      console.log('❌ onCloseAll NO está definido'); // Debug
    }
  };

  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4">
      <div className="max-w-xl mx-auto p-8 space-y-6 text-center bg-white rounded-xl shadow-2xl">
        <svg
          className="mx-auto h-16 w-16 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="text-3xl font-bold text-gray-800">¡Registro Exitoso!</h2>
        <p className="text-lg text-gray-600">
          Tu cuenta bancaria ha sido registrada en la base de datos con el ID temporal:{' '}
          {DEMO_FIXER_ID}.
        </p>
        <div className="p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-sm">
          {statusMessage || 'Redirigiendo al Demo de Pagos...'}
        </div>
        <button
          onClick={handleBackToPaymentsDemo}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-150 shadow-md hover:shadow-lg"
        >
          Continuar al Demo de Pagos
        </button>
      </div>
    </div>
  );
};

const RegistrationForm = ({ pathSetter, onCloseAll }: { pathSetter: PathSetter; onCloseAll?: () => void }) => {
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  const [formData, setFormData] = useState({
    nombreTitular: '',  // ← Cambiado a vacío
    identificacion: '', // ← Cambiado a vacío
    identificationSuffix: '',
    tipoCuenta: 'Cuenta de Ahorros',
    numeroCuenta: '', // ← Cambiado a vacío
    cuentaFavorita: false,
    banco: 'Banco Nacional de Bolivia',
  });

  const handleGoBack = () => {
    console.log('🔵 Botón presionado - RegistrationForm'); // Debug
    console.log('🔵 onCloseAll existe?', !!onCloseAll); // Debug
    
    if (onCloseAll) {
      console.log('🔵 Ejecutando onCloseAll...'); // Debug
      onCloseAll();
    } else {
      console.log('❌ onCloseAll NO está definido'); // Debug
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const isNumeric = (str: string) => /^\d+$/.test(str);

  useEffect(() => {
    if (localStorage.getItem('fixer_bank_status') === 'CCB') {
      setAlreadyRegistered(true);
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const ci = formData.identificacion.trim();
    if (ci.length < 7 || ci.length > 8 || !isNumeric(ci)) {
      setFormError('El CI debe contener entre 7 y 8 dígitos numéricos.');
      return;
    }

    const accountNumber = formData.numeroCuenta.trim();
    if (accountNumber.length < 7 || accountNumber.length > 10 || !isNumeric(accountNumber)) {
      setFormError('El Número de Cuenta debe contener entre 7 y 10 dígitos numéricos.');
      return;
    }

    setLoading(true);

    const dataToSend = {
      fixerId: DEMO_FIXER_ID,
      accountNumber: formData.numeroCuenta,
      bankName: formData.banco,
      nameFixer: formData.nombreTitular,
      accountType: formData.tipoCuenta,
      identification:
        formData.identificacion +
        (formData.identificationSuffix ? '-' + formData.identificationSuffix.toUpperCase() : ''),
      isFavorite: formData.cuentaFavorita,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/bank-accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Fallo en el registro (Status: ${response.status})`);
      }

      localStorage.setItem('fixer_bank_status', 'CCB');
      localStorage.setItem('statusMessage', 'Cuenta bancaria registrada exitosamente.');
      pathSetter('/agregarCuenta/payment');
    } catch (error: any) {
      console.error('❌ Error en el flujo de registro:', error?.message);
      const displayError =
        error?.message?.includes('duplicado') || error?.message?.includes('Duplicate account number')
          ? 'El número de cuenta bancaria ya ha sido registrado. Por favor, verifica tus datos.'
          : `Error al procesar la solicitud: ${error?.message || 'Error desconocido'}`;
      setFormError(displayError);
    } finally {
      setLoading(false);
    }
  };

  if (alreadyRegistered) {
    return (
      <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4">
        <div className="max-w-xl mx-auto p-6 space-y-4 text-center bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-green-600 mb-4">
            ¡Ya tienes una cuenta registrada (Simulación)!
          </h2>
          <p className="text-gray-700 mb-6">
            El registro de la cuenta se completó anteriormente. Puedes continuar con el demo de
            pagos.
          </p>
          <button
            onClick={handleGoBack}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-150 shadow-md hover:shadow-lg"
          >
            Ir al Demo de Pagos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-600 flex flex-col font-sans">
      <header className="px-6 py-4 flex items-center justify-between shadow-lg bg-blue-700">
        <button
          onClick={handleGoBack}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-150 shadow-md"
        >
          &larr; Volver a Demo de Pagos
        </button>
      </header>

      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
          <h2 className="text-2xl font-bold mb-3 text-gray-800 border-b pb-2">
            Registro de cuenta bancaria
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            Por favor, completa el registro de la cuenta bancaria.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="nombreTitular"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre completo del titular
              </label>
              <input
                type="text"
                name="nombreTitular"
                id="nombreTitular"
                value={formData.nombreTitular}
                onChange={handleChange}
                placeholder="Ej: Juan Pérez"
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-colors text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Identificación (CI)
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="identificacion"
                  id="identificacion"
                  value={formData.identificacion}
                  onChange={handleChange}
                  placeholder="7 a 8 dígitos"
                  maxLength={8}
                  className="flex-grow border border-gray-300 p-2.5 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-colors text-gray-900"
                  required
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
                <input
                  type="text"
                  name="identificationSuffix"
                  id="identificationSuffix"
                  value={formData.identificationSuffix}
                  onChange={handleChange}
                  placeholder="Sufijo (Ej: LP)"
                  maxLength={3}
                  className="w-1/4 border border-gray-300 p-2.5 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 uppercase text-center transition-colors text-gray-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="tipoCuenta" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de cuenta
              </label>
              <select
                name="tipoCuenta"
                id="tipoCuenta"
                value={formData.tipoCuenta}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-colors appearance-none text-gray-900"
                required
              >
                <option>Cuenta de Ahorros</option>
                <option>Cuenta Corriente</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="numeroCuenta"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Número de cuenta (Solo números)
              </label>
              <input
                type="text"
                name="numeroCuenta"
                id="numeroCuenta"
                value={formData.numeroCuenta}
                onChange={handleChange}
                placeholder="7 a 10 dígitos"
                maxLength={10}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-colors text-gray-900"
                required
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </div>

            <div>
              <label htmlFor="banco" className="block text-sm font-medium text-gray-700 mb-1">
                Banco
              </label>
              <select
                name="banco"
                id="banco"
                value={formData.banco}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-colors appearance-none text-gray-900"
                required
              >
                <option>Banco Nacional de Bolivia</option>
                <option>Banco Mercantil Santa Cruz</option>
                <option>Banco BISA</option>
              </select>
            </div>

            <div className="flex items-center pt-2">
              <input
                type="checkbox"
                name="cuentaFavorita"
                id="cuentaFavorita"
                checked={formData.cuentaFavorita}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="cuentaFavorita" className="ml-2 block text-sm text-gray-900">
                Marcar como cuenta principal/favorita
              </label>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-400 text-red-700 rounded-lg text-sm transition-all duration-300">
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full font-semibold py-3 rounded-lg mt-6 transition duration-150 ease-in-out shadow-lg 
                                  ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl'}`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Guardando...
                </span>
              ) : (
                'Guardar cuenta'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Componente Principal modificado para aceptar onClose ---
const App = ({ onClose }: { onClose?: () => void }) => {
  const [path, setPath] = useState('/agregarCuenta');

  console.log('🟢 AgregarCuenta App renderizado'); // Debug
  console.log('🟢 onClose recibido?', !!onClose); // Debug

  const renderContent = () => {
    switch (path) {
      case '/agregarCuenta/payment':
        return <PaymentSuccessPage onCloseAll={onClose} />;
      case '/agregarCuenta':
      default:
        return <RegistrationForm pathSetter={setPath} onCloseAll={onClose} />;
    }
  };

  return <div style={{ fontFamily: 'Inter, sans-serif' }}>{renderContent()}</div>;
};

export default App;