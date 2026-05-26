import CmsPage from '../components/CmsPage';

export default function ActivitiesPage() {
  return (
    <CmsPage
      title="Activities"
      subtitle="Add, edit, and post academy events and training activities."
      endpoint="activities"
      fields={['title', 'caption', 'description']}
      dateFields={['eventDate']}
      numberFields={['order']}
    />
  );
}
