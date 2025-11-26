'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/admin.module.css';
import { mockAuth } from '../lib/mockAuth';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
        // Usar el mock en lugar del backend real
        const data = await mockAuth.adminLogin(email, password);

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
        alert('Error del servidor');
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className={styles.adminLoginContainer}>
        <div className={styles.loginHeader}>
            <h1 className={styles.logo}>SERVINEO</h1>
            <p className={styles.subtitle}>Please enter your details</p>
            <h2 className={styles.welcome}>Welcome back</h2>
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
                placeholder="admin123"
                required
            />
            </div>

            <div className={styles.forgotPassword}>
            <a href="#">Forgot password</a>
            </div>

            <button 
            type="submit" 
            className={styles.loginButton}
            disabled={loading}
            >
            {loading ? 'Loading...' : 'Sign In'}
            </button>

            <div className={styles.demoCredentials}>
            <p><strong>Demo Credentials:</strong></p>
            <p>Email: admin@servineo.com</p>
            <p>Password: admin123</p>
            </div>
        </form>
        </div>
    );
}