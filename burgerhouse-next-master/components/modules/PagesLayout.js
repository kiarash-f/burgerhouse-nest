import Footer from "../templates/Footer";
import Navbar from "./Navbar";

function PagesLayout({ children }) {
  return (
    <div className="container max-w-screen 2xl:max-w-screen-2xl 2xl:mx-auto text-white-smoke/80 overflow-x-hidden font-soraya">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}

export default PagesLayout;
