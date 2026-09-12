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
      title="Bewerbung hinzufügen"
      description="Eine neue Praktikums- oder Stellenbewerbung erfassen."
      submitLabel="Bewerbung speichern"
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
}

export default CreateApplicationForm;
