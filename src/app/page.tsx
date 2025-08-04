"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  Code, 
  Web, 
  Cloud, 
  School, 
  Group, 
  EmojiEvents, 
  TrendingUp,
  Mail,
  Phone,
  LocationOn,
  ArrowForward,
  CheckCircle
} from "@mui/icons-material";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoVisible, setIsLogoVisible] = useState(false);
  const [isAcademyLogoVisible, setIsAcademyLogoVisible] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Trigger logo animation after a short delay
    const timer = setTimeout(() => {
      setIsLogoVisible(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Trigger academy logo animation when academy section comes into view
    const handleAcademyLogoAnimation = () => {
      const academySection = document.getElementById('academy');
      if (academySection) {
        const rect = academySection.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.8;
        
        if (isVisible && !isAcademyLogoVisible) {
          setIsAcademyLogoVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleAcademyLogoAnimation);
    // Also check on initial load
    handleAcademyLogoAnimation();
    
    return () => window.removeEventListener('scroll', handleAcademyLogoAnimation);
  }, [isAcademyLogoVisible]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
        console.error('Form submission error:', result.error);
      }
      
      // Reset status message after 3 seconds
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      
      // Reset error message after 3 seconds
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const services = [
    {
      icon: <Web className="w-8 h-8" />,
      title: "Web Development",
      description: "Modern, responsive web applications built with React, Next.js, and cutting-edge technologies."
    },
    {
      icon: <Cloud className="w-8 h-8" />,
      title: "Cloud Services",
      description: "Scalable cloud infrastructure and deployment solutions for your applications."
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Custom Solutions",
      description: "Tailored software solutions designed to meet your specific business requirements."
    }
  ];

  const features = [
    "Interactive & Cost-Effective Solutions",
    "Modern Tech Stack (React, Next.js)",
    "Flexible Technology Adoption",
    "Competitive Pricing",
    "24/7 Support",
    "Quick Turnaround Time"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full py-5 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Image
                src="/concord-logo-landscape.png"
                alt="Concord Tech Solutions"
                width={200}
                height={60}
                className="h-20 w-auto"
                priority
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection("home")} className="text-foreground hover:text-primary transition-colors">
                Home
              </button>
              <button onClick={() => scrollToSection("services")} className="text-foreground hover:text-primary transition-colors">
                Services
              </button>
              <button onClick={() => scrollToSection("academy")} className="text-foreground hover:text-primary transition-colors">
                Academy
              </button>
              <button onClick={() => scrollToSection("contact")} className="text-foreground hover:text-primary transition-colors">
                Contact
              </button>
              <Button className="bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] px-10">
                  <div className="flex flex-col space-y-4 mt-8">
                    <button onClick={() => scrollToSection("home")} className="text-center text-lg font-small hover:text-primary transition-colors">
                      Home
                    </button>
                    <button onClick={() => scrollToSection("services")} className="text-center text-lg font-small hover:text-primary transition-colors">
                      Services
                    </button>
                    <button onClick={() => scrollToSection("academy")} className="text-center text-lg font-small hover:text-primary transition-colors">
                      Academy
                    </button>
                    <button onClick={() => scrollToSection("contact")} className="text-center text-lg font-small hover:text-primary transition-colors">
                      Contact
                    </button>
                    <Button className="bg-primary hover:bg-primary/90 mt-4">
                      Get Started
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        {/* Background image with 60% opacity */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/background-image.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.2,
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-6">
              Innovative
              <span className="text-primary block">Tech Solutions</span>
            </h1>
            <div className="flex justify-center mb-8">
              <Image
                src="/concord-logo-icon.png"
                alt="Concord Tech Solutions"
                width={500}
                height={150}
                className={`h-60 w-auto transition-all duration-1000 ease-out transform ${
                  isLogoVisible 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-8 scale-95'
                }`}
                priority
              />
            </div>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              We provide interactive, cost-effective web-based solutions using modern technologies like React and Next.js. 
              Our flexible approach ensures we can adapt to any technology stack your project requires.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-6"
                onClick={() => scrollToSection("services")}
              >
                Explore Our Services
                <ArrowForward className="ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6"
                onClick={() => scrollToSection("services")}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Our Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We specialize in web-based solutions with a focus on modern technologies and cost-effective development.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-background/50 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="text-white">
                      {service.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-semibold">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Why Choose Concord?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                We stand out from the competition with our commitment to quality, innovation, and cost-effectiveness.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="text-primary w-5 h-5" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-80 rounded-2xl flex items-center justify-center overflow-hidden">
                {/* Background image with high transparency */}
                <Image
                  src="/background-image.webp"
                  alt=""
                  fill
                  className="object-cover opacity-80 pointer-events-none select-none"
                  style={{ zIndex: 0 }}
                  priority={false}
                />
                {/* Overlay gradient for extra softness */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl" style={{ zIndex: 1 }} />
                <div className="relative z-10 text-center">
                  <TrendingUp className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-foreground mb-2">Growing Success</h3>
                  <p className="text-white">Trusted by businesses worldwide</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Academy Section */}
      <section id="academy" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <Image
                src="/concord-academy-logo.png"
                alt="Concord Academy"
                width={350}
                height={120}
                className={`h-60 w-auto transition-all duration-1000 ease-out transform ${
                  isAcademyLogoVisible 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-8 scale-95'
                }`}
                priority
              />
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Empowering the next generation of developers with hands-on training and real-world experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-background/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <School className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Structured Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Comprehensive curriculum covering modern web development technologies and best practices.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-background/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                                     <Group className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Expert Mentorship</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Learn from industry professionals with years of experience in web development.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-background/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                                     <EmojiEvents className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Certification</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Earn recognized certifications upon completion of our comprehensive programs.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Get In Touch
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ready to start your next project? Let&apos;s discuss how we can help bring your vision to life.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Email</p>
                    <a 
                      href="mailto:isurikalakshani2001@gmail.com" 
                      className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                      isurikalakshani2001@gmail.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Phone</p>
                    <p className="text-muted-foreground">(+94) 78 510 9735</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <LocationOn className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Address</p>
                    <p className="text-muted-foreground">Biyagama, Western Province Sri Lanka</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">Send us a message</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                />
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Message"
                  rows={4}
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background resize-none"
                ></textarea>
                
                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <div className="p-4 bg-green-100 border border-green-300 rounded-lg text-green-700">
                    ✅ Thank you! Your message has been sent successfully.
                  </div>
                )}
                
                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
                    ❌ Something went wrong. Please try again.
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    'Send Message'
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Image
                  src="/footer-logo-2.png"
                  alt="Concord Tech Solutions"
                  width={270}
                  height={100}
                />
              </div>
              <p className="text-sm text-primary-foreground/80">
                Innovative web-based solutions for modern businesses.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                <li>Web Development</li>
                <li>Cloud Services</li>
                <li>Custom Solutions</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Academy</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                <li>Structured Learning</li>
                <li>Expert Mentorship</li>
                <li>Certification</li>
                <li>Career Support</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                <li>(+94) 78 510 9735</li>
                <li>(+94) 71 221 5008</li>
                <li>
                  <a 
                    href="mailto:isurikalakshani2001@gmail.com" 
                    className="hover:text-primary-foreground transition-colors cursor-pointer"
                  >
                    isurikalakshani2001@gmail.com
                  </a>
                </li>
                <li>Biyagama, Western Province Sri Lanka</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
            <p className="text-sm text-primary-foreground/60">
              © 2024 Concord Tech Solutions. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
