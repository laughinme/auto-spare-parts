import { useCallback, useEffect, useState } from "react";

const BUYER_ONLY_ROUTES = new Set(["fyp", "cart", "garage"]);

export function useRouteController(initialRoute = "fyp") {
  const [route, setRoute] = useState(initialRoute);
  const [previousRoute, setPreviousRoute] = useState(initialRoute);

  const setRouteSafe = useCallback(
    (nextRoute) => {
      setPreviousRoute((prev) => route === nextRoute ? prev : route);
      setRoute((current) => current === nextRoute ? current : nextRoute);
    },
    [route]
  );

  const navigateTo = useCallback(
    (nextRoute) => {
      setRouteSafe(nextRoute);
    },
    [setRouteSafe]
  );

  const navigateBack = useCallback(() => {
    if (route === previousRoute) return;
    setRouteSafe(previousRoute);
  }, [previousRoute, route, setRouteSafe]);

  useEffect(() => {
    window.__setRoute = setRouteSafe;
    return () => {
      if (window.__setRoute === setRouteSafe) {
        window.__setRoute = undefined;
      }
    };
  }, [setRouteSafe]);

  const applyRoleGuards = useCallback(
    (role) => {
      if (role !== "supplier") return;
      if (route === "chat") {
        setRouteSafe("supplier:chat");
        return;
      }
      if (BUYER_ONLY_ROUTES.has(route)) {
        setRouteSafe("supplier:dashboard");
      }
    },
    [route, setRouteSafe]
  );

  return {
    route,
    previousRoute,
    setRoute: setRouteSafe,
    navigateTo,
    navigateBack,
    applyRoleGuards
  };
}