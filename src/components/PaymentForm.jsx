// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "../styles/PaymentForm.css";

// function PaymentForm() {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     cardNumber: "",
//     expiry: "",
//     cvv: "",
//     amount: "",
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     console.log("Form data being sent:", formData); // 🔍 Debug log
  
//     try {
//       const response = await fetch("http://localhost:6001/process-payment", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });
  
//       const result = await response.json();
  
//       if (result.status === "Success") {
//         navigate("/success", {
//           state: { status: result.status, message: result.message || "Payment processed successfully!" },
//         });
//       } else {
//         throw new Error(result.message || "Unexpected response from server");
//       }
//     } catch (error) {
//       console.error("Payment failed:", error.message);
//       navigate("/success", {
//         state: { status: "Failed", message: error.message || "An error occurred during payment." },
//       });
//     }
//   };
  

  
//   return (
//     <div className="form-container">
//       <h1>Make your Payment</h1>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           name="cardNumber"
//           placeholder="Card Number"
//           maxLength="16"
//           required
//           value={formData.cardNumber}
//           onChange={handleChange}
//         />
//         <input
//           type="text"
//           name="expiry"
//           placeholder="MM/YY"
//           maxLength="5"
//           required
//           value={formData.expiry}
//           onChange={handleChange}
//         />
//         <input
//           type="text"
//           name="cvv"
//           placeholder="CVV"
//           maxLength="3"
//           required
//           value={formData.cvv}
//           onChange={handleChange}
//         />
//         <input
//           type="number"
//           name="amount"
//           placeholder="Amount"
//           required
//           value={formData.amount}
//           onChange={handleChange}
//         />
//         <button type="submit">Pay Now</button>
//       </form>
//     </div>
//   );
// }

// export default PaymentForm;


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PaymentForm.css";

function PaymentForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    amount: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form data being sent:", formData);

    // Check if geolocation is available in the browser
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    // Get current geolocation (latitude and longitude)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Prepare the payment data with the location
        const paymentData = {
          ...formData,
          location: {
            lat: latitude,
            long: longitude,
          },
        };

        try {
          // Send payment data to the backend
          const response = await fetch("http://localhost:6001/process-payment", {
            // Update the backend URL if necessary
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(paymentData),
          });

          const result = await response.json();

          if (result.status === "Success") {
            navigate("/success", {
              state: {
                status: result.status,
                message: result.message || "Payment processed successfully!",
              },
            });
          } else {
            throw new Error(result.message || "Unexpected response from server");
          }
        } catch (error) {
          console.error("Payment failed:", error.message);
          navigate("/failure", {  // Redirect to failure page if payment fails
            state: {
              status: "Failed",
              message: error.message || "An error occurred during payment.",
            },
          });
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Location access denied. Cannot proceed with payment.");
      }
    );
  };

  return (
    <div className="form-container">
      <h1>Make your Payment</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="cardNumber"
          placeholder="Card Number"
          maxLength="16"
          required
          value={formData.cardNumber}
          onChange={handleChange}
        />
        <input
          type="text"
          name="expiry"
          placeholder="MM/YY"
          maxLength="5"
          required
          value={formData.expiry}
          onChange={handleChange}
        />
        <input
          type="text"
          name="cvv"
          placeholder="CVV"
          maxLength="3"
          required
          value={formData.cvv}
          onChange={handleChange}
        />
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          required
          value={formData.amount}
          onChange={handleChange}
        />
        <button type="submit">Pay Now</button>
      </form>
    </div>
  );
}

export default PaymentForm;
