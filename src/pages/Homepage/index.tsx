import { useEffect, useState } from 'react';
import { SelectedPage } from '@/shared/types';

// Components
import Navbar from '@/pages/Homepage/scenes/navbar';
import Home from '@/pages/Homepage/scenes/home';
import About from '@/pages/Homepage/scenes/about';
import ContactUs from '@/pages/Homepage/scenes/contactUs';
import Footer from '@/pages/Homepage/scenes/footer';


const Homepage = () => {
    const [selectedPage, setSelectedPage] = useState<SelectedPage>(SelectedPage.Home);
    const [isTopOfPage, setIsTopOfPage] = useState<boolean>(true);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY === 0) {
                setIsTopOfPage(true);
                setSelectedPage(SelectedPage.Home);
            } 
            if (window.scrollY !== 0) setIsTopOfPage(false);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className='app bg-white font-dm'>
            <Navbar 
                isTopOfPage={isTopOfPage} 
                selectedPage={selectedPage} 
                setSelectedPage={setSelectedPage} 
            />

            <Home setSelectedPage={setSelectedPage} />
            <About setSelectedPage={setSelectedPage} />
            <ContactUs setSelectedPage={setSelectedPage} />
            <Footer />
        </div>
    );
}

export default Homepage;