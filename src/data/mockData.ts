export interface FlightRoute {
  id: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  price: number;
  currency: string;
  tripType: string;
  cabinClass: string;
  badge?: "Best Deal" | "Trending" | "Luxury" | "Adventure" | "Business" | "Popular";
  image?: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  tag: "Romantic" | "Culture" | "Luxury" | "Tropical" | "Urban" | "Adventure";
  image: string;
  priceFrom?: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
}

export interface WhyUsFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Stat {
  id: string;
  value: string;
  label: string;
}

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  bio: string;
  image: string;
}

export interface TrustSafetyItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const popularRoutes: FlightRoute[] = [
  {
    id: "route-001",
    from: "New York",
    fromCode: "JFK",
    to: "London",
    toCode: "LHR",
    price: 429,
    currency: "USD",
    tripType: "Round trip",
    cabinClass: "Economy",
    badge: "Best Deal",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop",
  },
  {
    id: "route-002",
    from: "Los Angeles",
    fromCode: "LAX",
    to: "Tokyo",
    toCode: "NRT",
    price: 749,
    currency: "USD",
    tripType: "Round trip",
    cabinClass: "Economy",
    badge: "Trending",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop",
  },
  {
    id: "route-003",
    from: "Miami",
    fromCode: "MIA",
    to: "Dubai",
    toCode: "DXB",
    price: 599,
    currency: "USD",
    tripType: "Round trip",
    cabinClass: "Economy",
    badge: "Popular",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop",
  },
  {
    id: "route-004",
    from: "San Francisco",
    fromCode: "SFO",
    to: "Paris",
    toCode: "CDG",
    price: 649,
    currency: "USD",
    tripType: "Round trip",
    cabinClass: "Economy",
    badge: "Trending",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop",
  },
  {
    id: "route-005",
    from: "London",
    fromCode: "LHR",
    to: "Dubai",
    toCode: "DXB",
    price: 479,
    currency: "USD",
    tripType: "Round trip",
    cabinClass: "Business",
    badge: "Business",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop",
  },
  {
    id: "route-006",
    from: "Chicago",
    fromCode: "ORD",
    to: "Sydney",
    toCode: "SYD",
    price: 1099,
    currency: "USD",
    tripType: "Round trip",
    cabinClass: "Economy",
    badge: "Adventure",
    image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=600&fit=crop",
  },
];

export const destinations: Destination[] = [
  {
    id: "dest-001",
    name: "Paris",
    country: "France",
    tag: "Romantic",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop",
    priceFrom: 589,
  },
  {
    id: "dest-002",
    name: "Tokyo",
    country: "Japan",
    tag: "Culture",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop",
    priceFrom: 899,
  },
  {
    id: "dest-003",
    name: "Dubai",
    country: "UAE",
    tag: "Luxury",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop",
    priceFrom: 479,
  },
  {
    id: "dest-004",
    name: "Bali",
    country: "Indonesia",
    tag: "Tropical",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop",
    priceFrom: 649,
  },
  {
    id: "dest-005",
    name: "New York",
    country: "USA",
    tag: "Urban",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop",
    priceFrom: 219,
  },
  {
    id: "dest-006",
    name: "Cape Town",
    country: "South Africa",
    tag: "Adventure",
    image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&h=600&fit=crop",
    priceFrom: 799,
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "t-001",
    name: "Sarah Mitchell",
    role: "Frequent Traveler",
    content: "Tiqwa made booking my family vacation effortless. Best prices and zero hidden fees — exactly as promised.",
    rating: 5,
  },
  {
    id: "t-002",
    name: "James Chen",
    role: "Business Executive",
    content: "I book all my work trips through Tiqwa. Fast, reliable, and the 24/7 support team saved me twice last year.",
    rating: 5,
  },
  {
    id: "t-003",
    name: "Amara Okafor",
    role: "Travel Blogger",
    content: "The search experience is incredibly smooth. I found a round-trip to Tokyo for $200 less than other sites.",
    rating: 5,
  },
  {
    id: "t-004",
    name: "Lucas Bergström",
    role: "Digital Nomad",
    content: "Free cancellation gave me peace of mind when plans changed. Tiqwa is now my go-to for every flight.",
    rating: 4,
  },
];

