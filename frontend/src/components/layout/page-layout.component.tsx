import React from "react";
import { Helmet } from "react-helmet";
import Navbar from "./navbar.component";

interface PageLayoutProps {
  children?: React.ReactNode;
  header?: React.ReactNode;
  subheader?: React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="mb-6">
    <h1 className="text-3xl font-bold tracking-tight text-foreground">
      {children}
    </h1>
  </div>
);

export const PageSubHeader: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className="mb-6 text-lg text-muted-foreground">{children}</div>;

export const PageActions: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className="flex items-center mb-8 space-x-4">{children}</div>;

export const PageContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <main className="flex-1 w-full">{children}</main>;

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  header,
  subheader,
  actions,
}) => {
  const pageTitle = header?.toString() || "ICICI Breeze";

  return (
    <>
      <Helmet>
        <title>{pageTitle} - ICICI Breeze</title>
      </Helmet>
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <div className="flex-1 w-full">
          <div className="px-4 py-6 mx-auto sm:px-6 lg:px-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                {header}
                {subheader}
              </div>
              {actions && <div className="flex-shrink-0 ml-4">{actions}</div>}
            </div>
            <div className="p-6 border rounded-lg shadow-sm bg-card text-card-foreground">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PageLayout;
