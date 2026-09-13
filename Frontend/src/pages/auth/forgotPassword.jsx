import React, {useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react';

const forgotPassword = () => {

    const [email, setEmail] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async(e)=>{
      e.preventDefault();
      try{
        if(!otpSent){
          const response= await fetch(
            `${import.meta.env.VITE_API_URL}/api/auth/reset-password/request`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email })
            }
          );
          const data = await response.json();
          if (response.ok) {
            setOtpSent(true);
          }
          console.log("Forgot Password Response:", data);
        }
        else{
          const response= await fetch(
            `${import.meta.env.VITE_API_URL}/api/auth/reset-password/verify`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email, otp })
            }
          );
          const data = await response.json();
          if (response.ok) {
            // Handle successful OTP verification
            const resetToken = data.resetToken;
            sessionStorage.setItem("resetToken", resetToken);
            navigate('/resetpassword');
          }
          console.log("OTP Verification Response:", data);
        }

      }catch(err){
        console.log("Error:",err);
      }
    }

  return (
    <div className="bg-gray-50 h-screen flex items-center justify-center">

        <div className="flex flex-col items-center w-[90%] max-w-md justify-center border bg-white border-purple-50 shadow-xl rounded-xl py-10 px-6">
            
            <Link to='/login' className='text-blue-700 flex self-start'>
                <ArrowLeft className='size-5' /> Back to Login
            </Link>

            <h1 className='flex justify-center text-2xl font-bold'>Forgot Password</h1>

            <p className='py-2 w-[90%]'>{otpSent ? "OTP sent successfully!" : "Enter your email address and we'll send you an OTP to reset your password."}</p>

            <div className='flex flex-col justify-center w-[90%] my-2'>
                <h2 className='font-medium'>Email</h2>
                <input 
                    type="text" 
                    placeholder="Enter your email" 
                    className=' border-black border rounded-xl py-2 px-4' 
                    value={email}
                    onChange={(e)=> setEmail(e.target.value)}
                    />
            </div>
            {otpSent && (
                <div className="flex flex-col w-[90%] my-2">
                    <h2 className="font-medium">OTP</h2>
                    <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="border-black border rounded-xl py-2 px-4"
                    />
                </div>
            )}

            <button 
                onClick={handleSubmit}
                className='flex justify-center bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 my-2 rounded-xl w-[90%] h-10 border border-blue-900' 
            >
                {!otpSent && <span>Send OTP</span>}
                {otpSent && <span>Verify OTP</span>}
            </button>

        </div>
        
    </div>
  )
}

export default forgotPassword