import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        const { error } = isRegistering
            ? await supabase.auth.signUp({ email, password })
            : await supabase.auth.signInWithPassword({ email, password });

        if (error) setErrorMsg(error.message);
    };

    return (
        <div>
            <h1>{isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                />
                <button type="submit">{isRegistering ? 'Registrarse' : 'Entrar'}</button>
            </form>
            {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
            <button onClick={() => setIsRegistering(!isRegistering)}>
                {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
        </div>
    );
}

export default Auth;