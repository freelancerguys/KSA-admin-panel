import CmsPage from '../components/CmsPage';

export default function GalleryPage() {
  return (
    <CmsPage
      title="Gallery"
      subtitle="Upload and edit photos for the public gallery section."
      endpoint="gallery"
      fields={['title', 'category']}
      numberFields={['order']}
    />
  );
}
