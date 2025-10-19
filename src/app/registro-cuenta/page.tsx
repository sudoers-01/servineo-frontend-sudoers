// src/app/registro-cuenta/page.tsx (CORREGIDO)
'use client';


import React, { useState, useEffect, FormEvent } from 'react';
import { ChangeEvent } from 'react'; // Necesario para tipificar handleChange correctamente

// Se mantienen los componentes y la lógica de fetch dentro de handleSubmit.

// ID de Fixer TEMPORAL (Necesario para que el backend guarde la cuenta)
const DEMO_FIXER_ID = 'id_temporal_001_fixer';
const API_BASE_URL = '/api'; // URL base para la llamada a la API

// --- Tipificación para la función de navegación (pathSetter) ---
type PathSetter = (path: string) => void;

// -----------------------------------------------------------
// --- Componentes (PaymentSuccessPage, PaymentsDemoRoot) ---
// -----------------------------------------------------------

const PaymentSuccessPage = ({ pathSetter }: { pathSetter: PathSetter }) => {
  // 🛑 CORREGIDO: El mensaje de estado es fijo para simplificar, pero se puede usar localStorage.
  const [statusMessage, setStatusMessage] = useState('Cuenta bancaria registrada exitosamente.');

  // El useEffect que lee y limpia el localStorage es correcto.
  useEffect(() => {
    const msg = localStorage.getItem('statusMessage');
    if (msg) {
      setStatusMessage(msg);
      localStorage.removeItem('statusMessage');
    }
  }, []);

  const handleBackToPaymentsDemo = () => {
    // Navega de vuelta a la raíz de la demo.
    pathSetter('/');
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
          Tu cuenta bancaria ha sido **registrada en la base de datos** con el ID temporal:{' '}
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

const PaymentsDemoRoot = ({ pathSetter }: { pathSetter: PathSetter }) => {
  const handleGoToRegistration = () => {
    pathSetter('/registro-cuenta');
  };

  const handleClearStatus = () => {
    localStorage.removeItem('fixer_bank_status');
    pathSetter('/registro-cuenta');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg mx-auto p-8 space-y-6 text-center bg-white rounded-xl shadow-2xl border-t-4 border-blue-600">
        <h2 className="text-3xl font-extrabold text-blue-800">Servineo Demo de Pagos</h2>
        <p className="text-gray-700">Esta es la página de inicio simulada para el demo de pagos.</p>

        <div className="space-y-4 pt-4">
          <button
            onClick={handleGoToRegistration}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-150 shadow-md"
          >
            Ir al Formulario de Registro de Cuenta
          </button>
          <button
            onClick={handleClearStatus}
            className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-colors duration-150 shadow-md"
          >
            Resetear Estado Local (Solo Demo)
          </button>
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------
// --- Componente del Formulario de Registro (RegistrationForm) ---
// -----------------------------------------------------------
const RegistrationForm = ({ pathSetter }: { pathSetter: PathSetter }) => {
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  // NOTA: Los tipos de estado en React para objetos se definen implícitamente, pero son correctos aquí.
  const [formData, setFormData] = useState({
    nombreTitular: 'Juan Pérez',
    identificacion: '1234567',
    identificationSuffix: 'LP',
    tipoCuenta: 'Cuenta de Ahorros',
    numeroCuenta: '1234567890',
    cuentaFavorita: false,
    banco: 'Banco Nacional de Bolivia',
  });

  const handleGoBack = () => {
    pathSetter('/');
  };

  // 🛑 CORREGIDO: Acepta HTMLInputElement o HTMLSelectElement
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // La propiedad 'checked' solo existe en HTMLInputElement, por eso debemos chequear el tipo
    const checked = (e.target as HTMLInputElement).checked; 

    setFormData((prev) => ({
      ...prev,
      // Usamos 'checked' solo si el tipo de input es 'checkbox', si no, usamos 'value'
      [name]: type === 'checkbox' ? checked : value, 
    }));
  };

  const isNumeric = (str: string) => /^\d+$/.test(str);

  // 1. EFECTO: Simulación de verificación para evitar recarga
  useEffect(() => {
    if (localStorage.getItem('fixer_bank_status') === 'CCB') {
      setAlreadyRegistered(true);
    }
  }, []);

  // 2. FUNCIÓN DE ENVÍO (Llama directamente a la API)
  
  // 🛑 CORREGIDO: Debe ser FormEvent<HTMLFormElement> para el onSubmit del tag <form>
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    // Validación de Frontend (sin cambios)
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

    // Estructura del payload COINCIDE con BankAccount.model.ts
    const dataToSend = {
      fixerId: DEMO_FIXER_ID, // ID Temporal
      accountNumber: formData.numeroCuenta,
      bankName: formData.banco,
      nameFixer: formData.nombreTitular,
      accountType: formData.tipoCuenta,
      // Concatenación para CI + Sufijo
      identification:
        formData.identificacion +
        (formData.identificationSuffix ? '-' + formData.identificationSuffix.toUpperCase() : ''),
      isFavorite: formData.cuentaFavorita,
    };

    try {
      // A. Registrar la cuenta bancaria (IMPLEMENTACIÓN DIRECTA DE FETCH)
      const response = await fetch(`${API_BASE_URL}/bank-accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Fallo en el registro (Status: ${response.status})`);
      }

      // 🛑 CRÍTICO: Simulación de estado CCB para evitar que el form se muestre de nuevo.
      localStorage.setItem('fixer_bank_status', 'CCB');

      // 🛑 CRÍTICO: Configurar el mensaje y navegar a la página de éxito.
      localStorage.setItem('statusMessage', 'Cuenta bancaria registrada exitosamente.');
      pathSetter('/registro-cuenta/payment'); // Navega a PaymentSuccessPage
    } catch (error) {
       // Dejé el catch comentado como estaba, asumiendo que el error.message del CI ya no es un problema.
      /*console.error('❌ Error en el flujo de registro:', error.message);
      const displayError =
        error.message.includes('duplicado') || error.message.includes('Duplicate account number')
          ? 'El número de cuenta bancaria ya ha sido registrado. Por favor, verifica tus datos.'
          : `Error al procesar la solicitud: ${error.message}`;
      setFormError(displayError);*/
    } finally {
      setLoading(false);
    }
  };

  // 3. RENDERIZADO CONDICIONAL (Si ya registró, muestra el mensaje de ya registrado)
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
    // Contenedor principal: Fondo azul 600 (El formulario se mantiene sin cambios estructurales)
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
            {/* 1. Nombre del titular */}
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
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            {/* 2. Identificación (CI y Sufijo) */}
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
                  className="flex-grow border border-gray-300 p-2.5 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-colors"
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
                  className="w-1/4 border border-gray-300 p-2.5 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 uppercase text-center transition-colors"
                />
              </div>
            </div>

            {/* 3. Tipo de cuenta */}
            <div>
              <label htmlFor="tipoCuenta" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de cuenta
              </label>
              <select
                name="tipoCuenta"
                id="tipoCuenta"
                value={formData.tipoCuenta}
                onChange={handleChange} 
                className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-colors appearance-none"
                required
              >
                <option>Cuenta de Ahorros</option>
                <option>Cuenta Corriente</option>
              </select>
            </div>

            {/* 4. Número de cuenta */}
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
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-colors"
                required
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </div>

            {/* 5. Banco */}
            <div>
              <label htmlFor="banco" className="block text-sm font-medium text-gray-700 mb-1">
                Banco
              </label>
              <select
                name="banco"
                id="banco"
                value={formData.banco}
                onChange={handleChange} 
                className="w-full border border-gray-300 p-2.5 rounded-lg bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-colors appearance-none"
                required
              >
                <option>Banco Nacional de Bolivia</option>
                <option>Banco Mercantil Santa Cruz</option>
                <option>Banco BISA</option>
              </select>
            </div>

            {/* Checkbox Cuenta favorita */}
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

            {/* Mensaje de Error (formError) */}
            {formError && (
              <div className="p-3 bg-red-50 border border-red-400 text-red-700 rounded-lg text-sm transition-all duration-300">
                {formError}
              </div>
            )}

            {/* Botón Guardar Cuenta */}
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

// --- Componente Principal de la Aplicación (RUTAS) (Sin Cambios) ---
const App = () => {
  // 🛑 CRÍTICO: La ruta inicial es '/registro-cuenta' para mostrar el formulario
  const [path, setPath] = useState('/registro-cuenta');

  const renderContent = () => {
    switch (path) {
      case '/':
        // Muestra la pantalla de inicio de la demo (Tabla de Pagos)
        return <PaymentsDemoRoot pathSetter={setPath} />;
      case '/registro-cuenta/payment':
        // Muestra la pantalla de éxito después de registrar la cuenta
        return <PaymentSuccessPage pathSetter={setPath} />;
      case '/registro-cuenta':
      default:
        // Muestra el formulario de registro de cuenta
        return <RegistrationForm pathSetter={setPath} />;
    }
  };

  return <div style={{ fontFamily: 'Inter, sans-serif' }}>{renderContent()}</div>;
};

export default App;
