import { ReactNode } from "react";
import "./button.css";

interface IProps {
  onClick: (args?: any) => any;
  disabled?: boolean;
  children: ReactNode;
}

export const Button = ({ onClick, disabled, children }: IProps) => {
  return (
    <button
      className="button"
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};