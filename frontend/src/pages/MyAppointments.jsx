import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const MyAppointments = () => {
    const { backendUrl, token } = useContext(AppContext);
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Format slot date correctly
    const slotDateFormat = (slotDate) => {
        const dateArray = slotDate.split('_');
        return `${dateArray[0]} ${months[Number(dateArray[1]) - 1]} ${dateArray[2]}`;
    };

    // Fetch user appointments (backend has all, frontend shows only 10)
    const getUserAppointments = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/appointments`, { headers: { token } });
            setAppointments(data.appointments.reverse().slice(0, 10)); // Show only the latest 10 appointments
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch appointments");
        }
    };

    // Cancel an appointment
    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/cancel-appointment`,
                { appointmentId },
                { headers: { token } }
            );
            if (data.success) {
                toast.success(data.message);
                getUserAppointments();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to cancel appointment");
        }
    };

    // Handle payment
    const handlePayment = async (appointment) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/payment-razorpay`,
                { appointmentId: appointment._id, amount: appointment.fee },
                { headers: { token } }
            );

            if (data.success) {
                toast.success("Redirecting to payment gateway...");
                window.location.href = data.payment_url; // Redirect to payment
            } else {
                toast.error("Payment initiation failed.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong with payment.");
        }
    };

    useEffect(() => {
        if (token) {
            getUserAppointments();
        }
    }, [token]);

    return (
        <div>
            <p className='pb-3 mt-12 text-lg font-medium text-gray-600 border-b'>My appointments</p>
            <div>
                {appointments.map((item, index) => (
                    <div key={index} className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b'>
                        <div>
                            <img className='w-36 bg-[#EAEFFF]' src={item.docData.image} alt="Doctor" />
                        </div>
                        <div className='flex-1 text-sm text-[#5E5E5E]'>
                            <p className='text-[#262626] text-base font-semibold'>{item.docData.name}</p>
                            <p>{item.docData.speciality}</p>
                            <p className='text-[#464646] font-medium mt-1'>Address:</p>
                            <p>{item.docData.address.line1}</p>
                            <p>{item.docData.address.line2}</p>
                            <p className='mt-1'><span className='text-sm text-[#3C3C3C] font-medium'>Date & Time:</span> {slotDateFormat(item.slotDate)} | {item.slotTime}</p>
                        </div>
                        <div className='flex flex-col gap-2 justify-end text-sm text-center'>
                            {/* If appointment is cancelled */}
                            {item.cancelled && !item.isCompleted && (
                                <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>
                                    Appointment cancelled
                                </button>
                            )}

                            {/* If appointment is completed */}
                            {item.isCompleted && (
                                <button className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500'>
                                    Completed
                                </button>
                            )}

                            {/* If appointment is neither cancelled nor completed */}
                            {!item.cancelled && !item.isCompleted && (
                                <>
                                    <button onClick={() => cancelAppointment(item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'>
                                        Cancel appointment
                                    </button>
                                    {!item.isPaid && (
                                        <button onClick={() => handlePayment(item)} className='text-white bg-blue-500 sm:min-w-48 py-2 rounded hover:bg-blue-700 transition-all duration-300'>
                                            Pay Now
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyAppointments;
