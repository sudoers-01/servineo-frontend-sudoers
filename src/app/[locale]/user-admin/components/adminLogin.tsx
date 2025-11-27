'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/admin.module.css';
import { adminAPI } from '../lib/api';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
        // Conectando al backend
        const data = await adminAPI.login({ email, password });

        if (data.success) {
            // Guardar en localStorage
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminUser', JSON.stringify(data.admin));
            
            // Redirigir al dashboard
            router.push('/es/user-admin/dashboard');
        } else {
            alert(data.message || 'Credenciales incorrectas');
        }
        } catch (error) {
            console.error('Login error:', error);
            alert('Error del servidor - VERIFICA QUE EL BACKEND ESTE CORRIENDO');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.adminLoginContainer}>
            <div className={styles.loginHeader}>
                <h1 className={styles.logo}>SERVINEO</h1>
                <p className={styles.subtitle}>Admin Login</p>
                <h2 className={styles.welcome}>Welcome back, Admin</h2>
            </div>

            <form onSubmit={handleLogin} className={styles.loginForm}>
                <div className={styles.inputGroup}>
                <label htmlFor="email">Email address</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@servineo.com"
                    required
                />
                </div>

                <div className={styles.inputGroup}>
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                />
                </div>

                <button 
                type="submit" 
                className={styles.loginButton}
                disabled={loading}
                >
                {loading ? 'Signing In...' : 'Sign In as Admin'}
                </button>

                <div className={styles.backendStatus}>
                <p>🔗 Conectado al backend real</p>
                </div>
            </form>
        </div>
    );
}