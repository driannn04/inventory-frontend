import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "../pages/dashboard/Dashboard";
import Barang from "../pages/barang/Barang";
import StokMasuk from "../pages/stok/StokMasuk";
import StokKeluar from "../pages/stok/StokKeluar";
import StockOpname from "../pages/stok/StockOpname";
import BuatPengajuan from "../pages/pengajuan/BuatPengajuan";
import ListPengajuan from "../pages/pengajuan/ListPengajuan";
import DetailPengajuan from "../pages/pengajuan/DetailPengajuan";
import ApprovalPengajuan from "../pages/pengajuan/ApprovalPengajuan";
import ScanQR from "../pages/barang/ScanQR";
import KartuStok from "../pages/barang/KartuStok";
import ActivityLog from "../pages/admin/ActivityLog";
import Settings from "../pages/admin/Settings";
import Supplier from "../pages/supplier/Supplier";
import Login from "../pages/auth/Login";
import ProtectedRoute from "../components/ProtectedRoute";

// ✅ NEW PAGES
import UserManagement from "../pages/user/UserManagement";
import KategoriBarang from "../pages/kategori/KategoriBarang";
import Laporan from "../pages/laporan/Laporan";
import ProfilUser from "../pages/profil/ProfilUser";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <ProtectedRoute roles={["admin","staff","asesmen","manager","gudang"]}>
            <Dashboard />
          </ProtectedRoute>
        }/>

        <Route path="/barang" element={
          <ProtectedRoute roles={["admin","gudang"]}>
            <Barang />
          </ProtectedRoute>
        }/>

        <Route path="/barang/:id/kartu-stok" element={
          <ProtectedRoute roles={["admin","gudang"]}>
            <KartuStok />
          </ProtectedRoute>
        }/>

        <Route path="/stok-masuk" element={
          <ProtectedRoute roles={["admin","gudang"]}>
            <StokMasuk />
          </ProtectedRoute>
        }/>

        <Route path="/stok-keluar" element={
          <ProtectedRoute roles={["admin","gudang"]}>
            <StokKeluar />
          </ProtectedRoute>
        }/>

        <Route path="/stok-opname" element={
          <ProtectedRoute roles={["admin","gudang"]}>
            <StockOpname />
          </ProtectedRoute>
        }/>

        <Route path="/buat-pengajuan" element={
          <ProtectedRoute roles={["staff","admin"]}>
            <BuatPengajuan />
          </ProtectedRoute>
        }/>

        <Route path="/list-pengajuan" element={
          <ProtectedRoute roles={["staff","admin","asesmen","manager","gudang"]}>
            <ListPengajuan />
          </ProtectedRoute>
        }/>

        <Route path="/pengajuan/:id" element={
          <ProtectedRoute roles={["admin","asesmen","manager","gudang"]}>
            <DetailPengajuan />
          </ProtectedRoute>
        }/>

        <Route path="/approval" element={
          <ProtectedRoute roles={["admin","asesmen","manager","gudang"]}>
            <ApprovalPengajuan />
          </ProtectedRoute>
        }/>

        <Route path="/scan" element={<ScanQR />} />

        <Route path="/activity-log" element={
          <ProtectedRoute roles={["admin"]}>
            <ActivityLog />
          </ProtectedRoute>
        }/>

        <Route path="/supplier" element={
          <ProtectedRoute roles={["admin"]}>
            <Supplier />
          </ProtectedRoute>
        }/>

        {/* ✅ NEW ROUTES */}
        <Route path="/kelola-user" element={
          <ProtectedRoute roles={["admin"]}>
            <UserManagement />
          </ProtectedRoute>
        }/>

        <Route path="/settings" element={
          <ProtectedRoute roles={["admin"]}>
            <Settings />
          </ProtectedRoute>
        }/>

        <Route path="/kategori" element={
          <ProtectedRoute roles={["admin"]}>
            <KategoriBarang />
          </ProtectedRoute>
        }/>

        <Route path="/laporan" element={
          <ProtectedRoute roles={["admin","gudang"]}>
            <Laporan />
          </ProtectedRoute>
        }/>

        <Route path="/profil" element={
          <ProtectedRoute roles={["admin","staff","asesmen","manager","gudang"]}>
            <ProfilUser />
          </ProtectedRoute>
        }/>

        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}