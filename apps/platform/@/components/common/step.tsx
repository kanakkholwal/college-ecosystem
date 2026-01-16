export const StaticStep = ({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children?: React.ReactNode;
}) => {
  return (
    <div className="flex gap-6">
      <div className="flex flex-col items-center">
        <p className="flex size-8 flex-none select-none items-center justify-center rounded-full border border-neutral-400/20 bg-neutral-100 text-sm font-medium text-neutral-700 dark:border-neutral-400/10 dark:bg-neutral-800 dark:text-neutral-50 dark:hover:bg-neutral-800/80">
          {step}
        </p>
        <div className="relative my-2 h-full w-px rounded-full bg-neutral-200 dark:bg-neutral-700" />
      </div>
      <div className="mb-4 w-full @container">
        <h6 className="mb-4 pb-3 border-b ml-1 text-lg font-medium tracking-tight text-neutral-700 dark:text-neutral-50">
          {title}
        </h6>
        {children}
      </div>
    </div>
  );
};
