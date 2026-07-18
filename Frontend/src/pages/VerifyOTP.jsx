import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [resending, setResending] = useState(false);

  const inputs = useRef([]);

  // Input Change
  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  // Backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        inputs.current[index - 1].focus();
      }
    }
  };

  // Paste OTP
  const handlePaste = (e) => {
    e.preventDefault();

    const paste = e.clipboardData.getData("text").trim();

    if (!/^\d{6}$/.test(paste)) return;

    const arr = paste.split("");

    setOtp(arr);

    arr.forEach((digit, i) => {
      if (inputs.current[i]) {
        inputs.current[i].value = digit;
      }
    });

    inputs.current[5].focus();
  };


  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // Verify OTP
  const verifyOTP = async () => {
    const finalOTP = otp.join("");

    if (finalOTP.length !== 6) {
      alert("Please enter complete OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await apiFetch("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          email,
          otp: finalOTP,
        }),
      });

      if (res.success) {
        navigate("/reset-password", {
          state: { email },
        });
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };


  const resendOTP = async () => {
    try {
      setResending(true);

      const res = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({
          email,
        }),
      });

      if (res.success) {
        alert("OTP Sent Successfully");

        setTimer(60);
      }

    } catch (err) {
      alert(err.message);
    } finally {
      setResending(false);
    }
  };

 return (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center px-5">

    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.55)] p-10">

      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-blue-600/20 border border-blue-500 flex items-center justify-center">
          <span className="text-4xl">🔐</span>
        </div>
      </div>

      <h1 className="text-4xl font-bold text-center text-white">
        Verify OTP
      </h1>

      <p className="text-center text-gray-400 mt-3">
        We've sent a verification code to
      </p>

      <p className="text-center text-blue-400 font-semibold mt-1 break-all">
        {email}
      </p>

      <div
        onPaste={handlePaste}
        className="flex justify-between mt-10 gap-3"
      >
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputs.current[index] = el)}
            value={digit}
            maxLength={1}
            type="text"
            onChange={(e) =>
              handleChange(e.target.value, index)
            }
            onKeyDown={(e) =>
              handleKeyDown(e, index)
            }
            className="
              w-14
              h-16
              rounded-2xl
              bg-slate-900
              border
              border-slate-700
              text-white
              text-2xl
              text-center
              font-bold
              outline-none
              transition
              duration-300
              focus:border-blue-500
              focus:ring-4
              focus:ring-blue-500/30
            "
          />
        ))}
      </div>

      <button
        onClick={verifyOTP}
        disabled={loading}
        className="
          mt-10
          w-full
          py-4
          rounded-2xl
          font-semibold
          text-lg
          bg-gradient-to-r
          from-blue-600
          to-indigo-600
          hover:from-blue-500
          hover:to-indigo-500
          transition-all
          duration-300
          shadow-lg
          hover:shadow-blue-500/30
          text-white
        "
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

      <div className="mt-8 text-center">

      <p className="text-gray-400 text-sm">

      Didn't receive the code?

      </p>

      {timer > 0 ? (

      <p className="text-blue-400 mt-2 font-semibold">

      Resend in {timer}s

      </p>

      ) : (

      <button

      onClick={resendOTP}

      disabled={resending}

      className="text-blue-500 hover:text-blue-300 font-semibold transition"

      >

      {resending ? "Sending..." : "Resend OTP"}

      </button>

      )}

      </div>

    </div>

  </div>
);
};