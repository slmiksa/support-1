
import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "next-themes";

export function Toaster() {
  const { theme = "system" } = useTheme();

  return (
    <SonnerToaster
      theme={theme as any}
      position="top-left"
      richColors
      expand
      closeButton
      duration={10000}
      className="toaster group"
      toastOptions={{
        className: "rtl",
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-company group-[.toast]:text-white hover:group-[.toast]:bg-company-dark",
          closeButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
    />
  );
}
