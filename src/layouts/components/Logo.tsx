import config from "@/config/config.json";
import ImageFallback from "@/layouts/helpers/ImageFallback";
import Link from "next/link";

const Logo = ({ src }: { src?: string }) => {
  // destructuring items from config object
  const {
    logo,
    logo_width,
    logo_height,
    logo_text,
    title,
  }: {
    logo: string;
    logo_width: string | number;
    logo_height: string | number;
    logo_text: string;
    title: string;
  } = config.site;

  const logoPath = src ? src : logo;

  // Convert width and height to numbers
  const width =
    typeof logo_width === "string"
      ? parseInt((logo_width as string).replace("px", ""))
      : logo_width;
  const height =
    typeof logo_height === "string"
      ? parseInt((logo_height as string).replace("px", ""))
      : logo_height;

  return (
    <Link href="/" className="navbar-brand inline-block">
      {logoPath ? (
        <ImageFallback
          width={width * 2}
          height={height * 2}
          src={logoPath}
          alt={title}
          priority
          style={{
            height: `${height}px`,
            width: `${width}px`,
          }}
        />
      ) : logo_text ? (
        logo_text
      ) : (
        title
      )}
    </Link>
  );
};

export default Logo;