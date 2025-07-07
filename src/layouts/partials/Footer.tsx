import ArrowBtn from "@/layouts/components/ArrowBtn";
import Button from "@/layouts/components/Button";
import config from "@/config/config.json";
import menu from "@/config/menu.json";
import social from "@/config/social.json";
import ImageFallback from "@/layouts/helpers/ImageFallback";
import Link from "next/link";

export default function Footer() {
  const { footer_title, address, phone, email, footer_content } = config.params;
  return (
    <footer className="section pb-0 bg-primary">
      <div className="container">
        <div className="row max-md:justify-center gx-4">
          <div className="md:col-6 lg:col-5 max-md:text-center">
            <h2
              data-aos="fade-up-sm"
              data-aos-delay="150"
              className="font-medium text-white mb-8"
            >
              {footer_title}
            </h2>
            <div data-aos="fade-up-sm" data-aos-delay="200">
              <Button
                enable={config.footer_button.enable}
                label={config.footer_button.label}
                link={config.footer_button.link}
                style="btn-secondary"
              />
            </div>
          </div>
          <div className="md:col-6 lg:col-7 ml-auto max-md:mt-14">
            <div className="mb-10 lg:mb-8">
              <div className="row max-lg:gy-4 justify-center max-md:text-center lg:justify-end">
                {menu.footer.map((menu, i) => (
                  <div
                    data-aos="fade-up-sm"
                    data-aos-delay={i * 100 + 200}
                    className="col-10 md:col-6 lg:col-3 pr-0"
                    key={i}
                  >
                    <h5 className="mb-7 font-normal text-base lg:mb-6 text-text-light/50">
                      {menu.title}
                    </h5>
                    <ul>
                      {menu.children.map((child) => (
                        <li
                          className="mb-4 text-text-light text-base hover:text-secondary text-lg!"
                          key={child.url}
                        >
                          <Link href={child.url}>{child.name}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="row section">
          <div className="md:col-10">
            <div className="row g-5 max-md:justify-center">
              <div
                data-aos="fade-up-sm"
                data-aos-delay="300"
                className="col-10 md:col-6"
              >
                <ImageFallback
                  src={config.site.logo_footer}
                  width={215}
                  height={52}
                  alt="footer logo"
                  className="mb-3 max-md:mx-auto"
                  loading="lazy"
                />
                <p className="text-text-light/50 text-balance max-md:text-center">
                  {footer_content}
                </p>
              </div>
              <div
                data-aos="fade-up-sm"
                data-aos-delay="350"
                className="col-10 md:col-6 lg:col-3 max-md:text-center"
              >
                <ul>
                  <li className="mb-4 text-text-light text-base hover:text-secondary text-lg!">
                    <Link href={`tel:${phone}`}>{phone}</Link>
                  </li>
                  <li className="mb-4 text-text-light text-base hover:text-secondary text-lg!">
                    <Link href={`mailto:${email}`}>{email}</Link>
                  </li>
                  <li className="mb-4 text-text-light text-base hover:text-secondary text-lg!">
                    <Link
                      target="_blank"
                      href={`https://www.google.com/maps?q=${encodeURIComponent(
                        address
                      )}`}
                    >
                      {address}
                    </Link>
                  </li>
                </ul>
              </div>
              <div
                data-aos="fade-up-sm"
                data-aos-delay="450"
                className="col-10 md:col-6 lg:col-3 max-md:text-center"
              >
                <ul className="flex flex-col gap-3 max-md:items-center max-md:[&>li]:ml-6">
                  {social.main.map((item, index) => (
                    <li key={index}>
                      <ArrowBtn label={item.name} link={item.link} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}