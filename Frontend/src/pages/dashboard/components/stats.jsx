import React from 'react'

const Stats = (props) => {
    return (
        <div className="flex flex-1 flex-col justify-center items-center  bg-blue-200 p-2 py-4 hover:bg-blue-900 hover:text-white
         dark:bg-gray-800 rounded-lg shadow-md dark:hover:bg-blue-300 dark:hover:text-black
         ">
            <div className='font-medium'>{props.title}</div>

            <div className="text-2xl font-bold">
                {props.value}
            </div>
        </div>
    );
};

export default Stats