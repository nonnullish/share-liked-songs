import { ReactNode } from "react";
import "./form.css";

interface IProps {
  onSubmit: (args?: any) => any;
  children: ReactNode;
}

export const Form = ({ onSubmit, children }: IProps) => {
  return (
    <form className="form" onSubmit={onSubmit}>
      {children}
    </form>
  );
};
