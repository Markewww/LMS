import { EyeIcon, ShieldCheckIcon } from "lucide-react";

type Props = {
  admins: any[];
  setSelectedAdmin: (admin: any) => void;
};

const AdminTable = ({ admins, setSelectedAdmin }: Props) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex items-center gap-2">
        <ShieldCheckIcon className="text-cvsu-green-base" size={24} />
        <h3 className="font-montserrat font-black text-cvsu-green-dark uppercase">
          Administrators
        </h3>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-cvsu-green-50 text-cvsu-green-dark text-[10px] uppercase font-bold tracking-wider">
            <th className="p-4">Employee ID</th>
            <th className="p-4">Full Name</th>
            <th className="p-4">Email</th>
            <th className="p-4">Contact Number</th>
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 text-sm">
          {admins.map((admin: any) => (
            <tr key={admin.user_id} className="hover:bg-gray-50 transition-colors">
              <td className="p-4 font-bold text-gray-700">{admin.user_id}</td>
              <td className="p-4 text-gray-600">
                {`${admin.last_name}, ${admin.first_name} ${admin.middle_name || ""} ${admin.suffix || ""}`}
              </td>
              <td className="p-4 text-gray-600">{admin.email}</td>
              <td className="p-4 text-gray-600">{admin.contact_number || "N/A"}</td>
              <td className="p-4 text-center">
                <button
                  onClick={() => setSelectedAdmin(admin)}
                  className="text-cvsu-green-base hover:text-cvsu-green-dark transition flex items-center justify-center w-full"
                >
                  <EyeIcon size={18} />
                </button>
              </td>
            </tr>
          ))}
          {admins.length === 0 && (
            <tr>
              <td colSpan={5} className="p-10 text-center text-cvsu-gray italic">
                No administrator records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;
