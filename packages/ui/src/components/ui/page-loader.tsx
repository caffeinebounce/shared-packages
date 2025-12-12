import { cn } from "../../utils";
import { Spinner } from "./spinner";

export interface PageLoaderProps extends React.ComponentProps<"div"> {
  /** Optional message to show below the spinner */
  message?: string;
}

function PageLoader({ className, message, ...props }: PageLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] gap-3",
        className,
      )}
      {...props}
    >
      <Spinner size="lg" />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

export { PageLoader };
