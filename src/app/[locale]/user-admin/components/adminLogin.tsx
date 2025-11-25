'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/admin.module.css';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
        const response = await fetch('/api/auth/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('adminToken', data.token);
            router.push('/user-admin/dashboard');
        } else {
            alert('Credenciales incorrectas');
        }
        } catch (error) {
        console.error('Login error:', error);
        alert('Error del servidor');
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
                placeholder="Enter your email"
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
                placeholder="Enter your password"
                required
            />
            </div>

            <div className={styles.forgotPassword}>
            <a href="#">Forgot password</a>
            </div>

            <button type="submit" className={styles.loginButton}>
            Sign In
            </button>

            <div className={styles.signupLink}>
            <span>Dont have an account? </span>
            <a href="#">Sign Up</a>
            </div>

            <div className={styles.googleLogin}>
            <button type="button" className={styles.googleButton}>
                Sign in with Google
            </button>
            </div>
        </form>
        </div>
    );
}