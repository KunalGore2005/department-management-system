import React, { useActionState } from 'react'
import { Eye, EyeOff } from "lucide-react";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';


const login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async(e)=>{
        e.preventDefault();
        try{
            const response= await fetch(
                `${import.meta.env.VITE_API_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ email, password })
                }
            );
            const data= await response.json();
            console.log("Login Response:", data);
            if (response.ok) {
                if (
                    data.is_first_login === true ||
                    data.is_first_login === 1
                ) {
                    navigate("/forgotpassword");
                } else {
                    navigate("/");
                }
            }
        }catch(err){
            console.log("Error:",err);
        }
    }

  return (
    <div className="bg-gray-50 h-screen flex items-center justify-center">

        <div className="flex flex-col items-center w-[90%] max-w-md justify-center border bg-white border-purple-50 shadow-xl rounded-xl py-10 px-6">
            
            <h1 className='flex justify-center text-2xl font-bold'>Login</h1>

            <form className='flex flex-col items-center w-full' onSubmit={handleSubmit}>

            {/* email */}
            <div className='flex flex-col justify-center w-[90%] my-2'>
                <h2 className='font-medium'>Email</h2>
                <input 
                    type="text" 
                    placeholder="Enter your email" 
                    className=' border-black border rounded py-2 px-4' 
                    value={email}
                    autoComplete="email"
                    onChange={(e)=> setEmail(e.target.value)}
                    />
            </div>
            
            {/* password */}
            <div className='flex flex-col justify-center w-[90%] my-2'>
                <h2 className='font-medium'>Password</h2>
                <div className="relative w-full">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="border-black border rounded py-2 px-4 pr-10 w-full"
                        value={password}
                        autoComplete='current-password'
                        onChange={(e)=> setPassword(e.target.value)}
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                <Link to="/forgotPassword" className='flex flex-row-reverse text-blue-700'>Forgot Password?</Link>
            </div>

            {/* button */}
            <button 
                onClick={handleSubmit}
                className='flex justify-center bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 my-2 rounded w-[90%] h-10' 
            >
                Login
            </button>

            </form>
        </div>
        
    </div>
  )
}

export default login