import { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";

function AuthContainer({ onClose }) {
  const [step, setStep] = useState(1);

  return (
    <div className="w-[95%] mx-auto">
      {step === 1 ? (
        <Login setStep={() => setStep(2)} />
      ) : (
        <Signup setStep={() => setStep(1)} onClose={onClose} />
      )}
    </div>
  );
}

export default AuthContainer;
