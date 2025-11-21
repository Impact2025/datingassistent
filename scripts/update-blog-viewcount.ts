import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'studio-1884662658-29957',
  appId: '1:695820370437:web:e366561d1e887f83e7926c',
  apiKey: 'AIzaSyDFXpu74SsXvkiYaD5iPCoro3rCLKJ9vCo',
  authDomain: 'studio-1884662658-29957.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '695820370437',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateBlogViewCounts() {
  try {
    console.log('Starting to update blog view counts...');

    const blogsRef = collection(db, 'blogs');
    const querySnapshot = await getDocs(blogsRef);

    let updatedCount = 0;

    for (const docSnapshot of querySnapshot.docs) {
      const blogData = docSnapshot.data();
      
      // Check if viewCount field exists
      if (blogData.viewCount === undefined) {
        // Add viewCount field with default value of 0
        await updateDoc(doc(db, 'blogs', docSnapshot.id), {
          viewCount: 0
        });
        console.log(`✓ Updated blog: "${blogData.title}" with viewCount: 0`);
        updatedCount++;
      } else {
        console.log(`→ Blog "${blogData.title}" already has viewCount field`);
      }
    }

    console.log(`\n✓ Updated ${updatedCount} blogs with viewCount field!`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating blog view counts:', error);
    process.exit(1);
  }
}

updateBlogViewCounts();