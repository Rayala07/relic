import React from 'react';
import RegisterForm from '../components/RegisterForm';

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000000] px-6" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="w-full" style={{ maxWidth: "480px" }}>
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;