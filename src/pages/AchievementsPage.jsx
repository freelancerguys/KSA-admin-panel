import CmsPage from '../components/CmsPage';

export default function AchievementsPage() {
  return (
    <CmsPage
      title="Achievements"
      subtitle="Add and edit medals, championships, and student accomplishments."
      endpoint="achievements"
      fields={['title', 'description']}
      dateFields={['achievementDate']}
      numberFields={['order']}
    />
  );
}
