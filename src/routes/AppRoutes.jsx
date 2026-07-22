import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "../pages/dashboard/Dashboard";
import Barang from "../pages/barang/Barang";
import StokMasuk from "../pages/stok/StokMasuk";
import StokKeluar from "../pages/stok/StokKeluar";

import BuatPengajuan from "../pages/pengajuan/BuatPengajuan";
import ListPengajuan from "../pages/pengajuan/ListPengajuan";
import DetailPengajuan from "../pages/pengajuan/DetailPengajuan";
import ApprovalPengajuan from "../pages/pengajuan/ApprovalPengajuan";
import MyPengajuan from "../pages/pengajuan/MyPengajuan";
import ScanQR from "../pages/barang/ScanQR";
import KartuStok from "../pages/barang/KartuStok";
import ActivityLog from "../pages/admin/ActivityLog";


import Login from "../pages/auth/Login";
import ProtectedRoute from "../components/ProtectedRoute";

// âœ… NEW PAGES
import UserManagement from "../pages/user/UserManagement";
import KategoriBarang from "../pages/kategori/KategoriBarang";
import Laporan from "../pages/laporan/Laporan";
import ProfilUser from "../pages/profil/ProfilUser";
import PusatBantuan from "../pages/bantuan/PusatBantuan";
import ListNotifikasi from "../pages/notifikasi/ListNotifikasi";
import Settings from "../pages/admin/Settings";
import MenuPermissions from "../pages/admin/MenuPermissions";
import NotFound from "../pages/error/NotFound";
import AccessDenied from "../pages/error/AccessDenied";
import Maintenance from "../pages/error/Maintenance";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <ProtectedRoute roles={["admin","staff","asisten_manager","manager","gudang"]}>
            <Dashboard />
          </ProtectedRoute>
        }/>

        <Route path="/barang" element={
          <ProtectedRoute roles={["admin","gudang","staff","asisten_manager","manager"]}>
            <Barang />
          </ProtectedRoute>
        }/>

        <Route path="/barang/:id/kartu-stok" element={
          <ProtectedRoute roles={["admin","gudang","staff","asisten_manager","manager"]}>
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



        <Route path="/buat-pengajuan" element={
          <ProtectedRoute roles={["staff","admin","asisten_manager","manager"]}>
            <BuatPengajuan />
          </ProtectedRoute>
        }/>

        <Route path="/semua-pengajuan" element={
          <ProtectedRoute roles={["staff","admin","asisten_manager","manager","gudang"]}>
            <ListPengajuan />
          </ProtectedRoute>
        }/>
        <Route path="/list-pengajuan" element={<Navigate to="/semua-pengajuan" replace />} />

        <Route path="/pengajuan-saya" element={
          <ProtectedRoute roles={["staff","admin","asisten_manager","manager"]}>
            <MyPengajuan />
          </ProtectedRoute>
        }/>

        <Route path="/pengajuan/:id" element={
          <ProtectedRoute roles={["admin","asisten_manager","manager","gudang","staff"]}>
            <DetailPengajuan />
          </ProtectedRoute>
        }/>

        <Route path="/persetujuan-pengajuan" element={
          <ProtectedRoute roles={["admin","asisten_manager","manager","gudang"]}>
            <ApprovalPengajuan />
          </ProtectedRoute>
        }/>
        <Route path="/approval" element={<Navigate to="/persetujuan-pengajuan" replace />} />

        <Route path="/scan" element={
          <ProtectedRoute roles={["admin","gudang"]}>
            <ScanQR />
          </ProtectedRoute>
        }/>

        <Route path="/activity-log" element={
          <ProtectedRoute roles={["admin"]}>
            <ActivityLog />
          </ProtectedRoute>
        }/>



        {/* âœ… NEW ROUTES */}
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

        <Route path="/kelola-akses" element={
          <ProtectedRoute roles={["admin"]}>
            <MenuPermissions />
          </ProtectedRoute>
        }/>
        <Route path="/kategori" element={
          <ProtectedRoute roles={["admin","gudang"]}>
            <KategoriBarang />
          </ProtectedRoute>
        }/>

        <Route path="/laporan" element={
          <ProtectedRoute roles={["admin","gudang","manager","asisten_manager"]}>
            <Laporan />
          </ProtectedRoute>
        }/>

        <Route path="/profil" element={
          <ProtectedRoute roles={["admin","staff","asisten_manager","manager","gudang"]}>
            <ProfilUser />
          </ProtectedRoute>
        }/>

        <Route path="/bantuan" element={
          <ProtectedRoute roles={["admin","staff","asisten_manager","manager","gudang"]}>
            <PusatBantuan />
          </ProtectedRoute>
        }/>

        <Route path="/notifikasi" element={
          <ProtectedRoute roles={["admin","staff","asisten_manager","manager","gudang"]}>
            <ListNotifikasi />
          </ProtectedRoute>
        }/>

        <Route path="/forbidden" element={<AccessDenied />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

