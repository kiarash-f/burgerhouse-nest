import { useForm } from "react-hook-form";

function Login({ setStep }) {
  const { handleSubmit, register } = useForm();
  return (
    <form>
      <button
        className="text-[10px] underline text-blue-700 cursor-pointer"
        onClick={setStep}
      >
        حساب کاربری ندارید؟ ایجاد حساب کاربری جدید
      </button>
    </form>
  );
}

export default Login;
