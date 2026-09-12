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
      key={application.id}
      title="Bewerbung bearbeiten"
      description={`Bewerbung bei ${application.company_name} bearbeiten.`}
      submitLabel="Änderungen speichern"
      initialValues={application}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
}

export default EditApplicationForm;
