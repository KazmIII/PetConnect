import HeroSection from './HeroSection';
import FeatureSection from './FeatureSection';
import Workflow from './Workflow';
import Pricing from './Pricing';
import Testimonials from './Testimonials';
import HomeSearchComponent from './HomeSearchComponent';
import ServiceCards from './ServiceCards';

export default function Home() {

  return (
    <div>
      {/* Main Content */}
      <div className="flex flex-col items-center px-4 mx-auto w-full lg:max-w-6xl custom-lg:max-w-4xl max-w-xs custom-xs:max-w-md sm:max-w-xl md:max-w-2xl">
        <HomeSearchComponent />

        <div className="w-full">
          <ServiceCards />
        </div>
      </div>

      {/* <FeatureSection />
      <Workflow />
      <Pricing />
      <Testimonials /> */}
    </div>
  );
}
