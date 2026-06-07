import React from 'react';
import RegisterForm from '../components/RegisterForm';

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full" style={{ maxWidth: "480px" }}>
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;