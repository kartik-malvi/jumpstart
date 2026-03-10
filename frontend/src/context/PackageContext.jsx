import { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import api from "../api/api";
import DEFAULT_PACKAGE, { getDefaultCoupons } from "../utils/testPackageStore";
import { AuthContext } from "./AuthContext";

const PackageContext = createContext({
  packages: [],
  coupons: [],
  mailLists: [],
  activePackage: DEFAULT_PACKAGE,
  loading: true,
  refresh: () => Promise.resolve(),
});

export const PackageProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [packages, setPackages] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [mailLists, setMailLists] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!token) {
      setPackages([]);
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
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activePackage = useMemo(() => {
    if (!packages.length) return DEFAULT_PACKAGE;
    const active = packages.find((p) => p.isActive) || packages[0];
    const hasSections = Array.isArray(active.sections) && active.sections.length > 0;
    const mergedSections = hasSections ? active.sections : DEFAULT_PACKAGE.sections;
    return { ...DEFAULT_PACKAGE, ...active, sections: mergedSections };
  }, [packages]);

  return (
    <PackageContext.Provider value={{ packages, coupons, mailLists, activePackage, loading, refresh: fetchData }}>
      {children}
    </PackageContext.Provider>
  );
};

export const usePackageData = () => useContext(PackageContext);
