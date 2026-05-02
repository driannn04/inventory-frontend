import MainLayout from "../../components/layout/MainLayout";
import { getRole } from "../../utils/auth";

// Import Role Dashboards
import AdminDashboard from "./roles/AdminDashboard";
import StaffDashboard from "./roles/StaffDashboard";
import GudangDashboard from "./roles/GudangDashboard";
import ApprovalDashboard from "./roles/ApprovalDashboard";
import AsistenManagerDashboard from "./roles/AsistenManagerDashboard";
import ManagerDashboard from "./roles/ManagerDashboard";

export default function Dashboard() {
   const role = getRole();

   const renderDashboard = () => {
      switch (role) {
         case "admin":
            return <AdminDashboard />;
         case "staff":
            return <StaffDashboard />;
         case "gudang":
            return <GudangDashboard />;
         case "asisten_manager":
            return <AsistenManagerDashboard />;
         case "manager":
            return <ManagerDashboard />;
         default:
            return <div className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest">Akses Dashboard Tidak Dikenal</div>;
      }
   };

   return (
      <MainLayout>
         {renderDashboard()}
      </MainLayout>
   );
}