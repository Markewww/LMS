import { SelectedPage } from "@/shared/types";
import { motion } from "framer-motion";
import { 
  QrCodeIcon, 
  BookOpenIcon, 
  ClockIcon,
  FolderOpenIcon,
  UsersIcon,
  ArrowTrendingUpIcon
} from "@heroicons/react/24/outline";

type Props = {
  setSelectedPage: (value: SelectedPage) => void;
};

const About = ({ setSelectedPage }: Props) => {
  return (
    <section id="about" className="mx-auto min-h-full w-5/6 py-20">
      <motion.div
        onViewportEnter={() => setSelectedPage(SelectedPage.About)}
      >
        {/* HEADER */}
        <motion.div
          className="md:my-5 md:w-3/5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          variants={{
            hidden: { opacity: 0, x: -50 },
            visible: { opacity: 1, x: 0 },
          }}
        >
          <h2 className="font-montserrat text-3xl font-bold text-cvsu-green-base uppercase">
            Why CEIT Reading Room?
          </h2>
          <p className="my-5 text-sm font-medium text-cvsu-gray">
            We provide a modern, digital approach to library management. Our QR-integrated 
            system ensures that borrowing books and tracking your study hours is 
            seamless, efficient, and paperless.
          </p>
        </motion.div>

        {/* FEATURES / BENEFITS SECTION */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Feature 1: Fast Entry */}
          <div className="ceit-card border-l-4 border-cvsu-green-base flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cvsu-green-100">
              <QrCodeIcon className="h-8 w-8 text-cvsu-green-base" />
            </div>
            <h4 className="font-bold font-montserrat text-cvsu-green-dark">Instant Entry</h4>
            <p className="my-3 text-xs text-cvsu-gray">
              Quick and easy attendance tracking with QR code scanning.
            </p>
          </div>

          {/* Feature 2: Quick Borrowing */}
          <div className="ceit-card border-l-4 border-cvsu-green-base flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cvsu-green-100">
              <BookOpenIcon className="h-8 w-8 text-cvsu-green-base" />
            </div>
            <h4 className="font-bold font-montserrat text-cvsu-green-dark">Smart Borrowing</h4>
            <p className="my-3 text-xs text-cvsu-gray">
              Scan any book's QR code to borrow it. No manual forms, no long queues at the counter.
            </p>
          </div>

          {/* Feature 3: Real-time Tracking */}
          <div className="ceit-card border-l-4 border-cvsu-green-base flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cvsu-green-100">
              <ClockIcon className="h-8 w-8 text-cvsu-green-base" />
            </div>
            <h4 className="font-bold font-montserrat text-cvsu-green-dark">Time Tracking</h4>
            <p className="my-3 text-xs text-cvsu-gray">
              Keep track of your reading logs and return dates directly through your student dashboard.
            </p>
          </div>

          {/* Feature 4: Research Repository */}
          <div className="ceit-card border-l-4 border-cvsu-green-base flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cvsu-green-100">
              <FolderOpenIcon className="h-8 w-8 text-cvsu-green-base" />
            </div>
            <h4 className="font-bold font-montserrat text-cvsu-green-dark">Research Repository</h4>
            <p className="my-3 text-xs text-cvsu-gray">
              Submit and manage your thesis, capstone, or design projects.
            </p>
          </div>

          {/* Feature 5: Users Management */}
          <div className="ceit-card border-l-4 border-cvsu-green-base flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cvsu-green-100">
              <UsersIcon className="h-8 w-8 text-cvsu-green-base" />
            </div>
            <h4 className="font-bold font-montserrat text-cvsu-green-dark">Users Management</h4>
            <p className="my-3 text-xs text-cvsu-gray">
              Comprehensive user and role management system.
            </p>
          </div>

          {/* Feature 6: Performance Tracking */}
          <div className="ceit-card border-l-4 border-cvsu-green-base flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cvsu-green-100">
              <ArrowTrendingUpIcon className="h-8 w-8 text-cvsu-green-base" />
            </div>
            <h4 className="font-bold font-montserrat text-cvsu-green-dark">Performance Tracking</h4>
            <p className="my-3 text-xs text-cvsu-gray">
              Monitor trends and generate insightful reports on library usage and book popularity.
            </p>
          </div>
          
        </div>
      </motion.div>
    </section>
  );
};

export default About;
