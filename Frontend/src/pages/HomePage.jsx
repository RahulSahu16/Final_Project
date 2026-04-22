import HomePageSearchBar from "../components/Homepage/HomePageSearchBar";
import HomePageFeaturedHomes from "../components/Homepage/HomePageFeaturedHomes";
import HomePageFooter from "../components/Homepage/HomePageFooter";
import HomePageHeroSection from "../components/Homepage/HomepageHeroSection";
import HomePagePopularDestination from "../components/Homepage/HomePagePopularDestination";
import CozyStayAIWidget from "../components/Homepage/CozyStayAIWidget";

function Homepage() {
  return (
    <div className="bg-[#f3f1eb] text-black min-h-screen">
      <HomePageHeroSection />
      <HomePageSearchBar />
      <HomePagePopularDestination />
      <HomePageFeaturedHomes />
      <HomePageFooter />
      <CozyStayAIWidget />
    </div>
  );
}

export default Homepage;
