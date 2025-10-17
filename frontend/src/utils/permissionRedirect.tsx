import { useLocalProfileData } from "@/zustand/useProfile";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { permissionMap } from "./permissionMap";

const PermissionRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useLocalProfileData();

  React.useEffect(() => {
    if (profile && profile.role?.role_name) {
      // Create a mapping of URL paths to permissionMap keys
      const pathToPermissionMapKey: Record<string, string> = {
        "customer-character": "นิสัยลูกค้า",

      };
      // Find the corresponding permissionMap key by matching the pathname
      const matchedPath = Object.keys(pathToPermissionMapKey).find((path) =>
        location.pathname.includes(path)
      );

      if (matchedPath) {
        const pathName = pathToPermissionMapKey[matchedPath];

        const matchedPermission = Object.entries(permissionMap).find(([key]) =>
          pathName.includes(key)
        );

        if (matchedPermission) {
          const [, permissions] = matchedPermission;
          // Check if the user has permission for this object
          const userPermission = permissions[profile.role?.role_name];

          if (userPermission === "N") {
            // Redirect to /home if the user has no permission ('N')
            navigate("/");
          }
        }
      }
    }
  }, [location, profile, navigate]);

  return null; // This component doesn't render anything, it's just used for logic
};

export default PermissionRedirect;
