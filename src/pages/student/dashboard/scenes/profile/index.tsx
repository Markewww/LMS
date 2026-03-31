import { User, Mail, GraduationCap, IdCard } from "lucide-react";

const StudentProfile = ({ studentData }: { studentData: any }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-6 p-8 bg-cvsu-bg rounded-3xl border border-cvsu-green-base/10">
        <div className="w-24 h-24 bg-cvsu-green-base rounded-2xl flex items-center justify-center text-white text-4xl font-black">
          {studentData?.first_name?.charAt(0) || "S"}
        </div>
        <div>
          <h2 className="text-2xl font-black text-cvsu-green-base uppercase tracking-tight">
            {studentData?.first_name} {studentData?.last_name}
          </h2>
          <p className="text-cvsu-gray font-medium italic">{studentData?.type} Account</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProfileInfo icon={<IdCard />} label="Student ID" value={studentData?.id} />
        <ProfileInfo icon={<GraduationCap />} label="Course / Program" value={studentData?.course || "N/A"} />
        <ProfileInfo icon={<Mail />} label="Email Address" value={studentData?.email || "N/A"} />
        <ProfileInfo icon={<User />} label="Account Status" value="Active" color="text-green-600" />
      </div>
    </div>
  );
};

const ProfileInfo = ({ icon, label, value, color = "text-gray-900" }: any) => (
  <div className="p-5 bg-white border border-gray-100 rounded-2xl flex items-center gap-4 shadow-sm">
    <div className="text-cvsu-green-base">{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-cvsu-gray uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className={`font-bold ${color}`}>{value}</p>
    </div>
  </div>
);

export default StudentProfile;
