'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/admin.module.css';
import { adminAPI } from '../lib/api';
import ChartsSection from './chartsSection';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      const adminData = localStorage.getItem('adminUser');

      if (!token || !adminData) {
        router.push('/es/user-admin');
        return;
      }

      try {
        const authCheck = await adminAPI.verifyToken(token);
        if (!authCheck.valid) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          router.push('/es/user-admin');
          return;
        }
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/es/user-admin');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/es/user-admin');
  };

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loading}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>SERVINEO</h1>
        <div className={styles.adminInfo}>
          <span>Welcome, Admin</span>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      {/* 📊 GRÁFICO DE SESIONES (funciona) */}
      <div className={styles.chartsSection}>
        <h3>📈 Registro de Sesiones</h3>
        <p className={styles.sectionSubtitle}>Análisis de inicios y finalizaciones de sesión</p>
        <ChartsSection />
      </div>

      {/* 🔗 MÓDULOS EXTERNOS */}
      <div className={styles.externalModulesSection}>
        <h3>🔧 Módulos Administrativos</h3>
        <p className={styles.sectionSubtitle}>Accede a las herramientas específicas del sistema</p>

        <div className={styles.modulesGrid}>
          {/* Botón para Estadísticas Avanzadas */}
          <button
            onClick={() =>
              window.open(
                'https://servineo-frontend-bytes-bandidos.vercel.app/es/adminStatistic',
                '_self',
              )
            }
            className={styles.moduleButton}
          >
            <div className={styles.moduleIcon}>📊</div>
            <div className={styles.moduleContent}>
              <h4>Estadísticas Avanzadas</h4>
              <p>Métricas detalladas y análisis del sistema</p>
              <div className={styles.moduleMeta}>
                <span className={styles.moduleStatus}>Disponible</span>
                <span className={styles.moduleTeam}>Grupo Analytics</span>
              </div>
            </div>
            <div className={styles.moduleArrow}>→</div>
          </button>

          {/* Botón para Seguimiento de Citas */}
          <button
            onClick={() =>
              window.open(
                'https://servineo-frontend-bytes-bandidos.vercel.app/es/tracking-appointments',
                '_self',
              )
            }
            className={styles.moduleButton}
          >
            <div className={styles.moduleIcon}>📍</div>
            <div className={styles.moduleContent}>
              <h4>Seguimiento de Citas</h4>
              <p>Monitoreo y gestión de appointments activos</p>
              <div className={styles.moduleMeta}>
                <span className={styles.moduleStatus}>Disponible</span>
                <span className={styles.moduleTeam}>Grupo Tracking</span>
              </div>
            </div>
            <div className={styles.moduleArrow}>→</div>
          </button>
        </div>
      </div>
    </div>
  );
}
