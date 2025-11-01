import { StatusAlert } from "@/components/ui/StatusAlert";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface UploadStatusProps {
  error: string | null;
  loading: boolean;
}

export function UploadStatus({ error, loading }: UploadStatusProps) {
  if (error) {
    return <StatusAlert type="error" message={error} />;
  }

  if (loading) {
    return (
      <LoadingSpinner 
        message="Processing your resume..." 
        subMessage="Extracting skills, experience & projects"
      />
    );
  }

  return null;
}
