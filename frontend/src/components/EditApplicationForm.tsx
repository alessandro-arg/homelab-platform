import { updateApplication } from "../api/applications";
import type { Application, ApplicationCreate } from "../types/application";
import ApplicationForm from "./ApplicationForm";

interface EditApplicationFormProps {
  application: Application;
  onUpdated: (application: Application) => void;
  onCancel: () => void;
}

function EditApplicationForm({
  application,
  onUpdated,
  onCancel,
}: EditApplicationFormProps) {
  async function handleSubmit(values: ApplicationCreate) {
    const updatedApplication = await updateApplication(application.id, values);

    onUpdated(updatedApplication);
  }

  return (
    <ApplicationForm
      title="Edit application"
      description={`Update the application for ${application.company_name}.`}
      submitLabel="Save changes"
      initialValues={application}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
}

export default EditApplicationForm;
