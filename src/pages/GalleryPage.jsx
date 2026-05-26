import CmsPage from '../components/CmsPage';

export default function GalleryPage() {
  return (
    <CmsPage
      title="Gallery"
      subtitle="Upload photos for the public gallery section."
      endpoint="gallery"
      fields={['title', 'category']}
    />
  );
}
