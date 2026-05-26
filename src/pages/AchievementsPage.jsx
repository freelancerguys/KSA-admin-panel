import CmsPage from '../components/CmsPage';

export default function AchievementsPage() {
  return (
    <CmsPage
      title="Achievements"
      subtitle="Showcase medals, championships, and student accomplishments."
      endpoint="achievements"
      fields={['title', 'description']}
    />
  );
}
