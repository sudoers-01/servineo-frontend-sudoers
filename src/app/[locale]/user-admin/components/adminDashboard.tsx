'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/admin.module.css';

export default function AdminDashboard() {
    const [metrics, setMetrics] = useState(null);
    const router = useRouter();

    useEffect(() => {
        // Verificar autenticación
        const token = localStorage.getItem('adminToken');
        if (!token) {
        router.push('/user-admin');
        return;
        }
        
        loadMetrics();
    }, [router]);

    const loadMetrics = async () => {
        try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/admin/metrics', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        setMetrics(data.metrics);
        } catch (error) {
        console.error('Error loading metrics:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        router.push('/user-admin');
    };

    if (!metrics) return <div className={styles.loading}>Loading...</div>;

    return (
        <div className={styles.dashboard}>
        <header className={styles.dashboardHeader}>
            <h1 className={styles.dashboardTitle}>SERVINEO</h1>
            <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
            </button>
        </header>

        <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
            <h3>Total Sessions</h3>
            <div className={styles.metricValue}>16,772</div>
            <div className={styles.metricTrend}>+1348</div>
            </div>

            <div className={styles.metricCard}>
            <h3>Searches</h3>
            <div className={styles.metricValue}>2,367</div>
            <div className={styles.metricTrend}>+563</div>
            </div>

            <div className={styles.metricCard}>
            <h3>Top Search plomeria</h3>
            <div className={styles.metricValue}>456</div>
            </div>
        </div>

        <div className={styles.dashboardContent}>
            <div className={styles.section}>
            <h3>Session Statistics</h3>
            <div className={styles.sessionStats}>
                <div className={styles.sessionType}>
                <span className={styles.sessionLabel}>REQUESTER</span>
                </div>
                <div className={styles.sessionType}>
                <span className={styles.sessionLabel}>FIXER</span>
                </div>
                <div className={styles.sessionType}>
                <span className={styles.sessionLabel}>VISITOR</span>
                </div>
            </div>
            </div>

            <div className={styles.section}>
            <h3>Popular Searches</h3>
            <div className={styles.popularSearches}>
                <div className={styles.searchItem}>
                <strong>Plomeria</strong>
                </div>
                <div className={styles.searchItem}>
                <strong>Electricista</strong>
                </div>
                <div className={styles.searchItem}>
                <strong>Carpinteria</strong>
                </div>
            </div>
            </div>
        </div>
        </div>
    );
}