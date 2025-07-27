import HeroBanner from "@/layouts/partials/HeroBanner";
import CloudinaryImage from "../components/CloudinaryImage";

export default function Home() {
  const bannerData = {
    title: "Glamour and Grace On Call",
    content: "Transforming your vision into reality. Get your next look now.",
    image: "/images/banner2.jpeg",
    spinning_text: "",
    button: {
      enable: true,
      label: "Discover Your Perfect Look",
      link: "/questionnaire"
    }
  };

  // Mock data for sections to match original template
  const galleryData = {
    enable: true,
    title: "Professional Makeup Guidance - On Call, On Point",
    subtitle: "ABOUT us",
    description: "Goldie Grace is your on-demand beauty concierge, connecting you with hand-picked professional makeup artists for live, one-on-one video consultations. Whether you're getting ready for a big presentation, a special occasion, or just want to feel your most confident self every day, our experts guide you step-by-step—right from your own vanity and using the products you already own.",
    // Cloudinary public IDs for gallery images
    images: [
      "goldiegrace/static/gallery/1",
      "goldiegrace/static/gallery/2",
      "goldiegrace/static/gallery/3",
      "goldiegrace/static/gallery/4"
    ]
  };

  const funFactsData = {
    enable: true,
    title: "Since our founding, Kindora has made an extensive impact",
    description: "",
    metrics: [
      {
        name: "Interior Projects",
        description: "Designs we have finished in last 32 years.",
        counter: { count: "8", count_suffix: "K", count_prefix: "", count_duration: 3 }
      },
      {
        name: "Years of Works",
        description: "Designs we have finished in last 32 years.",
        counter: { count: "31", count_suffix: "", count_prefix: "", count_duration: 0.5 }
      },
      {
        name: "Satisfied Clients",
        description: "Designs we have finished in last 32 years.",
        counter: { count: "12", count_suffix: "K", count_prefix: "", count_duration: 3.5 }
      },
      {
        name: "Happy Rate",
        description: "Designs we have finished in last 32 years.",
        counter: { count: "97", count_suffix: "%", count_prefix: "", count_duration: 4 }
      }
    ]
  };

  return (
    <>
      <HeroBanner banner={bannerData} />
      
      {/* Gallery Section - Simple version */}
      <section className="section">
        <div className="container">
          <div className="row justify-center">
            <div className="col-lg-8 text-center">
              <span className="text-primary text-sm font-medium uppercase tracking-wider">
                {galleryData.subtitle}
              </span>
              <h2 className="section-title mt-2 mb-4">
                {galleryData.title}
              </h2>
              <p className="text-lg text-text mb-12">
                {galleryData.description}
              </p>
            </div>
          </div>
          <div className="row g-4">
            {galleryData.images.slice(0, 4).map((publicId, index) => (
              <div key={index} className="col-lg-3 col-md-6">
                <div className="overflow-hidden rounded-lg relative h-64">
                  <CloudinaryImage
                    publicId={publicId}
                    alt={`Gallery ${index + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    transformation={{
                      quality: 'auto',
                      format: 'auto',
                      crop: 'fill',
                    }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fun Facts Section */}
      <section className="section bg-light">
        <div className="container">
          <div className="row justify-center">
            <div className="col-lg-8 text-center">
              <h2 className="section-title mb-12">
                {funFactsData.title}
              </h2>
            </div>
          </div>
          <div className="row g-4">
            {funFactsData.metrics.map((metric, index) => (
              <div key={index} className="col-lg-3 col-md-6 text-center">
                <div className="fun-fact-card">
                  <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">
                    {metric.counter.count_prefix}
                    {metric.counter.count}
                    {metric.counter.count_suffix}
                  </div>
                  <h4 className="text-xl font-semibold mb-2">{metric.name}</h4>
                  <p className="text-text">{metric.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section">
        <div className="container">
          <div className="row justify-center">
            <div className="col-lg-8 text-center">
              <span className="text-primary text-sm font-medium uppercase tracking-wider">
                SERVICES
              </span>
              <h2 className="section-title mt-2 mb-4">
                Get your dream home with expert help.
              </h2>
              <p className="text-lg text-text mb-12">
                We provide comprehensive interior design and architectural services.
              </p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <div className="service-card p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="service-icon mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary text-2xl">🏠</span>
                  </div>
                </div>
                <h3 className="h5 mb-3">Interior Design</h3>
                <p className="text-text">
                  Transform your space with our expert interior design services.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="service-card p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="service-icon mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary text-2xl">🏗️</span>
                  </div>
                </div>
                <h3 className="h5 mb-3">Architecture</h3>
                <p className="text-text">
                  Innovative architectural solutions for modern living.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="service-card p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="service-icon mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary text-2xl">💡</span>
                  </div>
                </div>
                <h3 className="h5 mb-3">Consultation</h3>
                <p className="text-text">
                  Expert consultation to bring your vision to life.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}