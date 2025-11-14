import TextField from "@/components/modules/TextField";
import signUpApi from "@/components/services/authService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

function Signup({ setStep, onClose }) {
  const { isPending, createNewUser } = CreateUser();
  const [passwordShow, setPasswordShow] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
  } = useForm();

  const onSubmit = async (data) => {
    const newUser = {
      email: data?.email,
      password: data?.password,
      name: data?.name,
      lastname: data?.lastname,
      mobile: data?.mobile,
      address: data?.address,
    };
    console.log(data);
    await createNewUser(newUser);
    onClose();
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      {/* Email */}
      <TextField
        errors={errors}
        label="ایمیل"
        name="email"
        register={register}
        type="email"
      />
      {/* Password */}
      <TextField
        errors={errors}
        label="رمز عبور"
        name="password"
        register={register}
        type="password"
      />
      {/* Name */}
      <TextField
        errors={errors}
        label="نام"
        name="name"
        register={register}
        type="text"
      />
      {/* Last Name */}
      <TextField
        errors={errors}
        label="نام خانوادگی"
        name="lastname"
        register={register}
        type="text"
      />
      <TextField
        errors={errors}
        label="شماره همراه"
        name="mobile"
        register={register}
        type="tel"
      />
      <TextField
        errors={errors}
        label="آدرس محل سکونت"
        name="address"
        register={register}
        type="text"
      />
      <button
        className="text-[10px] underline text-blue-700 cursor-pointer"
        onClick={setStep}
      >
        حساب کاربری دارید؟ وارد شوید
      </button>
      <div className="w-full">
        <button
          type="submit"
          className="submitBtn"
          disabled={!isValid || isPending}
        >
          {isPending ? "..." : "ایجاد حساب کاربری"}
        </button>
      </div>
    </form>
  );
}

export default Signup;

function CreateUser() {
  const queryClient = useQueryClient();
  const { isPending, mutateAsync: createNewUser } = useMutation({
    mutationFn: signUpApi,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      toast.success("حساب کاربری با موفقیت ایجاد شد");
    },
    onError: (error) => {
      toast.error(error?.message || "ایجاد حساب کاربری با موفقیت انجام نشد");
    },
  });
  return { isPending, createNewUser };
}
