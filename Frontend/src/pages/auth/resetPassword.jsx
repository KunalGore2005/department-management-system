import React, {useState} from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft} from 'lucide-react';

const resetPassword = () => {

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async(e)=>{
      e.preventDefault();
      if (newPassword !== confirmPassword) {
        console.log("Passwords do not match");
        return;
      }
      try{
        const response= await fetch(
            `${import.meta.env.VITE_API_URL}/api/auth/reset-password/confirm`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionStorage.getItem('resetToken')}`
                },
                body: JSON.stringify({ newPassword })
            }
        );
        const data = await response.json();
        console.log("Reset Password Response:", data);

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

            <h1 className='flex justify-center text-2xl font-bold'>Reset Password</h1>


            <form className='flex flex-col items-center w-full' onSubmit={handleSubmit}> 
                {/* New Password */}
                <div className='flex flex-col justify-center w-[90%] my-2'>
                    <h2 className='font-medium'>New Password</h2>
                    <input 
                        type="password" 
                        placeholder="Enter new password" 
                        className=' border-black border rounded-xl py-2 px-4' 
                        value={newPassword}
                        autoComplete='current-password'
                        onChange={(e)=> setNewPassword(e.target.value)}
                        />
                </div>

                {/* Confirm New Password */}
                <div className="flex flex-col w-[90%] my-2">
                    <h2 className="font-medium">Confirm New Password</h2>
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        autoComplete='current-password'
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="border-black border rounded-xl py-2 px-4"
                    />
                </div>

                <button 
                    onClick={handleSubmit}
                    className='flex justify-center bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 my-2 rounded-xl w-[90%] h-10 border border-blue-900' 
                    >
                    Reset Password
                </button>
            </form>

        </div>
        
    </div>
  )
}

export default resetPassword