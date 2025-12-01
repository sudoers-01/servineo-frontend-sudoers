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

            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <h3>Total Sessions</h3>
                    <div className={styles.metricValue}>
                        {metrics?.totalSessions?.toLocaleString()}
                    </div>
                    <div className={styles.metricTrend}>+1348</div>
                </div>

                <div className={styles.metricCard}>
                    <h3>Searches</h3>
                    <div className={styles.metricValue}>
                        {metrics?.searches?.toLocaleString()}
                    </div>
                    <div className={styles.metricTrend}>+563</div>
                </div>

                <div className={styles.metricCard}>
                    <h3>Top Search plomeria</h3>
                    <div className={styles.metricValue}>
                        {metrics?.topSearch}
                    </div>
                </div>
            </div>

            <div className={styles.dashboardContent}>
                <div className={styles.section}>
                    <h3>Session Statistics</h3>
                    <div className={styles.sessionStats}>
                        <div className={styles.sessionType}>
                            <span className={styles.sessionLabel}>REQUESTER</span>
                            <div className={styles.sessionCount}>
                                {metrics?.sessionStats?.requester?.toLocaleString()}
                            </div>
                        </div>
                        <div className={styles.sessionType}>
                            <span className={styles.sessionLabel}>FIXER</span>
                            <div className={styles.sessionCount}>
                                {metrics?.sessionStats?.fixer?.toLocaleString()}
                            </div>
                        </div>
                        <div className={styles.sessionType}>
                            <span className={styles.sessionLabel}>VISITOR</span>
                            <div className={styles.sessionCount}>
                                {metrics?.sessionStats?.visitor?.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h3>Popular Searches</h3>
                    <div className={styles.popularSearches}>
                        {metrics?.popularSearches?.map((search: any, index: number) => (
                        <div key={index} className={styles.searchItem}>
                            <strong>{search.term}</strong>
                            <span>{search.count} searches</span>
                        </div>
                        ))}
                    </div>
                </div>
            </div>

            <ChartsSection />
        </div>
    );
}