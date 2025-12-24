import { useState } from "react";
import Signup from "./sign up/Signup";
import SignIn from "./sign in/SignIn";
import ForgotPassword from "./forgotPassword/ForgotPassword";
import ResetPassword from "./forgotPassword/ResetPassword";

function AuthContainer({ onClose }) {
  const [step, setStep] = useState(1);
  const [passwordShow, setPasswordShow] = useState(false);
  const [resetToken, setResetToken] = useState(null);

  return (
    <div className="w-[95%] mx-auto">
      {step === 1 ? (
        <SignIn
          passwordShow={passwordShow}
          setPasswordShow={setPasswordShow}
          setStep={setStep}
          onClose={onClose}
        />
      ) : step === 2 ? (
        <Signup
          passwordShow={passwordShow}
          setPasswordShow={setPasswordShow}
          setStep={() => setStep(1)}
          onClose={onClose}
        />
      ) : step === 3 ? (
        <ForgotPassword setStep={setStep} setResetToken={setResetToken} />
      ) : (
        <ResetPassword token={resetToken} onClose={onClose} />
      )}
    </div>
  );
}

export default AuthContainer;
