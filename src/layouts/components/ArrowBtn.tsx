import { markdownify } from "@/lib/utils/textConverter";
import Link from "next/link";

interface Props {
  label: string;
  link: string;
}

export default function ArrowBtn({ label, link }: Props) {
  return (
    <Link
      target="_blank"
      className="text-white group capitalize hover:underline flex items-center max-w-max gap-1"
      href={link}
    >
      <span dangerouslySetInnerHTML={{ __html: markdownify(label) }} />
      <div className="sr-only">Footer Button</div>
      <div className="relative w-5 h-5 grid place-items-center overflow-hidden">
        <i className="text-body -rotate-45 absolute top-full right-full group-hover:translate-x-full group-hover:-translate-y-full transition-transform duration-500 ease-out w-5 h-5 grid place-items-center">
          <svg
            stroke="currentColor"
            fill="none"
            strokeWidth={0}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            ></path>
          </svg>
        </i>
      </div>
    </Link>
  );
}