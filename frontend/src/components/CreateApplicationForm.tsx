import { createApplication } from "../api/applications";
import type { Application, ApplicationCreate } from "../types/application";
import ApplicationForm from "./ApplicationForm";

interface CreateApplicationFormProps {
  onCreated: (application: Application) => void;
  onCancel: () => void;
}

function CreateApplicationForm({
  onCreated,
  onCancel,
}: CreateApplicationFormProps) {
  async function handleSubmit(application: ApplicationCreate) {
    const createdApplication = await createApplication(application);
    onCreated(createdApplication);
  }

  return (
    <ApplicationForm
      title="Add application"
      description="Record a new internship or job application."
      submitLabel="Save application"
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
}

export default CreateApplicationForm;
