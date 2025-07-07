export interface Button {
  enable: boolean;
  label: string;
  link: string;
}

export interface Counter {
  count: string;
  count_suffix: string;
  count_prefix: string;
  count_duration: number;
}

export interface Metric {
  name: string;
  description: string;
  counter?: Counter;
}

export interface FunFactMetric extends Metric {
  counter: Counter;
}

export interface BlogPost extends Page {
  frontmatter: Page["frontmatter"] & {
    categories: string[];
    featured?: boolean;
    date: string;
  };
}

export interface Page {
  frontmatter: {
    title: string;
    meta_title?: string;
    description?: string;
    image?: string;
    canonical?: string;
    noindex?: boolean;
    draft?: boolean;
  };
  slug?: string;
  content?: string;
}

export interface TeamMember {
  name: string;
  designation: string;
  avatar?: string;
}

export interface BlogSection {
  enable: boolean;
  title?: string;
  subtitle: string;
  description?: string;
  show_blog_count: number;
}

export interface TeamSection {
  enable: boolean;
  title?: string;
  subtitle: string;
  members: TeamMember[];
}

export interface AboutPage extends Page {
  frontmatter: Page["frontmatter"] & {
    images_gallery: string[];
    blog_section: BlogSection;
    team_section: TeamSection;
  };
}

export interface Testimonial {
  name: string;
  designation: string;
  content: string;
  avatar?: string;
  featured?: boolean;
}

export interface ReviewPage extends Page {
  frontmatter: Page["frontmatter"] & {
    subtitle: string;
    testimonials: Testimonial[];
  };
}

export interface Faqs extends Page {
  frontmatter: Page["frontmatter"] & {
    badge: Badge;
    button: Button;
    list: { question: string; answer: string }[];
  };
}

export interface ContactPage extends Page {
  frontmatter: Page["frontmatter"] & {
    address_section: { title: string; description: string };
  };
}

export interface Banner {
  title: string;
  content: string;
  image: string;
  spinning_text?: string;
  button: Button;
}

export interface Gallery {
  enable: boolean;
  title: string;
  subtitle: string;
  description: string;
  images: string[];
}

export interface FunFacts {
  enable: boolean;
  title: string;
  description: string;
  metrics: FunFactMetric[];
}

export interface Services {
  enable: boolean;
  title: string;
  subtitle: string;
  button: Button;
}

export interface ServicesFacts {
  enable: boolean;
  title: string;
  subtitle: string;
  metrics: ServicesFactMetric[];
}

export interface Projects {
  enable: boolean;
  title: string;
  subtitle: string;
  button: Button;
}

export interface Homepage {
  frontmatter: {
    banner: Banner;
    gallery: Gallery;
    fun_facts: FunFacts;
    services: Services;
    services_facts: ServicesFacts;
    projects: Projects;
  };
  slug?: string;
  content?: string;
}

export interface ServiceFeature {
  name?: string;
  description?: string;
}

export interface ServicePage extends Page {
  frontmatter: Page["frontmatter"] & {
    featured_in_homepage?: boolean;
    features?: ServiceFeature[];
  };
}

export interface AvailableJob {
  name: string;
  location: string;
  link: string;
}

export interface AvailableJobs {
  title: string;
  description: string;
  jobs?: AvailableJob[];
}

export interface CareerPage extends Page {
  frontmatter: Page["frontmatter"] & {
    available_jobs: AvailableJobs;
  };
}

export interface GalleryImage {
  design: string;
  designer: string;
  image: string;
}

export interface GalleryPage extends Page {
  frontmatter: Page["frontmatter"] & {
    gallery_images: GalleryImage[];
  };
}

export interface Badge {
  enable: boolean;
  label: string;
  icon?: string;
  bg_color: string;
}

export interface Project extends BlogPost {
  frontmatter: BlogPost["frontmatter"] & {
    client_name?: string;
    project_type?: string;
    featured_in_homepage?: boolean;
  };
}

export interface CTASection {
  enable: boolean;
  title: string;
  description: string;
  image: string;
  button_solid: Button;
  button_outline: Button;
}

export interface ServicesFactMetric extends Metric {
  counter: Counter;
}