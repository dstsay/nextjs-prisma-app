import DynamicIcon from "@/layouts/helpers/DynamicIcon";
import Link from "next/link";

interface ISocial {
  name: string;
  icon: string;
  link: string;
}

interface Props {
  source: ISocial[];
  className: string;
}

export default function Social({ source, className }: Props) {
  return (
    <ul className={className}>
      {source.map((social: ISocial) => (
        <li key={social.name}>
          <Link
            aria-label={social.name}
            href={social.link}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            <span className="sr-only">{social.name}</span>
            <DynamicIcon className="inline-block" icon={social.icon} />
          </Link>
        </li>
      ))}
    </ul>
  );
}