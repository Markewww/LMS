const Footer = () => {
  return (
    <footer className="bg-cvsu-green-50 py-16">
      <div className="justify-content mx-auto w-5/6 gap-16 md:flex">
        {/* LEFT COLUMN: BRANDING */}
        <div className="mt-16 basis-1/2 md:mt-0">
          <h2 className="font-montserrat font-black text-2xl text-cvsu-green-base uppercase tracking-tighter">
            CEIT Reading Room
          </h2>
          <p className="my-5 text-sm text-cvsu-gray font-medium">
            The official digital library management system for the College of 
            Engineering and Information Technology. Dedicated to providing 
            seamless access to knowledge through innovation.
          </p>
          <p className="text-xs text-cvsu-gray">
            © {new Date().getFullYear()} Cavite State University. All Rights Reserved.
          </p>
        </div>

        {/* MIDDLE COLUMN: LINKS */}
        <div className="mt-16 basis-1/4 md:mt-0">
          <h4 className="font-bold font-montserrat text-cvsu-green-dark uppercase">Links</h4>
          <p className="my-5 text-sm text-cvsu-gray cursor-pointer hover:text-cvsu-green-base transition">Library Policy</p>
          <p className="my-5 text-sm text-cvsu-gray cursor-pointer hover:text-cvsu-green-base transition">Borrowing Rules</p>
          <p className="text-sm text-cvsu-gray cursor-pointer hover:text-cvsu-green-base transition">Admin Portal</p>
        </div>

        {/* RIGHT COLUMN: CONTACT */}
        <div className="mt-16 basis-1/4 md:mt-0">
          <h4 className="font-bold font-montserrat text-cvsu-green-dark uppercase">Contact Us</h4>
          <p className="my-5 text-sm text-cvsu-gray">Indang, Cavite, Philippines</p>
          <p className="text-sm text-cvsu-gray">(046) 415-0010</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
