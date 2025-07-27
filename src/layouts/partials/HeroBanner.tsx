"use client";

import { useState, useEffect } from "react";
import Button from "@/layouts/components/Button";
import CloudinaryImage from "../../../components/CloudinaryImage";

interface BannerData {
  title: string;
  content: string;
  image: string;
  spinning_text?: string;
  button: {
    enable: boolean;
    label: string;
    link: string;
  };
}

const HeroBanner = ({ banner }: { banner: BannerData }) => {
  // Cloudinary public IDs for banner images
  const cloudinaryImages = [
    "goldiegrace/static/banner2",
    "goldiegrace/static/banner"
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % cloudinaryImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [cloudinaryImages.length]);

  return (
    <section className="section !py-0 md:!py-20 relative h-[100dvh] h-screen md:h-[calc(65svh)] lg:h-[calc(100svh_-_28px)] overflow-hidden min-h-[500px] landscape:min-h-[400px]">
      {/* Background images with fade transition */}
      {cloudinaryImages.map((publicId, index) => (
        <div
          key={publicId}
          className={`absolute inset-0 transition-opacity duration-[2000ms] ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <CloudinaryImage
            publicId={publicId}
            alt={`Banner ${index + 1}`}
            fill
            className="object-cover"
            transformation={{ 
              quality: 'auto:good',
              format: 'auto',
              crop: 'fill',
            }}
            priority={index === 0}
            sizes="100vw"
          />
        </div>
      ))}
      {/* Translucent black overlay */}
      <div className="absolute inset-0 bg-black/30 z-10"></div>
      
      <div className="container h-full lg:h-full relative z-30 pt-safe pb-safe">
        <div className="row h-full md:items-center justify-center text-center">
          <div className="md:col-8 relative flex flex-col h-full md:h-auto justify-start md:justify-center md:block">
            {/* Spacer for mobile positioning - positions text at 25% from top */}
            <div className="md:hidden" style={{ height: '25vh' }}></div>
            <div className="relative">
              <h1
                data-aos="fade-up-sm"
                data-aos-delay="100"
                className="text-[2.25rem] min-[380px]:text-[2.75rem] md:h1 text-white lg:text-[5rem] xl:text-[6rem] font-medium leading-tight xl:leading-[6.56rem] tracking-tight text-balance"
              >
                {banner.title}
              </h1>
              {/* Rotating Text Decoration */}
              {banner.spinning_text && (
                <span
                  data-aos="fade-up-sm"
                  data-aos-delay="150"
                  className="absolute top-[0.55em] -right-[0.7em] translate-y-[-25%] translate-x-[5%] w-[200px] h-[200px]"
                >
                  <svg
                    className="absolute inset-0 w-full h-full scale-[0.6] lg:scale-[0.8] spin-animation origin-center"
                    viewBox="0 0 220 220"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="110"
                      cy="110"
                      r="108"
                      stroke="white"
                      strokeOpacity={0.5}
                      strokeWidth={1}
                      fill="none"
                    />
                    <circle
                      cx="110"
                      cy="110"
                      r="70"
                      stroke="white"
                      strokeOpacity={0.5}
                      strokeWidth={1}
                      fill="none"
                    />
                    <path
                      id="circlePath"
                      d="M 110,110 m -85,0 a 85,85 0 1,1 170,0 a 85,85 0 1,1 -170,0"
                      fill="none"
                    />
                    <text>
                      <textPath
                        href="#circlePath"
                        startOffset="0"
                        textLength="520"
                        style={{
                          fontSize: "20px",
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 500,
                          letterSpacing: "2px",
                          fill: "white",
                          opacity: 0.6,
                        }}
                      >
                        {banner.spinning_text}
                      </textPath>
                    </text>
                  </svg>
                </span>
              )}
              {/* /Rotating Text Decoration */}
            </div>
            <div className="flex flex-col items-center gap-6 md:gap-6 mt-8 md:mt-10">
              <p
                data-aos="fade-up-sm"
                data-aos-delay="300"
                className="text-xl min-[380px]:text-2xl md:text-xl text-white text-balance leading-[28px] min-[380px]:leading-[34px] font-medium"
              >
                {banner.content}
              </p>
              <div data-aos="fade-up-sm" data-aos-delay="450" className="mt-8 md:mt-0 w-full md:w-auto">
                <Button 
                  enable={banner.button.enable}
                  link={banner.button.link}
                  label={banner.button.label}
                  style="btn-primary"
                  className="!text-lg min-[380px]:!text-xl md:!text-lg !px-10 min-[380px]:!px-12 !py-4 min-[380px]:!py-5 md:!px-10 md:!py-4 !font-semibold !w-full md:!w-auto !shadow-lg hover:!shadow-xl !transition-all"
                />
              </div>
            </div>
            {/* Bottom spacer for mobile - responsive based on viewport height */}
            <div className="md:hidden" style={{ minHeight: 'clamp(40px, 10vh, 80px)' }}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;