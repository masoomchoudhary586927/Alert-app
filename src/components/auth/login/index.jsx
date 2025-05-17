import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from '../../../firebase/auth';
import { useAuth } from '../../../contexts/authContext';

const Login = () => {
    const { userLoggedIn } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!isSigningIn) {
            setIsSigningIn(true);
            setErrorMessage('');
            try {
                await doSignInWithEmailAndPassword(email, password);
            } catch (err) {
                console.error(err.message);
                setErrorMessage(handleFirebaseAuthError(err));
                setIsSigningIn(false);
            }
        }
    };

    const onGoogleSignIn = async (e) => {
        e.preventDefault();
        if (!isSigningIn) {
            setIsSigningIn(true);
            setErrorMessage('');
            try {
                await doSignInWithGoogle();
            } catch (err) {
                console.error(err.message);
                setErrorMessage(handleFirebaseAuthError(err));
                setIsSigningIn(false);
            }
        }
    };

    const handleFirebaseAuthError = (err) => {
        switch (err.code) {
            case 'auth/user-not-found':
                return 'No account found with this email.';
            case 'auth/wrong-password':
                return 'Incorrect password.';
            case 'auth/invalid-email':
                return 'Invalid email format.';
            case 'auth/too-many-requests':
                return 'Too many attempts. Please try again later.';
            case 'auth/invalid-credential':
                return 'Invalid login credentials. Please try again.';
            default:
                return 'Login failed. Please try again.';
        }
    };

    return (
        <div>
            {userLoggedIn && (<Navigate to={'/home'} replace={true} />)}

            <main className="w-full h-screen flex justify-center items-center">
                <div className="w-96 text-gray-600 space-y-5 p-4 shadow-xl border rounded-xl">
                    <div className="text-center">
                        <h3 className="text-gray-800 text-xl font-semibold sm:text-2xl">Welcome Back</h3>
                    </div>
                    <form onSubmit={onSubmit} className="space-y-5">
                        <div>
                            <label className="text-sm text-gray-600 font-bold">Email</label>
                            <input
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 font-bold">Password</label>
                            <input
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
                            />
                        </div>
                        {errorMessage && (
                            <span className="text-red-600 font-bold">{errorMessage}</span>
                        )}
                        <button
                            type="submit"
                            disabled={isSigningIn}
                            className={`w-full px-4 py-2 text-white font-medium rounded-lg ${isSigningIn ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transition duration-300'}`}
                        >
                            {isSigningIn ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                    <p className="text-center text-sm">
                        Don't have an account? <Link to="/register" className="hover:underline font-bold">Sign up</Link>
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm font-bold">
                        <div className="flex-grow border-b"></div>
                        <span>OR</span>
                        <div className="flex-grow border-b"></div>
                    </div>
                    <button
                        disabled={isSigningIn}
                        onClick={onGoogleSignIn}
                        className={`w-full flex items-center justify-center gap-x-3 py-2.5 border rounded-lg text-sm font-medium ${isSigningIn ? 'cursor-not-allowed' : 'hover:bg-gray-100 transition duration-300 active:bg-gray-100'}`}
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="google" className="w-5 h-5" />
                        {isSigningIn ? 'Signing In...' : 'Continue with Google'}
                    </button>
                    <Link
                         to="/staff-Login"
                         className="block w-full text-center py-2 text-sm font-bold text-indigo-600 hover:underline"
                                 >
                         Staff Login
                    </Link>

                </div>
            </main>
        </div>
    );
};

export default Login;
