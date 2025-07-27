import config from "@/config/config.json";
import CloudinaryImage from "../../../components/CloudinaryImage";
import Link from "next/link";

const Logo = ({ src }: { src?: string }) => {
  // destructuring items from config object
  const {
    logo,
    logo_width,
    logo_height,
    logo_text,
  } = config.site;
  
  const title = config.site.title;

  // Use Cloudinary public ID for logo
  const logoPublicId = "goldiegrace/static/logo";
  const fallbackPublicId = "goldiegrace/static/placeholder";

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
      {logo ? (
        <div style={{ width: `${width}px`, height: `${height}px`, position: 'relative' }}>
          <CloudinaryImage
            publicId={logoPublicId}
            alt={title}
            width={width}
            height={height}
            fallbackSrc={fallbackPublicId}
            priority
            transformation={{
              quality: 'auto:best',
              format: 'auto',
            }}
          />
        </div>
      ) : logo_text ? (
        logo_text
      ) : (
        title
      )}
    </Link>
  );
};

export default Logo;