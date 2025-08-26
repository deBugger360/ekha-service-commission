import PhotoSwipeLightbox from '/assets/vendor/photoswipe/photoswipe-lightbox.esm.js';
import PhotoSwipeDynamicCaption from '/assets/vendor/photoswipe/photoswipe-dynamic-caption-plugin.esm.js';

 const galleryEl = document.getElementById('gallery');
 const anchors = Array.from(galleryEl.querySelectorAll('a'));

 // preload each image to get accurate naturalWidth / naturalHeight
 const loadMeta = (href, imgEl) => new Promise((resolve) => {
   const img = new Image();
   img.onload = () => resolve({ width: img.naturalWidth || img.width || 1600, height: img.naturalHeight || img.height || 1067 });
   img.onerror = () => resolve({ width: imgEl?.naturalWidth || 1600, height: imgEl?.naturalHeight || 1067 });
   img.src = href;
 });

 (async () => {
   await Promise.all(anchors.map(async (a) => {
     if (!a.dataset.pswpWidth || !a.dataset.pswpHeight) {
       const meta = await loadMeta(a.href, a.querySelector('img'));
       a.dataset.pswpWidth = meta.width;
       a.dataset.pswpHeight = meta.height;
     }
   }));

   const lightbox = new PhotoSwipeLightbox({
     gallery: '#gallery',
     children: 'a',
     pswpModule: () => import('/assets/vendor/photoswipe/photoswipe.esm.js')
   });

   // instantiate plugin (class)
   new PhotoSwipeDynamicCaption(lightbox, {
     type: 'auto',
     captionContent: (slide) => {
       const el = slide?.data?.element;
       const anchor = (el && el.tagName === 'A') ? el : (el && el.querySelector ? el.querySelector('a') : null);
       return (anchor && anchor.dataset?.pswpCaption) || (anchor && anchor.querySelector('img')?.alt) || '';
     }
   });

   lightbox.init();
 })();