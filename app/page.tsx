import Button from "@/layouts/components/Button";
import HeroBanner from "@/layouts/partials/HeroBanner";

export default function Home() {
  const bannerData = {
    title: "Next.js with Prisma Architecture",
    content: "A modern web application built with Next.js 15, TypeScript, Prisma ORM, and Tailwind CSS. Featuring responsive design and professional architecture.",
    image: "/images/banner.png",
    spinning_text: "• NEXT.JS ARCHITECTURE • MODERN TECH STACK",
    button: {
      enable: true,
      label: "Get Started",
      link: "/contact"
    }
  };

  return (
    <>
      <HeroBanner banner={bannerData} />

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <div className="row justify-center">
            <div className="col-lg-10 text-center">
              <h2 className="section-title mb-4">
                Built with Modern Technologies
              </h2>
              <p className="text-lg text-text mb-12">
                This application showcases the power of modern web development tools and frameworks.
              </p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <div className="feature-card p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="feature-icon mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary text-2xl font-bold">N</span>
                  </div>
                </div>
                <h3 className="h5 mb-3">Next.js 15</h3>
                <p className="text-text">
                  Latest version of Next.js with App Router, Server Components, and enhanced performance.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="feature-card p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="feature-icon mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary text-2xl font-bold">P</span>
                  </div>
                </div>
                <h3 className="h5 mb-3">Prisma ORM</h3>
                <p className="text-text">
                  Type-safe database access with Prisma Client and modern database management.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="feature-card p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="feature-icon mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary text-2xl font-bold">T</span>
                  </div>
                </div>
                <h3 className="h5 mb-3">Tailwind CSS</h3>
                <p className="text-text">
                  Utility-first CSS framework for rapid UI development and responsive design.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-light">
        <div className="container">
          <div className="row justify-center text-center">
            <div className="col-lg-8">
              <h2 className="section-title mb-4">Ready to Get Started?</h2>
              <p className="text-lg text-text mb-8">
                Explore the features and capabilities of this modern Next.js application.
              </p>
              <Button 
                link="/contact" 
                label="Contact Us"
                style="btn-primary"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}