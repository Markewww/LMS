import useMediaQuery from "@/hooks/useMediaQuery";
import { SelectedPage } from "@/shared/types";
import { motion } from "framer-motion";
import AnchorLink from "react-anchor-link-smooth-scroll";

type Props = {
  setSelectedPage: (value: SelectedPage) => void;
};

const Home = ({ setSelectedPage }: Props) => {
  const isAboveMediumScreens = useMediaQuery("(min-width: 1060px)");

  return (
    <section id="home" className="gap-16 py-10 md:h-full md:pb-0 bg-white">
      {/* IMAGE AND MAIN HEADER */}
      <motion.div 
        className="mx-auto w-5/6 items-center justify-center md:flex md:h-5/6"
        onViewportEnter={() => setSelectedPage(SelectedPage.Home)}
      >
        {/* MAIN HEADER */}
        <div className="z-10 mt-32 md:basis-3/5">
          {/* HEADINGS */}
          <motion.div 
            className="md:-mt-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
            variants={{
              hidden: { opacity: 0, x: -50 },
              visible: { opacity: 1, x: 0 },
            }}
          >
            <div className="relative">
              <div className="before:absolute before:-top-20 before:-left-20 before:z-[-1] md:before:content-['']">
                <h1 className='text-5xl md:text-7xl font-montserrat font-black text-cvsu-green-base uppercase tracking-tight'>
                   CEIT READING ROOM
                </h1>
              </div>
            </div>

            <p className="mt-8 text-sm md:text-lg text-cvsu-gray font-medium italic">
              Your gateway to knowledge and innovation.
            </p>
          </motion.div>

          {/* ACTIONS */}
          <motion.div 
            className="mt-8 flex items-center gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            variants={{
              hidden: { opacity: 0, x: -50 },
              visible: { opacity: 1, x: 0 },
            }}
          >
            <button className="bg-cvsu-green-base text-white font-montserrat font-bold px-10 py-2 rounded-lg border-2 border-cvsu-green-base transition-all duration-300 hover:bg-white hover:text-cvsu-green-base">
                SCAN TO ENTER
            </button>
            <AnchorLink
              className="text-sm font-bold text-cvsu-green-base underline hover:text-cvsu-green-dark"
              onClick={() => setSelectedPage(SelectedPage.About)}
              href="#contactus"
            >
              <p>Learn More</p>
            </AnchorLink>
          </motion.div>
        </div>

        {/* GRAPHIC - Only show on desktop if you have an image */}
        {isAboveMediumScreens && (
          <div className="flex basis-3/5 justify-center md:z-10 md:ml-40 md:mt-16 md:justify-items-end">
            {/* You can put a library illustration or QR mockup image here later */}
            <div className="w-100 h-100 bg-cvsu-green-100 rounded-full flex items-center justify-center">
                <span className="text-cvsu-green-base font-black text-6xl">LMS</span>
            </div>
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default Home;
