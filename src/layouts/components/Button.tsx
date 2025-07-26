import Link from "next/link";
import React from "react";

interface Props {
  link?: string;
  label: string;
  enable?: boolean;
  style?: string;
  showIcon?: boolean;
  type?: "submit" | "reset" | "button";
  className?: string;
}

const Button: React.FC<Props> = ({
  enable = true,
  link,
  label,
  style,
  showIcon = true,
  type = "button",
  className: customClassName,
}) => {
  const baseClassName = style ?? "btn-primary";

  const bgHoverClass =
    baseClassName === "btn-primary"
      ? "bg-[#8B6F33]"
      : baseClassName === "btn-outline"
        ? "bg-white/50"
        : baseClassName === "btn-secondary"
          ? "bg-body"
          : "bg-body";

  const textHoverClass =
    baseClassName === "btn-primary"
      ? "group-hover:text-white"
      : baseClassName === "btn-outline"
        ? "group-hover:text-primary"
        : baseClassName === "btn-secondary"
          ? "group-hover:text-primary"
          : "group-hover:text-primary";

  return (
    <>
      {enable &&
        (link ? (
          <Link
            href={link}
            target={link.startsWith("http") ? "_blank" : "_self"}
            className={`btn ${baseClassName} relative overflow-hidden inline-block group ${customClassName || ''}`}
          >
            <span className="absolute left-1/2 top-0 h-full w-0 -translate-x-1/2 transition-all duration-500 [transition-timing-function:cubic-bezier(1,0,1,1)] group-hover:w-[200%]">
              <span
                className={`block h-full w-full skew-x-[45deg] ${bgHoverClass}`}
              />
            </span>
            <span
              className={`relative z-10 transition-colors duration-500 inline ${textHoverClass}`}
            >
              {label}
              {showIcon && (
                <svg
                  className="inline ml-2"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 28 28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1={7} y1={17} x2={17} y2={7} />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              )}
            </span>
          </Link>
        ) : (
          <button
            type={type}
            className={`btn ${baseClassName} relative overflow-hidden inline-block group ${customClassName || ''}`}
            disabled={!enable}
          >
            <span className="absolute left-1/2 top-0 h-full w-0 -translate-x-1/2 transition-all duration-500 [transition-timing-function:cubic-bezier(1,0,1,1)] group-hover:w-[200%]">
              <span
                className={`block h-full w-full skew-x-[45deg] ${bgHoverClass}`}
              />
            </span>
            <span
              className={`relative z-10 transition-colors duration-500 inline ${textHoverClass}`}
            >
              {label}
              {showIcon && (
                <svg
                  className="inline ml-2"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 28 28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1={7} y1={17} x2={17} y2={7} />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              )}
            </span>
          </button>
        ))}
    </>
  );
};

export default Button;