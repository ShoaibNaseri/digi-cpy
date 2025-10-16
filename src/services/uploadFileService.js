import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/firebase/config'

export async function uploadFile(file, path) {
  if (!file || !path) throw new Error('File and path are required')
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  return await getDownloadURL(storageRef)
}
