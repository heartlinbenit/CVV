import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import OTPModal from './OTPModal';
import '../styles/PaymentForm.css'; // Assuming styles are in PaymentForm.css

function PaymentForm() {
    const navigate = useNavigate();
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [amount, setAmount] = useState('');
    const [phone, setPhone] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchPhone = async () => {
            try {
                const res = await axios.get('http://localhost:5000/user-phone');
                setPhone(res.data.phone);
            } catch (err) {
                console.error('Failed to fetch phone number', err);
            }
        };

        fetchPhone();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await axios.post('http://localhost:4000/send_otp', {
                cardNumber,
                expiry,
                cvv,
                amount: parseFloat(amount),
                phone
            });
            setShowModal(true);
        } catch (err) {
            const errMsg = err.response?.data?.error || 'Error sending OTP';
            setError(errMsg);
            handlePaymentFailure();
        }
    };

    const handleOtpClose = () => {
        setShowModal(false);
    };
    const handlePaymentFailure = () => {
        setShowModal(false);
        navigate('/success', {
            state: {
                status: 'Failed',
                message: 'Payment failed. Please try again.',
            },
        });
    };

    const handlePaymentSuccess = () => {
        setShowModal(false);
        navigate('/success', {
            state: {
                status: 'Success',
                message: 'Payment processed successfully!',
            },
        });

        setCardNumber('');
        setExpiry('');
        setCvv('');
        setAmount('');
    };


    return (
        <div className="form-container">
            <h1>Payment Form</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 16) {
                            setCardNumber(val);
                            if (val.length === 16) setError('');
                            else setError('Card number must be 16 digits');
                        }
                    }}
                    placeholder="Card Number"
                    required
                />

                <input
                    type="text"
                    value={expiry}
                    onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length >= 3) {
                            val = val.slice(0, 2) + '/' + val.slice(2, 4);
                        }
                        val = val.slice(0, 5);
                        setExpiry(val);
                        if (/^\d{2}\/\d{2}$/.test(val)) setError('');
                        else setError('Expiry must be in MM/YY format');
                    }}
                    placeholder="Expiry (MM/YY)"
                    required
                />

                <input
                    type="password"
                    value={cvv}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 3) {
                            setCvv(val);
                            if (val.length === 3) setError('');
                            else setError('CVV must be 3 digits');
                        }
                    }}
                    placeholder="CVV"
                    required
                />

                <input
                    type="text"
                    value={amount}
                    onChange={(e) => {
                        const val = e.target.value;

                        // Allow only digits
                        if (!/^\d*$/.test(val)) return;

                        // Block if more than 4 digits
                        if (val.length > 4) return;

                        setAmount(val);

                        const num = parseFloat(val);
                        if (!isNaN(num) && num >= 100 && num <= 9500) {
                            setError('');
                        } else {
                            setError('Amount must be between 100 and 9500');
                        }
                    }}
                    placeholder="Amount"
                    required
                />


                <button type="submit">Pay</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            {showModal && (
                <OTPModal
                    phone={phone}
                    cardNumber={cardNumber}
                    expiry={expiry}
                    cvv={cvv}
                    amount={parseFloat(amount)}
                    onSuccess={handlePaymentSuccess}
                    onFailure={handlePaymentFailure}
                    onClose={handleOtpClose}
                />
            )}
        </div>
    );
}

export default PaymentForm;
