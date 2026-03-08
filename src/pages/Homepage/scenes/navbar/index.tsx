import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { SelectedPage } from "@/shared/types";
import useMediaQuery from "@/hooks/useMediaQuery";
import { useNavigate } from "react-router-dom";

type Props = {
  isTopOfPage: boolean;
  selectedPage: SelectedPage;
  setSelectedPage: (value: SelectedPage) => void;
};

const Navbar = ({ isTopOfPage, selectedPage, setSelectedPage }: Props) => {
  const [isMenuToggled, setIsMenuToggled] = useState<boolean>(false);
  const isAboveMediumScreens = useMediaQuery("(min-width: 1060px)");
  const navigate = useNavigate();
  
  const flexBetween = "flex items-center justify-between";
  const navBackground = isTopOfPage ? "bg-transparent" : "bg-white shadow-sm";
  const navLinkStyles = "text-cvsu-green-base font-montserrat font-bold hover:opacity-70 transition-opacity cursor-pointer";

  return (
    <nav>
      <div className={`${navBackground} ${flexBetween} fixed top-0 z-40 w-full py-4 transition duration-300`}>
        <div className={`${flexBetween} mx-auto w-5/6`}>
          <div className={`${flexBetween} w-full gap-16`}>
            
            {/* BRAND/LOGO SPACE */}
            <div className="font-montserrat font-black text-cvsu-green-base text-xl uppercase tracking-tighter">
                CEIT LMS
            </div>

            {/* DESKTOP NAV */}
            {isAboveMediumScreens ? (
              <div className={`${flexBetween} w-full`}>
                <div className={`${flexBetween} gap-8 text-sm`}>
                  <a href="#home" onClick={() => setSelectedPage(SelectedPage.Home)} 
                     className={`${navLinkStyles} ${selectedPage === SelectedPage.Home ? "underline decoration-2 underline-offset-4" : ""}`}>
                    Home
                  </a>
                  <a href="#about" onClick={() => setSelectedPage(SelectedPage.About)} 
                     className={`${navLinkStyles} ${selectedPage === SelectedPage.About ? "underline decoration-2 underline-offset-4" : ""}`}>
                    About
                  </a>
                  <a href="#contactus" onClick={() => setSelectedPage(SelectedPage.ContactUs)} 
                     className={`${navLinkStyles} ${selectedPage === SelectedPage.ContactUs ? "underline decoration-2 underline-offset-4" : ""}`}>
                    Contact Us
                  </a>
                </div>
                <button 
                  onClick={() => navigate("/login")}
                  className='bg-cvsu-green-base text-white font-montserrat font-bold px-6 py-2 rounded-lg border-2 border-cvsu-green-base transition-all duration-300 hover:bg-white hover:text-cvsu-green-base uppercase'
                >
                  LOGIN
                </button>
              </div>
            ) : (
              /* MOBILE MENU TRIGGER */
              <button
                className="rounded-full bg-cvsu-green-base p-2"
                onClick={() => setIsMenuToggled(!isMenuToggled)}
              >
                <Bars3Icon className="h-6 w-6 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE MENU MODAL */}
      {!isAboveMediumScreens && isMenuToggled && (
        <div className="fixed right-0 bottom-0 z-50 h-full w-1/2 bg-white drop-shadow-xl border-l border-cvsu-green-100">
          {/* CLOSE ICON */}
          <div className="flex justify-end p-12">
            <button onClick={() => setIsMenuToggled(!isMenuToggled)}>
              <XMarkIcon className="h-8 w-8 text-cvsu-green-base" />
            </button>
          </div>

          {/* MENU ITEMS */}
          <div className="ml-[20%] flex flex-col gap-10 text-2xl">
            <a href="#home" onClick={() => { setSelectedPage(SelectedPage.Home); setIsMenuToggled(false); }} className={navLinkStyles}>Home</a>
            <a href="#about" onClick={() => { setSelectedPage(SelectedPage.About); setIsMenuToggled(false); }} className={navLinkStyles}>About</a>
            <a href="#contactus" onClick={() => { setSelectedPage(SelectedPage.ContactUs); setIsMenuToggled(false); }} className={navLinkStyles}>Contact Us</a>
            <button 
                onClick={() => navigate("/login")}
                className="bg-cvsu-green-base text-white font-montserrat font-bold py-3 rounded-lg mr-10 uppercase text-lg"
            >
                Login
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
