'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/admin.module.css';
import { adminAPI } from '../lib/api';
import ChartsSection from './chartsSection';

export default function AdminDashboard() {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuthAndLoadData = async () => {
            const token = localStorage.getItem('adminToken');
            const adminData = localStorage.getItem('adminUser');
        
            // Si no hay token, redirigir al login
            if (!token || !adminData) {
                router.push('/es/user-admin');
                return;
            }

            try {
                // Verificar token con backend
                const authCheck = await adminAPI.verifyToken(token);
                if (!authCheck.valid) {
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminUser');
                    router.push('/es/user-admin');
                    return;
                }

                // Cargar métricas con backend
                const metricsData = await adminAPI.getMetrics(token);
                setMetrics(metricsData.metrics);
            } catch (error) {
                console.error('Error loading metrics:', error);
            } finally {
                setLoading(false);
            }
        };

        checkAuthAndLoadData();
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

            {/* 📊 MÉTRICAS PRINCIPALES */}
            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <h3>👥 Total Usuarios</h3>
                    <div className={styles.metricValue}>
                        {metrics?.totalUsers?.toLocaleString() || '0'}
                    </div>
                    <div className={styles.metricBreakdown}>
                        <span>Requesters: {metrics?.usersByRole?.requester || 0}</span>
                        <span>Fixers: {metrics?.usersByRole?.fixer || 0}</span>
                    </div>
                </div>

                <div className={styles.metricCard}>
                    <h3>🛠️ Trabajos Activos</h3>
                    <div className={styles.metricValue}>
                        {metrics?.activeJobs?.toLocaleString() || '0'}
                    </div>
                    <div className={styles.metricTrend}>
                        Total: {metrics?.totalJobs || 0}
                    </div>
                </div>

                <div className={styles.metricCard}>
                    <h3>💰 Ingresos</h3>
                    <div className={styles.metricValue}>
                        ${metrics?.revenue?.toLocaleString() || '0'} BOB
                    </div>
                    <div className={styles.metricTrend}>
                        Pagos: {metrics?.activePayments || 0}
                    </div>
                </div>
            </div>

            {/* 📈 ESTADÍSTICAS DE SESIÓN */}
            <div className={styles.dashboardContent}>
                <div className={styles.section}>
                    <h3>📊 Sesiones por Rol (Últimos 30 días)</h3>
                    <div className={styles.sessionStats}>
                        <div className={styles.sessionType}>
                            <span className={styles.sessionLabel}>REQUESTER</span>
                            <div className={styles.sessionCount}>
                                {metrics?.sessionStats?.requester?.toLocaleString() || '0'}
                            </div>
                        </div>
                        <div className={styles.sessionType}>
                            <span className={styles.sessionLabel}>FIXER</span>
                            <div className={styles.sessionCount}>
                                {metrics?.sessionStats?.fixer?.toLocaleString() || '0'}
                            </div>
                        </div>
                        <div className={styles.sessionType}>
                            <span className={styles.sessionLabel}>VISITOR</span>
                            <div className={styles.sessionCount}>
                                {metrics?.sessionStats?.visitor?.toLocaleString() || '0'}
                            </div>
                        </div>
                        <div className={styles.sessionType}>
                            <span className={styles.sessionLabel}>ADMIN</span>
                            <div className={styles.sessionCount}>
                                {metrics?.sessionStats?.admin?.toLocaleString() || '0'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h3>🔍 Búsquedas Populares</h3>
                    <div className={styles.popularSearches}>
                        {metrics?.popularSearches?.length > 0 ? (
                            metrics.popularSearches.map((search: any, index: number) => (
                                <div key={index} className={styles.searchItem}>
                                    <strong>{search.term}</strong>
                                    <span>{search.count} búsquedas</span>
                                </div>
                            ))
                        ) : (
                            <div className={styles.noData}>
                                <p>No hay datos de búsquedas recientes</p>
                                <small>Los usuarios aún no han realizado búsquedas</small>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 📊 ESTADO DE TRABAJOS */}
            {metrics?.jobsByStatus && (
                <div className={styles.jobsSection}>
                    <h3>📋 Estado de Trabajos</h3>
                    <div className={styles.jobsGrid}>
                        <div className={styles.jobStatusCard}>
                            <h4>🟡 Pendientes</h4>
                            <div className={styles.jobCount}>{metrics.jobsByStatus.pending || 0}</div>
                        </div>
                        <div className={styles.jobStatusCard}>
                            <h4>🟠 En Progreso</h4>
                            <div className={styles.jobCount}>{metrics.jobsByStatus.in_progress || 0}</div>
                        </div>
                        <div className={styles.jobStatusCard}>
                            <h4>✅ Completados</h4>
                            <div className={styles.jobCount}>{metrics.jobsByStatus.completed || 0}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* GRÁFICOS EXISTENTES */}
            <ChartsSection />
        </div>
    );
}