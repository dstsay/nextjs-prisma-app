"use client";

import { useState, useEffect } from "react";
import Button from "@/layouts/components/Button";

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
  const images = ["/images/banner2.jpeg", "/images/banner.jpg"];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="section relative bg-cover bg-center h-[100dvh] h-screen md:h-[calc(65svh)] lg:h-[calc(100svh_-_28px)] overflow-hidden min-h-[600px]">
      {/* Background images with fade transition */}
      {images.map((image, index) => (
        <div
          key={index}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms]"
          style={{
            backgroundImage: `url(${image})`,
            opacity: index === currentImageIndex ? 1 : 0,
          }}
        />
      ))}
      {/* Translucent black overlay */}
      <div className="absolute inset-0 bg-black/30 z-10"></div>
      
      <div className="container h-full lg:h-full relative z-30">
        <div className="row h-full md:items-center justify-center text-center">
          <div className="md:col-8 relative flex flex-col h-full md:h-auto justify-center md:block">
            {/* Spacer for mobile positioning */}
            <div className="flex-grow md:hidden" style={{ minHeight: '15vh' }}></div>
            <div className="relative">
              <h1
                data-aos="fade-up-sm"
                data-aos-delay="100"
                className="text-[2.75rem] md:h1 text-white lg:text-[5rem] xl:text-[6rem] font-medium leading-tight xl:leading-[6.56rem] tracking-tight text-balance"
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
                className="text-2xl md:text-xl text-white text-balance leading-[34px] font-medium"
              >
                {banner.content}
              </p>
              <div data-aos="fade-up-sm" data-aos-delay="450" className="mt-8 md:mt-0 w-full md:w-auto">
                <Button 
                  enable={banner.button.enable}
                  link={banner.button.link}
                  label={banner.button.label}
                  style="btn-primary"
                  className="!text-xl md:!text-lg !px-12 !py-5 md:!px-10 md:!py-4 !font-semibold !w-full md:!w-auto !shadow-lg hover:!shadow-xl !transition-all"
                />
              </div>
            </div>
            {/* Bottom spacer for mobile */}
            <div className="md:hidden" style={{ minHeight: '10vh' }}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;