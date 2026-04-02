import { getStorage, ref, getDownloadURL } from 'firebase/storage'
import { app } from './firebase'

const storage = getStorage(app)

export async function getAudioUrl(audioFile: string): Promise<string> {
  const audioRef = ref(storage, `audio/${audioFile}`)
  return getDownloadURL(audioRef)
}
