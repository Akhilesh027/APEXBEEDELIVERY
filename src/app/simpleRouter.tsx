import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface RouterContextType {
  pathname: string;
  navigate: (to: string, options?: { replace?: boolean }) => void;
  params: Record<string, string>;
  outlet: ReactNode;
}

const RouterContext = createContext<RouterContextType>({
  pathname: typeof window !== 'undefined' ? window.location.pathname : '/',
  navigate: () => {},
  params: {},
  outlet: null
});

export const BrowserRouter: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pathname, setPathname] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string, options?: { replace?: boolean }) => {
    if (typeof window !== 'undefined') {
      if (options?.replace) {
        window.history.replaceState({}, '', to);
      } else {
        window.history.pushState({}, '', to);
      }
    }
    setPathname(to);
  };

  return (
    <RouterContext.Provider value={{ pathname, navigate, params: {}, outlet: null }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useLocation = () => ({ pathname: useContext(RouterContext).pathname });
export const useNavigate = () => useContext(RouterContext).navigate;
export const useParams = () => useContext(RouterContext).params;
export const Outlet: React.FC = () => <>{useContext(RouterContext).outlet}</>;

export interface RouteProps {
  path?: string;
  index?: boolean;
  element: ReactNode;
  children?: ReactNode;
}

interface RoutesProps {
  children: ReactNode;
}

export const Routes: React.FC<RoutesProps> = ({ children }) => {
  const { pathname, navigate } = useContext(RouterContext);

  let matchedLayout: ReactNode = null;
  let matchedChild: ReactNode = null;
  let matchedParams: Record<string, string> = {};

  const currentPath = pathname.replace(/\/$/, '') || '/';

  // Helper function to match paths
  const matchPath = (pattern: string, target: string) => {
    if (pattern === '*') return true;
    if (pattern === target) return true;

    const paramNames: string[] = [];
    const regexPath = pattern
      .replace(/\/$/, '')
      .replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
        paramNames.push(name);
        return '([^/]+)';
      });

    const regex = new RegExp(`^${regexPath}$`);
    const match = target.match(regex);

    if (match) {
      const extractedParams: Record<string, string> = {};
      paramNames.forEach((name, idx) => {
        extractedParams[name] = match[idx + 1];
      });
      matchedParams = extractedParams;
      return true;
    }
    return false;
  };

  React.Children.forEach(children, (parentRoute) => {
    if (matchedChild || !React.isValidElement(parentRoute)) return;

    const { path: parentPath, element: parentElement, children: childRoutes } = parentRoute.props as RouteProps;

    if (childRoutes) {
      React.Children.forEach(childRoutes, (childRoute) => {
        if (matchedChild || !React.isValidElement(childRoute)) return;

        const { path: childPath, index: isIndex, element: childElement } = childRoute.props as RouteProps;

        if (isIndex && (currentPath === '/app' || currentPath === '/app/')) {
          matchedLayout = parentElement;
          matchedChild = childElement;
          return;
        }

        if (childPath) {
          const fullPath = parentPath
            ? `${parentPath.replace(/\/$/, '')}/${childPath.replace(/^\//, '')}`
            : childPath;

          if (matchPath(fullPath, currentPath)) {
            matchedLayout = parentElement;
            matchedChild = childElement;
          }
        }
      });
    } else if (parentPath) {
      if (matchPath(parentPath, currentPath)) {
        matchedLayout = parentElement;
      }
    }
  });

  // Fallback to top-level route if no layout match
  if (!matchedLayout && !matchedChild) {
    React.Children.forEach(children, (child) => {
      if (matchedLayout || !React.isValidElement(child)) return;
      const { path, element } = child.props as RouteProps;
      if (path && matchPath(path, currentPath)) {
        matchedLayout = element;
      }
    });
  }

  // Handle default redirect if at root '/'
  useEffect(() => {
    if (currentPath === '/') {
      navigate('/app/home', { replace: true });
    }
  }, [currentPath, navigate]);

  const finalElement = matchedChild ? (
    <RouterContext.Provider value={{ pathname, navigate, params: matchedParams, outlet: matchedChild }}>
      {matchedLayout}
    </RouterContext.Provider>
  ) : (
    <RouterContext.Provider value={{ pathname, navigate, params: matchedParams, outlet: null }}>
      {matchedLayout}
    </RouterContext.Provider>
  );

  return finalElement;
};

export const Route: React.FC<RouteProps> = () => null;

export const Navigate: React.FC<{ to: string; replace?: boolean }> = ({ to, replace = true }) => {
  const { navigate } = useContext(RouterContext);

  useEffect(() => {
    navigate(to, { replace });
  }, [navigate, to, replace]);

  return null;
};

export interface LinkProps {
  to: string;
  children: ReactNode;
  className?: string | ((props: { isActive: boolean }) => string);
}

export const Link: React.FC<LinkProps> = ({ to, children, className }) => {
  const { pathname, navigate } = useContext(RouterContext);
  const isActive = pathname === to;
  const computedClassName = typeof className === 'function' ? className({ isActive }) : className;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick} className={computedClassName}>
      {children}
    </a>
  );
};

export interface NavLinkProps extends LinkProps {
  className?: string | ((props: { isActive: boolean }) => string);
}

export const NavLink: React.FC<NavLinkProps> = ({ to, children, className }) => {
  const { pathname, navigate } = useContext(RouterContext);
  const isActive = pathname === to || (to !== '/' && pathname.startsWith(to));

  const computedClassName =
    typeof className === 'function' ? className({ isActive }) : className;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick} className={computedClassName}>
      {children}
    </a>
  );
};
