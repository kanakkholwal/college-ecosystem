import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { appConfig, orgConfig } from "~/project.config";



export function AppLogo({
  className,
  showLogo = false,
}: {
  className?: string;
  showLogo?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 justify-center items-center mx-auto ",
        className
      )}
    >
      {showLogo ? (
        <Avatar className="h-8 w-8 rounded-lg">
          <AvatarImage src="/logo-square.webp" alt={appConfig.name} />
          <AvatarFallback className="flex items-center justify-center rounded-lg text-3xl font-bold text-center relative bg-gradient-to-r from-primary to-sky-500 bg-clip-text text-transparent hover:from-sky-500 hover:to-primary whitespace-nowrap">
            {orgConfig.shortName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : (
        <h1 className="text-2xl md:text-7xl font-bold text-center relative bg-gradient-to-r from-primary to-sky-500 bg-clip-text text-transparent hover:from-sky-500 hover:to-primary whitespace-nowrap">
          {orgConfig.shortName}
        </h1>
      )}
      <h2 className="text-md md:text-xl font-semibold capitalize text-muted-foreground text-center">
        {appConfig.name}
      </h2>
    </div>
  );
}
export function ResponsiveAppLogo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0 justify-center items-center mx-auto ",
        className
      )}
    >
      <h1 className="text-3xl font-bold text-center relative bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hover:from-secondary hover:to-primary whitespace-nowrap">
        {orgConfig.shortName}
      </h1>
      <h2 className="text-base font-semibold capitalize text-center">
        {appConfig.name}
      </h2>
    </div>
  );
}

export function ApplicationInfo({
  className,
  children,
  imgClassName,
}: {
  className?: string;
  children?: React.ReactNode;
  imgClassName?: string;
}) {
  return (
    <div className={cn("inline-flex gap-2", className)}>
      <ApplicationSvgLogo className={cn("size-8", imgClassName)} aria-label={orgConfig.shortName} />
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">{appConfig.name}</span>
        <span className="truncate text-xs text-muted-foreground font-medium">
          {orgConfig.mailSuffix}
        </span>
      </div>
      {children}
    </div>
  );
}
export function ApplicationSquareLogo({
  className,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Avatar className={cn("inline-flex gap-2 size-8 rounded-lg", className)}>
      <AvatarImage src="/logo-square.webp" alt={appConfig.name} />
      <AvatarFallback className="flex items-center justify-center rounded-lg text-3xl font-bold text-center relative bg-gradient-to-r from-primary to-sky-500 bg-clip-text text-transparent hover:from-sky-500 hover:to-primary whitespace-nowrap">
        {orgConfig.shortName.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}


export function ApplicationSvgLogo(props: React.SVGProps<SVGSVGElement>) {
  return <svg xmlns="http://www.w3.org/2000/svg" data-logo="logo" viewBox="0 0 41 41" {...props}>
    <path
      id="logogram"
      style={{
        fill: "var(--primary, #7F57F1)"
      }}
      fillRule="evenodd"
      d="M9.005 3.678c-1.43 1-2.724 2.183-3.847 3.514 4.59-.426 10.42.27 17.189 3.655 7.229 3.614 13.05 3.736 17.1 2.955a20 20 0 0 0-1.378-3.2c-4.637.49-10.582-.158-17.51-3.622-4.4-2.2-8.279-3.106-11.554-3.302M35.36 6.747A19.95 19.95 0 0 0 20.453.08c-1.74 0-3.428.222-5.037.64 2.18.594 4.494 1.464 6.931 2.682 5.073 2.536 9.452 3.353 13.013 3.345m4.953 10.961c-4.894.966-11.652.768-19.755-3.284-7.575-3.787-13.605-3.74-17.671-2.836q-.315.07-.615.147a20 20 0 0 0-1.263 3.64q.49-.132 1.01-.248c4.933-1.096 11.904-1.048 20.328 3.164 7.576 3.788 13.605 3.74 17.672 2.836q.21-.045.411-.095a20.3 20.3 0 0 0-.117-3.324m-.536 7.544c-4.846.848-11.407.522-19.219-3.383-7.575-3.788-13.605-3.74-17.671-2.837-.903.2-1.715.445-2.431.703l-.003.345c0 11.046 8.954 20 20 20 9.257 0 17.045-6.29 19.324-14.828"
      clipRule="evenodd"
    ></path>
  </svg>
}