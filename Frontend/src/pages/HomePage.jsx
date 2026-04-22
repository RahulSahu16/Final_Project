import HomePageSearchBar from "../components/Homepage/HomePageSearchBar";
import HomePageFeaturedHomes from "../components/Homepage/HomePageFeaturedHomes";
import HomePageFooter from "../components/Homepage/HomePageFooter";
import HomePageHeroSection from "../components/Homepage/HomepageHeroSection";
import HomePagePopularDestination from "../components/Homepage/HomePagePopularDestination";
import AiDiscoveryStudio from "../components/Homepage/AiDiscoveryStudio";

function Homepage() {
  return (
    <div className="bg-[#f3f1eb] text-black min-h-screen">
      <HomePageHeroSection />
      <HomePageSearchBar />
      <AiDiscoveryStudio />
      <HomePagePopularDestination />
      <HomePageFeaturedHomes />
      <HomePageFooter />
    </div>
  );
}

export default Homepage;
