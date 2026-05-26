import CmsPage from '../components/CmsPage';

export default function ActivitiesPage() {
  return (
    <CmsPage
      title="Activities"
      subtitle="Post recent academy events and training activities."
      endpoint="activities"
      fields={['title', 'caption', 'description']}
    />
  );
}
