import React from 'react';
import LoginForm from '../components/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="w-full" style={{ maxWidth: "480px" }}>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;