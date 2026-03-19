import { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import api from "../api/api";
import DEFAULT_PACKAGE, {
  getDefaultCoupons,
  getSelectedPackageId,
  getSelectedPackageSnapshot,
  saveSelectedPackageId as persistSelectedPackageId,
  saveSelectedPackageSnapshot,
} from "../utils/testPackageStore";
import { AuthContext } from "./AuthContext";

const PackageContext = createContext({
  packages: [],
  coupons: [],
  mailLists: [],
  activePackage: DEFAULT_PACKAGE,
  selectedPackageId: null,
  setSelectedPackageId: () => {},
  loading: true,
  refresh: () => Promise.resolve(),
});

export const PackageProvider = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  const [packages, setPackages] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [mailLists, setMailLists] = useState([]);
  const [selectedPackageId, setSelectedPackageIdState] = useState(() => getSelectedPackageId());
  const [selectedPackageSnapshot, setSelectedPackageSnapshot] = useState(() => getSelectedPackageSnapshot());
  const [loading, setLoading] = useState(true);

  const setSelectedPackageId = useCallback((id, pkg = null) => {
    if (!id) return;
    const nextId = String(id);
    persistSelectedPackageId(nextId);
    setSelectedPackageIdState(nextId);
    if (pkg && typeof pkg === "object") {
      saveSelectedPackageSnapshot(pkg);
      setSelectedPackageSnapshot(getSelectedPackageSnapshot());
    }
  }, []);

  useEffect(() => {
    const syncSelectedPackage = () => {
      setSelectedPackageIdState(getSelectedPackageId());
      setSelectedPackageSnapshot(getSelectedPackageSnapshot());
    };

    window.addEventListener("storage", syncSelectedPackage);
    return () => window.removeEventListener("storage", syncSelectedPackage);
  }, []);

  const fetchData = useCallback(async () => {
    if (!token || user?.role !== "admin") {
      try {
        const pkgRes = await api.get("/v1/packages/public");
        setPackages(pkgRes?.data?.data?.packages || []);
      } catch (err) {
        console.error("Public package load failed", err);
        setPackages([]);
      }
      setCoupons(getDefaultCoupons());
      setMailLists([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [pkgRes, couponRes, mailRes] = await Promise.all([
        api.get("/v1/admin/packages"),
        api.get("/v1/admin/coupons"),
        api.get("/v1/admin/mail-lists"),
      ]);
      setPackages(pkgRes?.data?.data?.packages || []);
      setCoupons(couponRes?.data?.data?.coupons || getDefaultCoupons());
      setMailLists(mailRes?.data?.data?.lists || []);
    } catch (err) {
      console.error("Package context load failed", err);
      setCoupons(getDefaultCoupons());
    } finally {
      setLoading(false);
    }
  }, [token, user?.role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activePackage = useMemo(() => {
    if (!packages.length) {
      if (selectedPackageSnapshot?.id || selectedPackageSnapshot?._id) {
        const hasSections = Array.isArray(selectedPackageSnapshot.sections) && selectedPackageSnapshot.sections.length > 0;
        return {
          ...DEFAULT_PACKAGE,
          ...selectedPackageSnapshot,
          sections: hasSections ? selectedPackageSnapshot.sections : DEFAULT_PACKAGE.sections,
        };
      }
      return DEFAULT_PACKAGE;
    }

    const active =
      packages.find((p) => String(p._id || p.id) === String(selectedPackageId)) ||
      packages.find((p) => String(p._id || p.id) === String(selectedPackageSnapshot?._id || selectedPackageSnapshot?.id || "")) ||
      packages.find((p) => p.isActive) ||
      packages[0];
    const hasSections = Array.isArray(active.sections) && active.sections.length > 0;
    const mergedSections = hasSections ? active.sections : DEFAULT_PACKAGE.sections;
    return { ...DEFAULT_PACKAGE, ...active, sections: mergedSections };
  }, [packages, selectedPackageId, selectedPackageSnapshot]);

  return (
    <PackageContext.Provider
      value={{
        packages,
        coupons,
        mailLists,
        activePackage,
        selectedPackageId,
        setSelectedPackageId,
        loading,
        refresh: fetchData,
      }}
    >
      {children}
    </PackageContext.Provider>
  );
};

export const usePackageData = () => useContext(PackageContext);