export const whyUsFeatures: WhyUsFeature[] = [
  {
    id: "f-001",
    title: "Best Price Guarantee",
    description: "We compare hundreds of airlines to find you the lowest fares with no hidden charges.",
    icon: "BadgeDollarSign",
  },
  {
    id: "f-002",
    title: "Free Cancellation",
    description: "Change your mind? Cancel eligible bookings free of charge up to 24 hours before departure.",
    icon: "ShieldCheck",
  },
  {
    id: "f-003",
    title: "Instant E-Tickets",
    description: "Receive your boarding pass instantly after booking — no waiting, no paperwork.",
    icon: "Zap",
  },
  {
    id: "f-004",
    title: "24/7 Support",
    description: "Our travel experts are available around the clock to help with any booking or travel issue.",
    icon: "Headphones",
  },
  {
    id: "f-005",
    title: "500+ Airlines",
    description: "Access flights from over 500 airlines worldwide, from budget carriers to premium operators.",
    icon: "Plane",
  },
  {
    id: "f-006",
    title: "Secure Payments",
    description: "Your payment data is encrypted and protected with bank-level security standards.",
    icon: "Lock",
  },
];

export const stats: Stat[] = [
  { id: "s-001", value: "2M+", label: "Happy Travelers" },
  { id: "s-002", value: "500+", label: "Airlines" },
  { id: "s-003", value: "180+", label: "Countries" },
  { id: "s-004", value: "4.9★", label: "Average Rating" },
];

export const trustBadges = [
  "Free cancellation",
  "No hidden fees",
  "Instant e-ticket",
  "24/7 support",
];

export const aboutStats: Stat[] = [
  { id: "as-001", value: "2M+", label: "Customers" },
  { id: "as-002", value: "500+", label: "Airlines" },
  { id: "as-003", value: "100+", label: "Countries" },
  { id: "as-004", value: "4.9★", label: "Rating" },
];

export const teamMembers: TeamMember[] = [
  {
    id: "tm-001",
    name: "Alex Thompson",
    title: "CEO & Co-founder",
    bio: "Former airline executive with 15+ years of experience in global aviation.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "tm-002",
    name: "Priya Sharma",
    title: "CTO",
    bio: "Led engineering teams at two travel tech unicorns before co-founding Tiqwa.",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "tm-003",
    name: "Marcus Williams",
    title: "Head of Operations",
    bio: "Expert in airline partnerships and fare optimization across 180+ countries.",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
  },
  {
    id: "tm-004",
    name: "Elena Rodriguez",
    title: "VP of Customer Experience",
    bio: "Passionate about making travel accessible with world-class 24/7 support.",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    id: "tm-005",
    name: "David Okonkwo",
    title: "Chief Financial Officer",
    bio: "Ensures transparent pricing and secure payments for every Tiqwa booking.",
    image: "https://randomuser.me/api/portraits/men/52.jpg",
  },
  {
    id: "tm-006",
    name: "Sophie Laurent",
    title: "Head of Marketing",
    bio: "Built Tiqwa's brand reaching 2M+ travelers through trust-first campaigns.",
    image: "https://randomuser.me/api/portraits/women/26.jpg",
  },
];

export const trustSafetyItems: TrustSafetyItem[] = [
  {
    id: "ts-001",
    title: "Secure Payments",
    description: "PCI-DSS Level 1 certified payment processing",
    icon: "Lock",
  },
  {
    id: "ts-002",
    title: "Best Price Guarantee",
    description: "Find a lower fare within 24 hours — we'll match it",
    icon: "BadgeDollarSign",
  },
  {
    id: "ts-003",
    title: "24/7 Support",
    description: "Real humans available around the clock, every day",
    icon: "Headphones",
  },
  {
    id: "ts-004",
    title: "Verified Reviews",
    description: "All reviews from confirmed Tiqwa bookings only",
    icon: "ShieldCheck",
  },
];

export const aboutTestimonials: Testimonial[] = [
  {
    id: "at-001",
    name: "Sarah Mitchell",
    role: "Frequent Traveler",
    content: "Tiqwa changed how our family travels. Transparent pricing and incredible support every single time.",
    rating: 5,
  },
  {
    id: "at-002",
    name: "James Chen",
    role: "Business Executive",
    content: "As a corporate travel manager, Tiqwa's reliability and price guarantee are unmatched in the industry.",
    rating: 5,
  },
  {
    id: "at-003",
    name: "Partner — SkyBridge Airlines",
    role: "Airline Partner",
    content: "Tiqwa delivers quality bookings with low cancellation rates. A trusted distribution partner.",
    rating: 5,
  },
];
