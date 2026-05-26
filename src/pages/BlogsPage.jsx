import CmsPage from '../components/CmsPage';

export default function BlogsPage() {
  return (
    <CmsPage
      title="Blog Management"
      subtitle="Create, edit, and publish articles for the academy website."
      endpoint="blogs"
      fields={['title', 'excerpt', 'content']}
      imageField="thumbnail"
      richField="content"
      showPublishedToggle
    />
  );
}
