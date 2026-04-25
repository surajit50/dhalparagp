import React from "react";
import { MdError } from "react-icons/md";

interface ErrorFormProps {
  message?: string;
}

const ErrorForm = ({ message }: ErrorFormProps) => {
  if (!message) return null;
  return (
    <p
      className="text-red-600 rounded-xl p-2 text-center
     justify-center items-center mb-2 mt-2 text-lg  flex gap-2"
    >
      <MdError size={10} /> {message}
    </p>
  );
};

export default ErrorForm;
