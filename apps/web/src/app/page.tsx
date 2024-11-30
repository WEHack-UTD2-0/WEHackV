import Navbar from "@/components/shared/Navbar";
import Jumbotron from "./sections/Jumbotron/Jumbotron";
import About from "./sections/About/About";
import Sponsor from "./sections/Sponsor/Sponsor";
import MLHBadge from "@/components/landing/MLHBadge";
import Footer from "./sections/Footer/Footer";
import FAQ from "./sections/FAQ/FAQ";
import Testimonials from "@/app/sections/Testimonials/Testimonials";
import Countdown from "./sections/Countdown/Countdown";
import FilmStrip from "@/components/FilmStrip/FilmStrip";
import Stats from "@/components/Stats/Stats";
import Team from "./sections/Team/Team";

export default function Home() {
  return (
    // this is where all our components will go
    <div className="App transform-gpu">
      <Navbar />
	    <MLHBadge />
      <Jumbotron/>
      <Countdown/>
      <About/>
      <FilmStrip/>
      <Stats/>
      <Testimonials/>
      <Sponsor/>
      <FAQ/>
      <Team/>
      <Footer/>
    </div>
  );
}

export const runtime = "edge";
export const revalidate = 30;
