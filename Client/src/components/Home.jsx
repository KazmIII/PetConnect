import HomeSearchComponent from './HomeSearchComponent';
import ServiceCards from './ServiceCards';
import AdoptionOrRehome from './AdoptionOrRehome';
import EmotionFeatureCard from './EmotionFeatureCard';
import HomeBlogs from './HomeBlogs'; // Add this import
import EmotionFeatureCard from './EmotionFeatureCard';

export default function Home() {
  return (
    <div>
      {/* Main Content */}
      <div className="flex flex-col items-center px-4 mx-auto w-full lg:max-w-6xl custom-lg:max-w-4xl max-w-xs custom-xs:max-w-md sm:max-w-xl md:max-w-2xl">
        <HomeSearchComponent />
        <div className="w-full">
          <ServiceCards />
        </div>
        <AdoptionOrRehome />
        <EmotionFeatureCard />
        <EmotionFeatureCard />
        <HomeBlogs /> {/* Add this line */}
      </div>
    </div>
  );
}